

import React, { useState, useEffect } from 'react';
import { User, Screen } from '../App';
import { db } from '../firebase';
// FIX: Import firebase v8 namespace for Timestamp type. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
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

// Represents the structure of a transaction document from Firestore
interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    title: string;
    date: string;
    amount: number;
    isCoin: boolean;
}

// Placeholder for data not yet in the User model
const placeholder = {
    todaysEarnings: '1.50',
    monthlyEarnings: '28.75',
};

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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateCard(true), 100);

        // Set up a real-time listener for the user's transactions
        // FIX: Use Firebase v8 syntax to reference a collection.
        const transactionsColRef = db.collection('users').doc(user.uid).collection('transactions');
        // FIX: Use Firebase v8 syntax for querying.
        const q = transactionsColRef.orderBy('createdAt', 'desc');

        // FIX: Use Firebase v8 syntax for onSnapshot.
        const unsubscribe = q.onSnapshot((querySnapshot) => {
            setTransactionsError(null); // Clear previous errors on new data
            const userTransactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // FIX: Use firebase.firestore.Timestamp for type casting.
                const createdAt = data.createdAt as firebase.firestore.Timestamp;
                userTransactions.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    date: createdAt ? createdAt.toDate().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'Just now',
                    amount: data.amount,
                    isCoin: data.isCoin,
                });
            });
            setTransactions(userTransactions);
            setLoadingTransactions(false);
        }, (error) => {
            console.error("Error fetching transactions: ", error.message);
            setTransactionsError("Could not load transaction history. This might be a permissions issue.");
            setLoadingTransactions(false);
        });

        return () => {
            clearTimeout(timer);
            unsubscribe(); // Detach the listener when the component unmounts
        };
    }, [user.uid]);

    const displayUserId = `EB${user.uid.substring(0, 6).toUpperCase()}`;
    const lifetimeEarnings = (user.totalEarnings / 10).toFixed(2);

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
                        <p className="text-4xl font-bold">₹{user.money.toFixed(2)}</p>
                        <p className="text-md opacity-90 mt-1">{user.coins.toLocaleString()} Coins</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-xs opacity-80">User ID: {displayUserId}</p>
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
                        <EarningCard icon={<StarIcon className="w-6 h-6" />} value={lifetimeEarnings} label="Lifetime Earnings" />
                     </div>
                </section>

                {/* Recent Transactions */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</h2>
                    {loadingTransactions ? (
                        <div className="text-center text-gray-500 p-4">Loading Transactions...</div>
                    ) : transactionsError ? (
                        <div className="bg-red-50 text-center text-red-600 p-4 rounded-xl shadow-sm">
                            <p className="font-semibold">Oops! Something went wrong.</p>
                            <p className="text-sm">{transactionsError}</p>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm">
                            {transactions.map((t, index) => (
                                <div key={t.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms`}}>
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
                    ) : (
                        <div className="bg-white text-center text-gray-500 p-4 rounded-xl shadow-sm">
                            You have no transactions yet.
                        </div>
                    )}
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