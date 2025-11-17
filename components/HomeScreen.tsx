

import React, { useState, useEffect, useRef } from 'react';
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
import { addCoins } from '../managers/CoinManager';
import { TicketIcon } from './icons/TicketIcon';
import { VideoWallIcon } from './icons/VideoWallIcon';
// FIX: The 'doc' and 'onSnapshot' functions are called directly on the db instance in v8.
import { db } from '../firebase';


interface HomeScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

const TaskCard = React.forwardRef<HTMLDivElement, { icon: React.ReactNode; title: string; onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; }>(({ icon, title, onClick }, ref) => (
    <div ref={ref} onClick={onClick} className="bg-gradient-to-br from-[#FF8A3B] to-[#FFD700] p-4 rounded-2xl shadow-lg text-center text-white flex flex-col items-center justify-center aspect-square transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
        <div className="mb-2">{icon}</div>
        <h3 className="font-bold text-sm md:text-base">{title}</h3>
    </div>
));

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

interface FlyingCoin {
    id: number;
    style: React.CSSProperties;
}

// Helper function to get date in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate }) => {
    const [animateCard, setAnimateCard] = useState(false);
    const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
    const [todaysEarnings, setTodaysEarnings] = useState(0);
    const balanceRef = useRef<HTMLDivElement>(null);
    const spinWinCardRef = useRef<HTMLDivElement>(null);

    // Placeholder for features not yet connected to backend
    const placeholder = {
        userRank: '#25',
        levelProgress: 75
    };

    const startCoinAnimation = (sourceElement: HTMLElement) => {
        const rect = sourceElement.getBoundingClientRect();
        const balanceEl = balanceRef.current;
        if (!balanceEl) return;
  
        const balanceRect = balanceEl.getBoundingClientRect();
        const endX = balanceRect.left + balanceRect.width / 2;
        const endY = balanceRect.top + balanceRect.height / 2;
  
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
  
        const newCoins: FlyingCoin[] = Array.from({ length: 7 }).map((_, i) => {
          const id = Date.now() + i;
          const randomOffsetX = (Math.random() - 0.5) * 40;
          const randomOffsetY = (Math.random() - 0.5) * 40;
  
          // FIX: Cast style object to React.CSSProperties to allow for CSS custom properties (variables)
          // which are not in the default TypeScript definition.
          const style = {
            '--start-x': `${startX + randomOffsetX}px`,
            '--start-y': `${startY + randomOffsetY}px`,
            '--end-x': `${endX}px`,
            '--end-y': `${endY}px`,
            animationDelay: `${i * 80}ms`,
          } as React.CSSProperties;
          return { id, style };
        });
  
        setFlyingCoins(prev => [...prev, ...newCoins]);
  
        setTimeout(() => {
          setFlyingCoins(prev => prev.filter(c => !newCoins.some(nc => nc.id === c.id)));
        }, 2000);
    };

    const triggerCoinAnimation = (event: React.MouseEvent<HTMLDivElement>) => {
        startCoinAnimation(event.currentTarget);
    };

    useEffect(() => {
        // Trigger main card animation shortly after component mounts
        const timer = setTimeout(() => setAnimateCard(true), 100);

        // Check for spin win reward on mount
        const spinWinReward = sessionStorage.getItem('spin_win_reward');
        if (spinWinReward) {
            if (parseInt(spinWinReward, 10) > 0) {
                // A short delay to ensure the UI is ready for the animation
                setTimeout(() => {
                    if (spinWinCardRef.current) {
                        startCoinAnimation(spinWinCardRef.current);
                    }
                }, 300);
            }
            sessionStorage.removeItem('spin_win_reward');
        }

        // New: Listener for today's earnings
        const todayDateString = getTodayDateString();
        // FIX: Use Firebase v8 syntax to reference a document.
        const dailyEarningsDocRef = db.collection('users').doc(user.uid).collection('dailyEarnings').doc(todayDateString);
        
        // FIX: Use Firebase v8 syntax for onSnapshot.
        const unsubscribe = dailyEarningsDocRef.onSnapshot((docSnapshot) => {
            if (docSnapshot.exists) {
                setTodaysEarnings(docSnapshot.data()?.coinsEarned || 0);
            } else {
                setTodaysEarnings(0); // If document doesn't exist, earnings are 0
            }
        });

        return () => {
            clearTimeout(timer);
            unsubscribe(); // Clean up the listener
        };
    }, [user.uid]);

    const handleDailyCheckIn = async (event: React.MouseEvent<HTMLDivElement>) => {
        const result = await addCoins(user.uid, 10, 'Daily Check-In Reward');
        if (result.success) {
            triggerCoinAnimation(event);
        } else {
            alert(`Failed to add coins: ${result.message}`);
        }
    };
    
    const displayUserId = `EB${user.uid.substring(0, 6).toUpperCase()}`;

    return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
      {/* Flying Coins Container */}
      {flyingCoins.map(coin => (
        <div key={coin.id} style={coin.style} className="animate-coin-fly">
            <CoinIcon className="w-6 h-6" />
        </div>
      ))}
      
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
                <img src={`https://i.pravatar.cc/150?u=${user.uid}`} alt="Profile" className="w-16 h-16 rounded-full mr-4 border-2 border-amber-300" />
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500">User ID: {displayUserId}</p>
                </div>
            </div>
            <div ref={balanceRef} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <p className="text-sm text-gray-500">Wallet Balance</p>
                    <p className="text-2xl font-bold text-[#1B1B1B]">₹{user.money.toFixed(2)} <span className="text-base font-medium text-gray-600">({user.coins.toLocaleString()} Coins)</span></p>
                </div>
                <button onClick={() => onNavigate('Wallet')} className="bg-[#FF6B00] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-orange-600 transition-all duration-200 transform hover:scale-105">
                    Withdraw
                </button>
            </div>
        </section>

        {/* Earning Task Grid */}
        <section className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            <TaskCard icon={<PlayIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Watch & Earn" onClick={() => onNavigate('WatchAndEarn')} />
            <TaskCard icon={<CalendarIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Daily Check-In" onClick={handleDailyCheckIn} />
            <TaskCard icon={<ScratchIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Scratch Card" />
            <TaskCard ref={spinWinCardRef} icon={<SpinWheelIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Spin & Win" onClick={() => onNavigate('SpinAndWin')} />
            <TaskCard icon={<TasksIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Tasks & Offers" />
            <TaskCard icon={<ReferralIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Referral Program" />
            <TaskCard icon={<QuizIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Quiz & Games" />
            <TaskCard icon={<MysteryBoxIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Mystery Box" />
        </section>

        {/* Earn More Section */}
        <section className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Earn More</h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <TaskCard icon={<QuizIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Daily Quiz" />
                <TaskCard icon={<TicketIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Lucky Draw" />
                <TaskCard icon={<VideoWallIcon className="w-8 h-8 md:w-10 md:h-10" />} title="Video Wall" />
            </div>
        </section>

        {/* Highlights Section */}
        <section>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <HighlightCard icon={<CoinIcon className="w-6 h-6" />} value={`₹${(todaysEarnings / 10).toFixed(2)}`} label="Today's Earnings" />
                <HighlightCard icon={<TrophyIcon className="w-6 h-6" />} value={user.totalEarnings.toLocaleString()} label="Total Coins Earned" />
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