import React, { useState, useEffect } from 'react';
import { User, Screen } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { WalletIcon } from './icons/WalletIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { UserIcon } from './icons/UserIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';
import { ExchangeIcon } from './icons/ExchangeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SunIcon } from './icons/SunIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { StarIcon } from './icons/StarIcon';

interface WalletScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

const placeholder = {
    userID: 'EB123456',
    walletCoins: 12500,
    walletMoney: '125.00',
    todaysEarnings: '1.50',
    monthlyEarnings: '28.75',
    lifetimeEarnings: '125.00'
};

const transactions = [
    { type: 'credit', title: 'Daily Check-In Reward', date: 'Oct 26, 2023', amount: 10, isCoin: true },
    { type: 'credit', title: 'Watch & Earn Reward', date: 'Oct 26, 2023', amount: 5, isCoin: true },
    { type: 'debit', title: 'Withdraw Request', date: 'Oct 25, 2023', amount: 50.00, isCoin: false },
    { type: 'credit', title: 'Scratch Card Win', date: 'Oct 25, 2023', amount: 25, isCoin: true },
    { type: 'credit', title: 'Spin & Win Reward', date: 'Oct 24, 2023', amount: 15, isCoin: true },
    { type: 'credit', title: 'Referral Bonus', date: 'Oct 23, 2023', amount: 100, isCoin: true },
];

const ActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-sm text-center cursor-pointer transition-transform hover:scale-105">
        <div className="text-[#FF6B00] mb-1">{icon}</div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
    </div>
);

const EarningCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
     <div className="bg-white p-3 rounded-xl shadow-sm flex items-center space-x-3">
        <div className="bg-orange-100 p-2 rounded-lg text-[#FF6B00]">
            {icon}
        </div>
        <div>
            <p className="font-bold text-gray-800 text-sm md:text-base">₹{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);


const WalletScreen: React.FC<WalletScreenProps> = ({ user, onNavigate, onBack }) => {
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateCard(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
            {/* Header */}
            <header className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={onBack} className="text-gray-600 hover:text-[#FF6B00]">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-[#1B1B1B]">My Wallet</h1>
                    <div className="text-gray-600">
                        <WalletIcon className="w-7 h-7" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4">
                {/* Main Wallet Card */}
                <section className={`bg-gradient-to-br from-[#FF8A3B] to-[#FFD700] text-white p-5 rounded-2xl shadow-lg mb-6 transition-all duration-500 ${animateCard ? 'animate-fade-scale-in' : 'opacity-0'}`}>
                    <div className="mb-4">
                        <p className="text-sm opacity-90">Total Balance</p>
                        <p className="text-4xl font-bold">₹{placeholder.walletMoney}</p>
                        <p className="text-md opacity-90 mt-1">{placeholder.walletCoins.toLocaleString()} Coins</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-xs opacity-80">User ID: {placeholder.userID}</p>
                        <button className="bg-white text-[#FF6B00] font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
                            Withdraw
                        </button>
                    </div>
                </section>

                {/* Action Buttons */}
                <section className="grid grid-cols-3 gap-3 mb-6">
                    <ActionButton icon={<ExchangeIcon className="w-6 h-6" />} label="Convert Coins" />
                    <ActionButton icon={<HistoryIcon className="w-6 h-6" />} label="Withdraw History" />
                    <ActionButton icon={<ChartBarIcon className="w-6 h-6" />} label="Transaction Summary" />
                </section>

                {/* Earning Details */}
                 <section className="mb-6">
                     <h2 className="text-lg font-bold text-gray-800 mb-3">Earning Details</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <EarningCard icon={<SunIcon className="w-6 h-6" />} value={placeholder.todaysEarnings} label="Today's Earnings" />
                        <EarningCard icon={<CalendarDaysIcon className="w-6 h-6" />} value={placeholder.monthlyEarnings} label="Monthly Earnings" />
                        <EarningCard icon={<StarIcon className="w-6 h-6" />} value={placeholder.lifetimeEarnings} label="Lifetime Earnings" />
                     </div>
                </section>

                {/* Recent Transactions */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</h2>
                    <div className="bg-white rounded-xl shadow-sm">
                        {transactions.map((t, index) => (
                            <div key={index} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms`}}>
                                <div className={t.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                                    {t.type === 'credit' ? <PlusCircleIcon className="w-8 h-8"/> : <MinusCircleIcon className="w-8 h-8" />}
                                </div>
                                <div className="flex-grow ml-4">
                                    <p className="font-semibold text-gray-800">{t.title}</p>
                                    <p className="text-xs text-gray-500">{t.date}</p>
                                </div>
                                <p className={`font-bold ${t.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type === 'credit' ? '+' : '-'}
                                    {t.isCoin ? `${t.amount} Coins` : `₹${t.amount.toFixed(2)}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Bottom Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl z-30">
                <div className="flex justify-around items-center container mx-auto px-4 py-2">
                    <button onClick={() => onNavigate('Home')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <HomeIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Home</span>
                    </button>
                    <button onClick={() => onNavigate('Wallet')} className="flex flex-col items-center text-[#FF6B00] hover:text-orange-600 transition-colors">
                        <WalletIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-bold">Wallet</span>
                    </button>
                    <button onClick={() => onNavigate('Leaderboard')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <LeaderboardIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Leaderboard</span>
                    </button>
                    <button onClick={() => onNavigate('Profile')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <UserIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Profile</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default WalletScreen;
