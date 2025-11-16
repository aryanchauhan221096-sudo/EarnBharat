import React from 'react';
import { User, Screen } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { WalletIcon } from './icons/WalletIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { UserIcon } from './icons/UserIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ProfileScreenProps {
    user: User;
    onLogout: () => void;
    onNavigate: (screen: Screen) => void;
}

const ProfileListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition-transform hover:scale-105">
        {children}
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onNavigate }) => {

    const placeholder = {
        userID: 'EB123456',
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Referral code copied to clipboard!');
        }, (err) => {
            alert('Failed to copy text.');
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
            {/* Header */}
            <header className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-center items-center relative">
                    <h1 className="text-xl font-bold text-[#1B1B1B]">Profile</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4">
                
                {/* Profile Info */}
                <section className="flex flex-col items-center text-center mb-6">
                    <img src={`https://i.pravatar.cc/150?u=${placeholder.userID}`} alt="Profile" className="w-24 h-24 rounded-full mb-4 border-4 border-amber-300 shadow-lg" />
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-md text-gray-500">User ID: {placeholder.userID}</p>
                    <div className="mt-4 bg-amber-100 border-2 border-dashed border-amber-400 text-amber-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                        <span className="font-semibold">Referral Code: {user.referralCode}</span>
                        <button onClick={() => copyToClipboard(user.referralCode)} className="p-1 rounded-full hover:bg-amber-200 transition-colors">
                            <CopyIcon className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* Menu List */}
                <section className="space-y-3">
                    <ProfileListItem>
                        <span className="font-semibold text-gray-700">Edit Profile</span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </ProfileListItem>
                     <ProfileListItem>
                        <span className="font-semibold text-gray-700">My Earnings</span>
                         <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </ProfileListItem>
                    <ProfileListItem>
                        <span className="font-semibold text-gray-700">Help Center</span>
                         <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </ProfileListItem>
                    <ProfileListItem>
                        <span className="font-semibold text-gray-700">Privacy Policy</span>
                         <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </ProfileListItem>
                    <ProfileListItem>
                        <span className="font-semibold text-gray-700">Terms & Conditions</span>
                         <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </ProfileListItem>

                    {/* Logout Button */}
                    <button onClick={onLogout} className="w-full mt-4 bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-red-600 transition-all duration-200 transform hover:scale-105">
                        Logout
                    </button>
                </section>
            </main>

            {/* Bottom Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl z-30">
                <div className="flex justify-around items-center container mx-auto px-4 py-2">
                    <button onClick={() => onNavigate('Home')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <HomeIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Home</span>
                    </button>
                    <button onClick={() => onNavigate('Wallet')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <WalletIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Wallet</span>
                    </button>
                    <button onClick={() => onNavigate('Leaderboard')} className="flex flex-col items-center text-gray-500 hover:text-[#FF6B00] transition-colors">
                        <LeaderboardIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">Leaderboard</span>
                    </button>
                    <button onClick={() => onNavigate('Profile')} className="flex flex-col items-center text-[#FF6B00] hover:text-orange-600 transition-colors">
                        <UserIcon className="w-7 h-7 mb-1" />
                        <span className="text-xs font-bold">Profile</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ProfileScreen;