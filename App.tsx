



import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import AuthPage from './components/AuthPage';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import WalletScreen from './components/WalletScreen';
import WatchAndEarnScreen from './components/WatchAndEarnScreen';
import SpinWheelScreen from './components/SpinWheelScreen'; // Import the new screen
import { auth, db } from './firebase';
// FIX: Use Firebase v8 imports and types. The User and Unsubscribe types are now accessed from the firebase namespace.
// FIX: Use namespace import for firebase compat app and import auth for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { addCoins } from './managers/CoinManager';
import { checkAndAwardDailyBonus } from './managers/DailyBonusManager';
import DailyBonusModal from './components/DailyBonusModal';

export interface User {
  uid: string;
  name: string;
  referralCode: string;
  appliedReferralCode: string | null;
  bonusClaimed: boolean;
  coins: number;
  money: number;
  totalEarnings: number;
  avatarUrl: string;
  totalTasksCompleted: number;
  activeStreak: number;
  referralsMade: number;
  lastLoginDate?: string | null;
}

// FIX: Define a type for user data from Firestore to resolve type errors.
interface FirestoreUserData {
    name: string;
    referralCode: string;
    appliedReferralCode: string | null;
    bonusClaimed: boolean;
    coins: number;
    money: number;
    totalEarnings: number;
    avatarUrl: string;
    totalTasksCompleted: number;
    activeStreak: number;
    referralsMade: number;
    lastLoginDate: string | null;
}

export type Screen = 'Home' | 'Wallet' | 'Leaderboard' | 'Profile' | 'WatchAndEarn' | 'SpinAndWin';

const App: React.FC = () => {
  const skipSplash = sessionStorage.getItem('signup_complete') === 'true';
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');
  const [bonusInfo, setBonusInfo] = useState<{streak: number, amount: number} | null>(null);
  const bonusCheckPerformedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (skipSplash) {
        sessionStorage.removeItem('signup_complete');
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Splash screen duration

    // FIX: Update Unsubscribe type for Firebase v8.
    let unsubscribeSnapshot: () => void = () => {};

    // FIX: Use Firebase v8 syntax for onAuthStateChanged and define FirebaseUser type.
    // FIX: Corrected Firebase User type from firebase.auth.User to firebase.User for v8 compat library.
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: firebase.User | null) => {
        unsubscribeSnapshot(); // Clear previous user's snapshot listener
        bonusCheckPerformedForUser.current = null; // Reset bonus check on auth change

        if (firebaseUser) {
            const isPasswordProvider = firebaseUser.providerData.some(p => p.providerId === 'password');
            const canProceed = !isPasswordProvider || (isPasswordProvider && firebaseUser.emailVerified);

            if (canProceed) {
                // FIX: Use Firebase v8 syntax to get a document reference.
                const userDocRef = db.collection('users').doc(firebaseUser.uid);
                
                // FIX: Use Firebase v8 syntax for onSnapshot.
                unsubscribeSnapshot = userDocRef.onSnapshot(async (userDoc) => {
                    if (userDoc.exists) {
                        const userData = userDoc.data() as FirestoreUserData;

                        // Daily bonus check, run only once per user login
                        if (bonusCheckPerformedForUser.current !== firebaseUser.uid) {
                            bonusCheckPerformedForUser.current = firebaseUser.uid;
                            checkAndAwardDailyBonus({
                                uid: firebaseUser.uid,
                                lastLoginDate: userData.lastLoginDate || null,
                                activeStreak: userData.activeStreak || 0,
                            }).then(bonusResult => {
                                if (bonusResult) {
                                    // A small delay to make the UI feel less abrupt
                                    setTimeout(() => setBonusInfo(bonusResult), 500);
                                }
                            });
                        }


                        // Handle one-time bonus claim
                        if (userData.appliedReferralCode && !userData.bonusClaimed) {
                            const bonusAmount = 50;
                            alert(`Congratulations! You've received a ${bonusAmount} coin bonus for using a referral code.`);
                            
                            // Immediately mark bonus as claimed to prevent duplicates
                            // FIX: Use Firebase v8 syntax to update a document.
                            await userDocRef.update({ bonusClaimed: true });

                            // Add coins to the user's account
                            await addCoins(firebaseUser.uid, bonusAmount, 'Referral Bonus', 'referral_bonus');
                            
                            // The snapshot will automatically provide the updated data, no need to set state here.
                        }

                        setUser({
                            uid: firebaseUser.uid,
                            name: userData.name || 'User',
                            referralCode: userData.referralCode || 'N/A',
                            appliedReferralCode: userData.appliedReferralCode || null,
                            bonusClaimed: userData.bonusClaimed,
                            coins: userData.coins || 0,
                            money: userData.money || 0,
                            totalEarnings: userData.totalEarnings || 0,
                            // Provide default values for new fields if they don't exist
                            avatarUrl: userData.avatarUrl || `https://api.dicebear.com/8.x/adventurer/svg?seed=default`,
                            totalTasksCompleted: userData.totalTasksCompleted || 0,
                            activeStreak: userData.activeStreak || 0,
                            referralsMade: userData.referralsMade || 0,
                            lastLoginDate: userData.lastLoginDate || null,
                        });
                        setIsAuthenticated(true);
                    } else {
                        console.log("User document not yet created or found.");
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user document:", error.message);
                    setLoading(false);
                    setIsAuthenticated(false);
                    setUser(null);
                });
            } else {
                console.log("User has not verified their email address. Access denied.");
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
            }
        } else {
            // User is signed out
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
        // FIX: Use Firebase v8 syntax for signOut.
        await auth.signOut();
        setActiveScreen('Home'); // Reset to home screen on logout
    } catch (error) {
        console.error("Error signing out: ", error);
        alert("Failed to log out. Please try again.");
    }
  }

  const handleNavigation = (screen: Screen) => {
      setActiveScreen(screen);
  }

  const renderContent = () => {
    if (showSplash) {
      return <SplashScreen />;
    }
    // After splash, if still checking auth, can show a loader
    if (loading && !showSplash) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    if (isAuthenticated && user) {
        switch(activeScreen) {
            case 'Home':
                return <HomeScreen user={user} onNavigate={handleNavigation} />;
            case 'Wallet':
                return <WalletScreen user={user} onNavigate={handleNavigation} onBack={() => handleNavigation('Home')} />;
            case 'Profile':
                return <ProfileScreen user={user} onLogout={handleLogout} onNavigate={handleNavigation} />;
            case 'WatchAndEarn':
                return <WatchAndEarnScreen user={user} onBack={() => handleNavigation('Home')} />;
            case 'SpinAndWin':
                return <SpinWheelScreen user={user} onBack={() => handleNavigation('Home')} />;
            default:
                return <HomeScreen user={user} onNavigate={handleNavigation} />;
        }
    }
    return <AuthPage />;
  }

  return (
    <div className="App">
      {renderContent()}
      {bonusInfo && <DailyBonusModal streak={bonusInfo.streak} amount={bonusInfo.amount} onClose={() => setBonusInfo(null)} />}
    </div>
  );
};

export default App;