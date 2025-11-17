
import React from 'react';
import { EarnBharatLogo } from './icons/EarnBharatLogo';
import { CoinIcon } from './icons/CoinIcon';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 overflow-hidden">
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Animated Box and Logo */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
          {/* Logo in the center (initially hidden by the box) */}
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ animationDelay: '0.4s' }}>
            <div className="animate-logo-zoom" style={{ animationDelay: '0.4s' }}>
                <EarnBharatLogo className="w-36 h-36 md:w-44 md:h-44" />
            </div>
          </div>

          {/* Box Lids */}
          <div className="absolute inset-0 z-20 overflow-hidden">
            <div 
                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-amber-400 to-yellow-500 shadow-lg animate-open-box-top"
                style={{ animationDelay: '0.2s' }}
            ></div>
            <div 
                className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-400 to-yellow-500 shadow-lg animate-open-box-bottom"
                style={{ animationDelay: '0.2s' }}
            ></div>
          </div>

          {/* Coin Burst Effect */}
          <div className="absolute inset-0 z-0">
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * 2 * Math.PI;
              const x = Math.cos(angle) * 50;
              const y = Math.sin(angle) * 50;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-coin-burst"
                  style={{
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${1.2 + i * 0.05}s`,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <CoinIcon className="w-6 h-6" />
                </div>
              );
            })}
          </div>
        </div>

        {/* App Name and Tagline */}
        <div 
          className="text-center animate-text-fade-in"
          style={{ animationDelay: '2.2s' }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wider">
            Earn<span className="text-amber-400">Bharat</span>
          </h1>
        </div>
        <div
          className="text-center animate-text-fade-in"
          style={{ animationDelay: '2.5s' }}
        >
          <p className="mt-2 text-lg md:text-xl text-gray-300 font-light">
            आपकी कमाई, आपका सम्मान
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default SplashScreen;