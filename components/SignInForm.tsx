import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { auth, googleProvider } from '../firebase';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup,
    sendPasswordResetEmail,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}


interface SignInFormProps {
    onSwitchToSignUp: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
    const [isMobileOtp, setIsMobileOtp] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isMobileOtp && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    }, [isMobileOtp]);


    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged in App.tsx will handle the redirect
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
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            if (isMobileOtp) {
                if (!window.confirmationResult) {
                    throw new Error("OTP not sent yet or session expired.");
                }
                await window.confirmationResult.confirm(otp);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.tsx will handle the rest
        } catch (err: any) {
             let errorMessage = err.message;
            if (err.code === 'auth/internal-error') {
                errorMessage = "An internal error occurred. Please ensure Phone Number sign-in is enabled in your Firebase console.";
            }
            setError(errorMessage);
        }
        setLoading(false);
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
            // This can happen if reCAPTCHA is not resolved.
            // In a real app, provide more user-friendly feedback.
        }
        setLoading(false);
    }
    
    const handleForgotPassword = async () => {
        const userEmail = prompt("Please enter your email to receive a password reset link:");
        if (userEmail) {
            try {
                await sendPasswordResetEmail(auth, userEmail);
                alert("Password reset email sent! Please check your inbox.");
            } catch (err: any) {
                alert("Error sending password reset email: " + err.message);
            }
        }
    };


    return (
        <form onSubmit={handleFormSubmit} className="bg-white flex items-center justify-center flex-col px-6 sm:px-10 h-full text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sign In</h1>
            
            <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 my-3 border-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
                <GoogleIcon className="w-6 h-6 mr-3" />
                Sign in with Google
            </button>

            <div className="flex items-center w-full my-3">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <hr className="flex-grow border-t border-gray-300" />
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {isMobileOtp ? (
                <>
                    <div className="flex items-center bg-gray-100 w-full p-0 my-2 rounded-lg">
                        <span className="text-gray-500 pl-3">+91</span>
                        <input className="bg-transparent w-full p-3 focus:outline-none" type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required />
                    </div>
                    {otpSent && <input className="bg-gray-100 w-full p-3 my-2 rounded-lg" type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />}
                    {!otpSent && <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full mt-2 py-3 bg-gray-700 text-white rounded-lg font-semibold uppercase hover:bg-gray-800 disabled:opacity-50">Send OTP</button>}
                </>
            ) : (
                <>
                    <input className="bg-gray-100 w-full p-3 my-2 rounded-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="bg-gray-100 w-full p-3 my-2 rounded-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                </>
            )}
            
            <div id="recaptcha-container"></div>
            
            <div className="flex items-center justify-between w-full my-4">
                <label className="flex items-center text-sm text-gray-600 select-none cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    Remember Me
                </label>
                
                {!isMobileOtp && (
                    <button 
                        type="button" 
                        onClick={handleForgotPassword} 
                        className="text-sm text-gray-500 hover:text-amber-500 hover:underline"
                    >
                        Forgot your password?
                    </button>
                )}
            </div>
            
            <button type="submit" disabled={loading} className="bg-amber-500 text-white rounded-full font-semibold py-3 px-12 uppercase transition-transform hover:scale-105 disabled:opacity-50">
                {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <button 
                type="button" 
                onClick={() => setIsMobileOtp(!isMobileOtp)} 
                className="mt-6 font-semibold text-sm text-gray-600 hover:text-amber-500 hover:underline transition-colors"
            >
                {isMobileOtp ? 'Sign in with Email instead' : 'Sign in with Mobile OTP instead'}
            </button>

            {/* Mobile-only switcher */}
            <div className="mt-6 text-center md:hidden">
                <p className="mb-2 text-sm text-gray-600">Don't have an account?</p>
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="w-full max-w-xs mx-auto py-2 bg-transparent border-2 border-amber-500 text-amber-500 rounded-full font-semibold uppercase transition-transform hover:scale-105"
                >
                    Sign Up
                </button>
            </div>
        </form>
    );
};

export default SignInForm;