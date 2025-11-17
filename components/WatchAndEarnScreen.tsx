

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../App';
import { addCoins } from '../managers/CoinManager';
import { db } from '../firebase';
// FIX: Import firebase v8 namespace for Timestamp type. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CoinIcon } from './icons/CoinIcon';
import { VideoAdIcon } from './icons/VideoAdIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface WatchAndEarnScreenProps {
  user: User;
  onBack: () => void;
}

interface RewardTransaction {
    id: string;
    amount: number;
    date: string;
}

const WatchAndEarnScreen: React.FC<WatchAndEarnScreenProps> = ({ user, onBack }) => {
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [adCountdown, setAdCountdown] = useState(30);
    const [isRewardGranted, setIsRewardGranted] = useState(false);
    const [rewardStatus, setRewardStatus] = useState<'pending' | 'success' | 'error' | null>(null);
    const [rewardHistory, setRewardHistory] = useState<RewardTransaction[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // Real-time listener for reward history
        // FIX: Use Firebase v8 syntax to reference a collection.
        const transactionsColRef = db.collection('users').doc(user.uid).collection('transactions');
        
        // FIX: The previous query with `where` and `orderBy` on different fields
        // required a composite index. To avoid this error, we fetch all transactions
        // ordered by date and then filter for the correct category on the client.
        // FIX: Use Firebase v8 syntax for querying.
        const q = transactionsColRef.orderBy('createdAt', 'desc');

        // FIX: Use Firebase v8 syntax for onSnapshot.
        const unsubscribe = q.onSnapshot((querySnapshot) => {
            const history: RewardTransaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Client-side filtering
                if (data.category === 'watch_and_earn') {
                    // FIX: Use firebase.firestore.Timestamp for type casting.
                    const createdAt = data.createdAt as firebase.firestore.Timestamp;
                    history.push({
                        id: doc.id,
                        amount: data.amount,
                        date: createdAt ? createdAt.toDate().toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                        }) : 'Just now',
                    });
                }
            });
            setRewardHistory(history);
            setLoadingHistory(false);
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [user.uid]);

    const grantReward = async () => {
        if (isRewardGranted) return; // Guard against multiple calls
        setIsRewardGranted(true);
        setRewardStatus('pending');
        
        const result = await addCoins(user.uid, 20, 'Watch & Earn Reward', 'watch_and_earn');
        
        if (result.success) {
            console.log("Reward of 20 coins granted!");
            setRewardStatus('success');
        } else {
            console.error("Failed to grant reward:", result.message);
            setRewardStatus('error');
        }
    };

    useEffect(() => {
        if (isAdPlaying && adCountdown > 0) {
            intervalRef.current = window.setInterval(() => {
                setAdCountdown(prev => prev - 1);
            }, 1000);
        } else if (adCountdown === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            grantReward();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAdPlaying, adCountdown]);
    
    const handleWatchAd = () => {
        setIsAdLoading(true);
        setRewardStatus(null);
        setTimeout(() => {
            setIsAdLoading(false);
            setIsAdPlaying(true);
            setAdCountdown(30);
            setIsRewardGranted(false);
        }, 1500); // Simulate ad loading time
    };

    const handleCloseAd = () => {
        setIsAdPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const renderHistory = () => {
        if (loadingHistory) {
            return <div className="text-center text-gray-500 p-4">Loading History...</div>;
        }
        if (rewardHistory.length === 0) {
            return <div className="text-center text-gray-500 p-4">No rewards earned yet. Watch an ad to start!</div>;
        }
        return (
            <div className="bg-white rounded-xl shadow-sm mt-6">
                {rewardHistory.map((item, index) => (
                    <div key={item.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="text-green-500"><PlusCircleIcon className="w-7 h-7" /></div>
                        <div className="flex-grow ml-3">
                            <p className="font-semibold text-gray-800">Watch & Earn Reward</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        <p className="font-bold text-green-500">+{item.amount} Coins</p>
                    </div>
                ))}
            </div>
        );
    };

    const AdOverlayContent = () => {
        switch (rewardStatus) {
            case 'pending':
                return (
                    <>
                        <h2 className="text-3xl font-bold mt-4">Processing Reward...</h2>
                        <p className="mt-2 text-yellow-300">Please wait a moment.</p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <h2 className="text-3xl font-bold mt-4">Reward Granted!</h2>
                        <p className="mt-2 text-green-400 font-semibold">Congratulations! You've earned 20 coins.</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <h2 className="text-3xl font-bold mt-4">Error</h2>
                        <p className="mt-2 text-red-400 font-semibold">Could not grant reward. Please try again later.</p>
                    </>
                );
            default:
                return null;
        }
    };


    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans">
            {/* Header */}
            <header className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={onBack} className="text-gray-600 hover:text-[#FF6B00]">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-[#1B1B1B]">Watch & Earn</h1>
                    <div className="w-6"></div> {/* Placeholder for alignment */}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-scale-in">
                    <VideoAdIcon className="w-24 h-24 mx-auto text-amber-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Earn Free Coins!</h2>
                    <p className="text-gray-500 mt-2 mb-6">Watch a short video ad and get rewarded with coins instantly.</p>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6">
                        <p className="text-sm text-amber-800">Your Current Balance</p>
                        <div className="flex items-center justify-center mt-1">
                            <CoinIcon className="w-6 h-6 mr-2" />
                            <p className="text-2xl font-bold text-amber-900">{user.coins.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleWatchAd}
                        disabled={isAdLoading || isAdPlaying}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isAdLoading ? 'Loading Ad...' : 'Watch Ad & Earn 20 Coins'}
                    </button>
                </div>

                {/* Reward History */}
                <section className="mt-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Reward History</h2>
                    {renderHistory()}
                </section>
            </main>

            {/* Ad Simulation Overlay */}
            {isAdPlaying && (
                 <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 animate-fade-scale-in">
                    {/* Close Button appears when ad is done */}
                    {adCountdown === 0 && (
                        <button onClick={handleCloseAd} className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    )}

                    <div className="text-center text-white">
                        {adCountdown > 0 ? (
                            <>
                                {/* Central Timer Display */}
                                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                    <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                                        <circle
                                            className="text-gray-700"
                                            strokeWidth="10"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="52"
                                            cx="60"
                                            cy="60"
                                        />
                                        <circle
                                            className="text-amber-400"
                                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                                            strokeWidth="10"
                                            strokeDasharray={327}
                                            strokeDashoffset={327 - (adCountdown / 30) * 327}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="52"
                                            cx="60"
                                            cy="60"
                                            transform="rotate(-90 60 60)"
                                        />
                                    </svg>
                                    <span className="text-white text-5xl font-bold font-mono z-10">{adCountdown}</span>
                                </div>
                                <h2 className="text-2xl font-bold">Ad in Progress</h2>
                                <p className="mt-1 text-gray-300">Your reward is coming soon!</p>
                            </>
                        ) : (
                            <>
                                {/* Reward Status Display */}
                                <VideoAdIcon className="w-32 h-32 mx-auto text-amber-400 mb-4 animate-pulse" />
                                <AdOverlayContent />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchAndEarnScreen;