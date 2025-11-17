import React from 'react';
import { FireIcon } from './icons/FireIcon';
import { CoinIcon } from './icons/CoinIcon';

interface DailyBonusModalProps {
    streak: number;
    amount: number;
    onClose: () => void;
}

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ streak, amount, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-scale-in">
            <div className="bg-gradient-to-br from-gray-800 via-slate-900 to-gray-800 rounded-2xl p-8 text-center w-full max-w-sm shadow-2xl border border-amber-500/50">
                <div className="flex items-center justify-center text-amber-400 mb-4">
                    <FireIcon className="w-12 h-12 mr-2" />
                    <h2 className="text-4xl font-extrabold text-white">Day {streak}</h2>
                </div>
                <p className="text-xl text-gray-300 font-semibold mb-6">Daily Login Streak!</p>
                
                <p className="text-lg text-gray-200 mb-2">You've earned a bonus of</p>
                <div className="flex items-center justify-center text-5xl font-bold text-white mb-8 bg-white/10 rounded-xl p-4">
                    <CoinIcon className="w-12 h-12 mr-3" />
                    <span>{amount}</span>
                </div>
                
                <button 
                    onClick={onClose} 
                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-full hover:bg-amber-600 transition-transform hover:scale-105 shadow-lg"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};

export default DailyBonusModal;
