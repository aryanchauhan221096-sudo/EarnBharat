import React, { useState, useEffect } from 'react';
import { EarnBharatLogo } from './icons/EarnBharatLogo';
import { NotificationIcon } from './icons/NotificationIcon';
import { CoinIcon } from './icons/CoinIcon';
import { PlayIcon } from './icons/PlayIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ScratchIcon } from './icons/ScratchIcon';
import { SpinWheelIcon } from './icons/SpinWheelIcon';
import { TasksIcon } from './icons/TasksIcon';
import { ReferralIcon } from './icons/ReferralIcon';
import { QuizIcon } from './icons/QuizIcon';
import { MysteryBoxIcon } from './icons/MysteryBoxIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { HomeIcon } from './icons/HomeIcon';
import { WalletIcon } from './icons/WalletIcon';
import { UserIcon } from './icons/UserIcon';
import { User, Screen } from '../App';


interface HomeScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

const TaskCard: React.FC<{ icon: React.ReactNode; title: string; }> = ({ icon, title }) => (
    <div className="bg-gradient-to-br from-[#FF8A3B] to-[#FFD700] p-4 rounded-2xl shadow-lg text-center text-white flex flex-col items-center justify-center aspect-square transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
        <div className="mb-2">{icon}</div>
        <h3 className="font-bold text-sm md:text-base">{title}</h3>
    </div>
);

const HighlightCard: React.FC<{ icon: React.ReactNode; value: string; label: string; }> = ({ icon, value, label }) => (
    <div className="bg-white p-3 rounded-xl shadow flex items-center space-x-3">
        <div className="bg-orange-100 p-2 rounded-lg text-[#FF6B00]">
            {icon}
        </div>
        <div>
            <p className="font-bold text-gray-800 text-sm md:text-base">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate }) => {
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => {
        // Trigger animation shortly after component mounts
        const timer = setTimeout(() => setAnimateCard(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Firebase Placeholder Values
    const placeholder = {
        userID: 'EB123456',
        walletCoins: 12500,
        walletMoney: '125.00',
        todaysEarnings: 150,
        totalCoins: 85000,
        userRank: '#25',
        levelProgress: 75
    };

    return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <EarnBharatLogo className="w-9 h-9" />
            <h1 className="text-xl font-extrabold text-[#1B1B1B]">
                Earn<span className="text-[#FF6B00]">Bharat</span>
            </h1>
          </div>
          <button className="relative text-gray-600 hover:text-[#FF6B00]">
            <NotificationIcon className="w-7 h-7" />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        
        {/* User Card */}
        <section className={`bg-white p-5 rounded-2xl shadow-lg mb-6 transform transition-all duration-500 ${animateCard ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <div className="flex items-center mb-4">
                <img src={`https://i.pravatar.cc/150?u=${placeholder.userID}`} alt="Profile" className="w-16 h-16 rounded-full mr-4 border-2 border-amber-300" />
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500">User ID: {placeholder.userID}</p>
                </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <p className="text-sm text-gray-500">Wallet Balance</p>
                    <p className="text-2xl font-bold text-[#1B1B1B]">₹{placeholder.walletMoney} <span className="text-base font-medium text-gray-600">({placeholder.walletCoins} Coins)</span></p>
                </div>
                <button className="bg-[#FF6B00] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-orange-600 transition-all duration-200 transform hover:scale-105">
                    Withdraw
                </button>
            </div>
        </section>

        {/* Earning Task Grid */}
        <section className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            <TaskCard icon={<PlayIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Watch & Earn" />
            <TaskCard icon={<CalendarIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Daily Check-In" />
            <TaskCard icon={<ScratchIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Scratch Card" />
            <TaskCard icon={<SpinWheelIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Spin & Win" />
            <TaskCard icon={<TasksIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Tasks & Offers" />
            <TaskCard icon={<ReferralIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Referral Program" />
            <TaskCard icon={<QuizIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Quiz & Games" />
            <TaskCard icon={<MysteryBoxIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Mystery Box" />
        </section>

        {/* Highlights Section */}
        <section>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <HighlightCard icon={<CoinIcon className="w-6 h-6" />} value={placeholder.todaysEarnings.toString()} label="Today's Earnings" />
                <HighlightCard icon={<TrophyIcon className="w-6 h-6" />} value={placeholder.totalCoins.toString()} label="Total Coins Earned" />
                <HighlightCard icon={<LeaderboardIcon className="w-6 h-6" />} value={placeholder.userRank} label="User Rank" />
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-700">Level Progress</p>
                    <p className="text-sm font-bold text-[#FF6B00]">{placeholder.levelProgress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FF6B00] h-2.5 rounded-full" style={{ width: `${placeholder.levelProgress}%` }}></div>
                </div>
            </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl z-30">
        <div className="flex justify-around items-center container mx-auto px-4 py-2">
            <button onClick={() => onNavigate('Home')} className="flex flex-col items-center text-[#FF6B00] hover:text-orange-600 transition-colors">
                <HomeIcon className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold">Home</span>
            </button>
            <button onClick={() => onNavigate('Wallet')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                <WalletIcon className="w-7 h-7 mb-1" />
                <span className="text-xs font-medium">Wallet</span>
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

export default HomeScreen;