
import React, { useState } from 'react';
import { User, Screen } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { WalletIcon } from './icons/WalletIcon';
import { LeaderboardIcon } from './icons/LeaderboardIcon';
import { UserIcon } from './icons/UserIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { FireIcon } from './icons/FireIcon';
import { UsersIcon } from './icons/UsersIcon';
import { updateUserAvatar, updateUserName } from '../managers/ProfileManager';
import { XMarkIcon } from './icons/XMarkIcon';

interface ProfileScreenProps {
    user: User;
    onLogout: () => void;
    onNavigate: (screen: Screen) => void;
}

// Sub-components for better organization
const ProfileListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition-transform hover:scale-[1.02]">
        {children}
    </div>
);

const StatsCard: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-amber-500 mb-2">{icon}</div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onNavigate }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // FIX: Moved avatarOptions inside the component to access the user prop.
    const avatarOptions = [
        'adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 'big-smile', 
        'bottts', 'fun-emoji', 'identicon', 'miniavs', 'open-peeps', 'personas', 'pixel-art'
    ].map(seed => ({
        seed,
        url: `https://api.dicebear.com/8.x/${seed}/svg?seed=${user.uid}`
    }));

    const displayUserId = `EB${user.uid.substring(0, 6).toUpperCase()}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Referral code copied to clipboard!');
        }, (err) => {
            alert('Failed to copy text.');
            console.error('Could not copy text: ', err);
        });
    };

    const handleNameSave = async () => {
        if (newName.trim() === '' || newName === user.name) {
            setIsEditingName(false);
            return;
        }
        setLoading(true);
        const result = await updateUserName(user.uid, newName);
        if (!result.success) {
            alert(`Error: ${result.message}`);
            setNewName(user.name); // Revert on failure
        }
        setLoading(false);
        setIsEditingName(false);
    };

    const handleAvatarSelect = async (url: string) => {
        setLoading(true);
        setIsAvatarModalOpen(false);
        const result = await updateUserAvatar(user.uid, url);
        if (!result.success) {
            alert(`Error: ${result.message}`);
        }
        setLoading(false);
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
                    <div className="relative group">
                        <img src={user.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full mb-2 border-4 border-amber-300 shadow-lg" />
                        <button 
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity"
                            aria-label="Change avatar"
                        >
                            <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleNameSave}
                                autoFocus
                                className="text-2xl font-bold text-gray-800 bg-gray-100 border-b-2 border-amber-500 rounded px-2 py-1 text-center outline-none"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        )}
                        <button onClick={() => isEditingName ? handleNameSave() : setIsEditingName(true)} disabled={loading} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                            {isEditingName ? <CheckIcon className="w-5 h-5 text-green-500" /> : <PencilIcon className="w-5 h-5 text-gray-500" />}
                        </button>
                    </div>

                    <p className="text-md text-gray-500">User ID: {displayUserId}</p>
                    <div className="mt-4 bg-amber-100 border-2 border-dashed border-amber-400 text-amber-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                        <span className="font-semibold">Referral Code: {user.referralCode}</span>
                        <button onClick={() => copyToClipboard(user.referralCode)} className="p-1 rounded-full hover:bg-amber-200 transition-colors">
                            <CopyIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {user.appliedReferralCode && (
                        <div className="mt-2 bg-green-100 border-2 border-dashed border-green-400 text-green-800 rounded-lg px-4 py-2 text-sm">
                            <span className="font-semibold">Applied Code: {user.appliedReferralCode}</span>
                        </div>
                    )}
                </section>
                
                {/* New Stats Section */}
                <section className="grid grid-cols-3 gap-3 mb-6 animate-fade-scale-in">
                    <StatsCard icon={<CheckBadgeIcon className="w-8 h-8" />} value={user.totalTasksCompleted} label="Tasks Done" />
                    <StatsCard icon={<FireIcon className="w-8 h-8" />} value={user.activeStreak} label="Streak" />
                    <StatsCard icon={<UsersIcon className="w-8 h-8" />} value={user.referralsMade} label="Referrals" />
                </section>

                {/* Menu List */}
                <section className="space-y-3">
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

            {/* Avatar Selection Modal */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 text-center w-full max-w-md shadow-2xl animate-fade-scale-in relative">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Avatar</h2>
                        <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200">
                           <XMarkIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                            {avatarOptions.map(option => (
                                <button key={option.seed} onClick={() => handleAvatarSelect(option.url)} className="p-1 rounded-full border-2 border-transparent hover:border-amber-500 focus:border-amber-500 outline-none transition-all">
                                    <img src={option.url} alt={option.seed} className="w-full h-full rounded-full bg-gray-100" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
