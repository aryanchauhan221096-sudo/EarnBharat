import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { auth, db, googleProvider } from '../firebase';
import { 
    createUserWithEmailAndPassword,
    signInWithPopup, 
    getAdditionalUserInfo,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

interface SignUpFormProps {
    onSwitchToSignIn: () => void;
}

const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] =useState('');
    const [referral, setReferral] = useState('');

    const [showGoogleDetails, setShowGoogleDetails] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isMobileSignUp, setIsMobileSignUp] = useState(true);
    const [verificationSent, setVerificationSent] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if ((isMobileSignUp || showGoogleDetails) && !window.recaptchaVerifier) {
             window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
                'size': 'invisible',
                'callback': () => {}
            });
        }
    }, [isMobileSignUp, showGoogleDetails]);

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
                setName(result.user.displayName || '');
                setEmail(result.user.email || '');
                setShowGoogleDetails(true);
            }
            // If user exists, onAuthStateChanged in App.tsx will handle login.
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let userCredential;
            if (isMobileSignUp) {
                if (!window.confirmationResult) throw new Error("Please verify your mobile number first.");
                userCredential = await window.confirmationResult.confirm(otp);
            } else {
                 userCredential = await createUserWithEmailAndPassword(auth, email, password);
                 await sendEmailVerification(userCredential.user);
                 setVerificationSent(true);
            }
            
            const user = userCredential.user;
            const referralCode = generateReferralCode();
            
            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                state,
                email: user.email || email, // Use email from auth or form
                phoneNumber: user.phoneNumber || `+91${mobile.slice(-10)}`,
                referralCode,
                appliedReferralCode: referral || null,
                createdAt: serverTimestamp(),
                bonusClaimed: false,
            });
            
            if (isMobileSignUp) {
                // For mobile sign up, they are already verified, so we can log them in by reloading.
                sessionStorage.setItem('signup_complete', 'true');
                window.location.reload();
                return; // Prevent setLoading(false) from running
            }

        } catch(err: any) {
            let errorMessage = err.message;
            if (err.code === 'auth/internal-error') {
                errorMessage = "An internal error occurred. Please ensure Phone Number sign-in is enabled in your Firebase console.";
            }
            setError(errorMessage);
        }
        setLoading(false);
    };
    
    const handleGoogleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const user = auth.currentUser;
        if (!user) {
            setError("No authenticated user found. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            const digits = mobile.replace(/\D/g, '');
            const last10 = digits.slice(-10);
            const formattedMobile = mobile && last10.length === 10 ? `+91${last10}` : '';

             // Store additional details in Firestore for the Google-signed-up user
             await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                state,
                email: user.email,
                phoneNumber: formattedMobile,
                referralCode: generateReferralCode(),
                appliedReferralCode: referral || null,
                createdAt: serverTimestamp(),
                bonusClaimed: false,
            }, { merge: true }); // Merge to not overwrite auth data
            
            // Reload page to trigger a login without showing the splash screen
            sessionStorage.setItem('signup_complete', 'true');
            window.location.reload();

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            if (window.recaptchaVerifier) {
                const digits = mobile.replace(/\D/g, '');
                const last10 = digits.slice(-10);

                if (last10.length !== 10) {
                    setError("Please enter a valid 10-digit mobile number.");
                    setLoading(false);
                    return;
                }

                const confirmationResult = await signInWithPhoneNumber(auth, `+91${last10}`, window.recaptchaVerifier);
                window.confirmationResult = confirmationResult;
                setOtpSent(true);
                alert('OTP sent to your mobile number!');
            }
        } catch (err: any) {
            let errorMessage = err.message;
            if (err.code === 'auth/internal-error') {
                errorMessage = "Could not send OTP. Please ensure Phone Number sign-in is enabled in your Firebase project's settings.";
            }
            setError(errorMessage);
        }
        setLoading(false);
    };

    const handleBackFromGoogleSignUp = () => {
        setShowGoogleDetails(false);
        setName('');
        setState('');
    };

    if (verificationSent) {
        return (
            <div className="bg-white flex items-center justify-center flex-col px-6 sm:px-10 h-full text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h1>
                <p className="text-gray-600 mb-6">A verification link has been sent to <span className="font-semibold">{email}</span>. Please check your inbox and click the link to complete your registration.</p>
                <button 
                    type="button" 
                    onClick={onSwitchToSignIn}
                    className="mt-4 bg-amber-500 text-white rounded-full font-semibold py-3 px-12 uppercase transition-transform hover:scale-105"
                >
                    Back to Sign In
                </button>
            </div>
        );
    }

    if (showGoogleDetails) {
        return (
             <form onSubmit={handleGoogleDetailsSubmit} className="bg-white flex items-center justify-center flex-col px-6 sm:px-10 h-full text-center relative">
                <button 
                    type="button" 
                    onClick={handleBackFromGoogleSignUp}
                    className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h1>
                <p className='text-gray-600 text-sm mb-4'>Please complete your registration.</p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <input className="bg-gray-100 w-full p-3 my-2 rounded-lg" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <select 
                    className="bg-gray-100 w-full p-3 my-2 rounded-lg appearance-none" 
                    value={state} 
                    onChange={e => setState(e.target.value)} 
                    required
                >
                    <option value="" disabled>Select your State</option>
                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex items-center bg-gray-100 w-full p-0 my-2 rounded-lg">
                    <span className="text-gray-500 pl-3">+91</span>
                    <input className="bg-transparent w-full p-3 focus:outline-none" type="tel" placeholder="Mobile Number (Optional)" value={mobile} onChange={e => setMobile(e.target.value)} />
                </div>
                <input className="bg-gray-100 w-full p-3 my-2 rounded-lg" type="text" placeholder="Referral Code (Optional)" value={referral} onChange={e => setReferral(e.target.value)} />
                 <div id="recaptcha-container-signup"></div>
                <button type="submit" disabled={loading} className="mt-4 bg-amber-500 text-white rounded-full font-semibold py-3 px-12 uppercase transition-transform hover:scale-105 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Sign Up'}
                </button>
             </form>
        )
    }

    return (
        <form onSubmit={handleFormSubmit} className="bg-white flex items-center justify-center flex-col px-6 sm:px-10 h-full text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Create Account</h1>
            
            <button type="button" onClick={handleGoogleSignUp} disabled={loading} className="w-full flex items-center justify-center py-3 my-3 border-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                <GoogleIcon className="w-6 h-6 mr-3" />
                Sign up with Google
            </button>
            
            <div className="flex items-center w-full my-3">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <hr className="flex-grow border-t border-gray-300" />
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {isMobileSignUp ? (
                <>
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <select 
                        className="bg-gray-100 w-full p-3 my-1 rounded-lg appearance-none" 
                        value={state} 
                        onChange={e => setState(e.target.value)} 
                        required
                    >
                        <option value="" disabled>Select your State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex w-full my-1 space-x-2">
                        <div className="flex items-center bg-gray-100 w-full rounded-lg">
                            <span className="text-gray-500 pl-3">+91</span>
                            <input className="bg-transparent w-full p-3 focus:outline-none" type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required disabled={otpSent}/>
                        </div>
                        <button type="button" onClick={handleSendOtp} disabled={otpSent || loading} className="flex-shrink-0 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400">
                            {otpSent ? 'Sent' : 'Get OTP'}
                        </button>
                    </div>
                    {otpSent && <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />}
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="text" placeholder="Referral Code (Optional)" value={referral} onChange={e => setReferral(e.target.value)}/>
                </>
            ) : (
                <>
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <select 
                        className="bg-gray-100 w-full p-3 my-1 rounded-lg appearance-none" 
                        value={state} 
                        onChange={e => setState(e.target.value)} 
                        required
                    >
                        <option value="" disabled>Select your State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <input className="bg-gray-100 w-full p-3 my-1 rounded-lg" type="text" placeholder="Referral Code (Optional)" value={referral} onChange={e => setReferral(e.target.value)} />
                </>
            )}
            
            <div id="recaptcha-container-signup"></div>

            <button type="submit" disabled={loading} className="mt-4 bg-amber-500 text-white rounded-full font-semibold py-3 px-12 uppercase transition-transform hover:scale-105 disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <button 
                type="button" 
                onClick={() => setIsMobileSignUp(!isMobileSignUp)} 
                className="mt-6 font-semibold text-sm text-gray-600 hover:text-amber-500 hover:underline transition-colors"
            >
                {isMobileSignUp ? 'Sign up with Email instead' : 'Sign up with Mobile OTP instead'}
            </button>

            {/* Mobile-only switcher */}
            <div className="mt-6 text-center md:hidden">
                <p className="mb-2 text-sm text-gray-600">Already have an account?</p>
                <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="w-full max-w-xs mx-auto py-2 bg-transparent border-2 border-amber-500 text-amber-500 rounded-full font-semibold uppercase transition-transform hover:scale-105"
                >
                    Sign In
                </button>
            </div>
        </form>
    );
};

export default SignUpForm;