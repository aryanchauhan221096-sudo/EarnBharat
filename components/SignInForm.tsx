

import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { auth, googleProvider } from '../firebase';
// FIX: Import firebase v8 namespace for types and constants.
// FIX: Use namespace import for firebase compat app and import auth for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// FIX: Use firebase namespace for auth types.
declare global {
    interface Window {
        recaptchaVerifier?: firebase.auth.RecaptchaVerifier;
        confirmationResult?: firebase.auth.ConfirmationResult;
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
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize reCAPTCHA verifier only once when the component mounts.
        // The verifier is invisible and will be triggered by signInWithPhoneNumber.
        if (!window.recaptchaVerifier) {
            // FIX: Use Firebase v8 syntax for RecaptchaVerifier constructor.
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-global', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved.
                }
            });
        }
    }, []);


    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            // FIX: Use Firebase v8 syntax for setPersistence and persistence constants.
            await auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            // FIX: Use Firebase v8 syntax for signInWithPopup.
            await auth.signInWithPopup(googleProvider);
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
            // FIX: Use Firebase v8 syntax for setPersistence and persistence constants.
            await auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
            if (isMobileOtp) {
                if (!window.confirmationResult) {
                    throw new Error("OTP not sent yet or session expired.");
                }
                await window.confirmationResult.confirm(otp);
            } else {
                // FIX: Use Firebase v8 syntax for signInWithEmailAndPassword.
                await auth.signInWithEmailAndPassword(email, password);
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
            const verifier = window.recaptchaVerifier;
            if (!verifier) {
                throw new Error("reCAPTCHA verifier not initialized. Please refresh the page.");
            }
            
            const digits = mobile.replace(/\D/g, '');
            const last10 = digits.slice(-10);

            if (last10.length !== 10) {
                setError("Please enter a valid 10-digit mobile number.");
                setLoading(false);
                return;
            }

            // FIX: Use Firebase v8 syntax for signInWithPhoneNumber.
            const confirmationResult = await auth.signInWithPhoneNumber(`+91${last10}`, verifier);
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            alert('OTP sent to your mobile number!');

        } catch (err: any) {
            let errorMessage = err.message;
            if (err.code === 'auth/internal-error') {
                errorMessage = "Could not send OTP. Please ensure Phone Number sign-in is enabled in your Firebase project's settings.";
            }
            if (err.message.includes("auth/invalid-phone-number")) {
                errorMessage = "The phone number is not valid. Please enter a valid 10-digit number."
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
                // FIX: Use Firebase v8 syntax for sendPasswordResetEmail.
                await auth.sendPasswordResetEmail(userEmail);
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
                        <input className="bg-transparent w-full p-3 focus:outline-none text-gray-800 placeholder:text-gray-500" type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required />
                    </div>
                    {otpSent && <input className="bg-gray-100 w-full p-3 my-2 rounded-lg text-gray-800 placeholder:text-gray-500" type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />}
                    {!otpSent && <button type="button" onClick={handleSendOtp} disabled={loading} className="w-full mt-2 py-3 bg-gray-700 text-white rounded-lg font-semibold uppercase hover:bg-gray-800 disabled:opacity-50">Send OTP</button>}
                </>
            ) : (
                <>
                    <input className="bg-gray-100 w-full p-3 my-2 rounded-lg text-gray-800 placeholder:text-gray-500" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div className="relative w-full my-2">
                        <input 
                            className="bg-gray-100 w-full p-3 rounded-lg text-gray-800 placeholder:text-gray-500 pr-10" 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </>
            )}
            
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