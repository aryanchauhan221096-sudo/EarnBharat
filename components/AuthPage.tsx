import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthPage: React.FC = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wider">
            Earn<span className="text-amber-500">Bharat</span>
          </h1>
      </div>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-4xl min-h-[600px] overflow-hidden`}>
        {/* Sign Up Form Container */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-10 ${isRightPanelActive ? 'opacity-100 z-20 md:translate-x-full' : 'opacity-0 -z-10'}`}>
          <SignUpForm onSwitchToSignIn={() => setIsRightPanelActive(false)} />
        </div>
        {/* Sign In Form Container */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-20 ${isRightPanelActive ? 'opacity-0 -z-10' : 'opacity-100'}`}>
          <SignInForm onSwitchToSignUp={() => setIsRightPanelActive(true)} />
        </div>

        {/* Overlay Container - Hidden on mobile */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-40 hidden md:block ${isRightPanelActive ? '-translate-x-full' : ''}`}>
          <div className={`bg-gradient-to-br from-gray-900 to-slate-800 text-white relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            {/* Sign In Overlay */}
            <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-opacity duration-700 ease-in-out ${isRightPanelActive ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-3xl font-bold text-amber-400">Welcome Back!</h1>
              <p className="text-md my-4">To keep connected with us please login with your personal info</p>
              <button onClick={() => setIsRightPanelActive(true)} className="bg-transparent border-2 border-white rounded-full text-white font-semibold py-2 px-8 uppercase transition-transform hover:scale-105">Sign Up</button>
            </div>
            {/* Sign Up Overlay */}
            <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 right-0 h-full w-1/2 transition-opacity duration-700 ease-in-out ${isRightPanelActive ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-3xl font-bold text-amber-400">Hello, Friend!</h1>
              <p className="text-md my-4">Enter your personal details and start your journey with us</p>
              <button onClick={() => setIsRightPanelActive(false)} className="bg-transparent border-2 border-white rounded-full text-white font-semibold py-2 px-8 uppercase transition-transform hover:scale-105">Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
