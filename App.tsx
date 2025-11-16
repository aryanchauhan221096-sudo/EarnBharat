import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import AuthPage from './components/AuthPage';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import WalletScreen from './components/WalletScreen';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface User {
  name: string;
  referralCode: string;
  appliedReferralCode: string | null;
  bonusClaimed: boolean;
}

// FIX: Define a type for user data from Firestore to resolve type errors.
interface FirestoreUserData {
    name: string;
    referralCode: string;
    appliedReferralCode: string | null;
    bonusClaimed: boolean;
}

export type Screen = 'Home' | 'Wallet' | 'Leaderboard' | 'Profile';

const App: React.FC = () => {
  const skipSplash = sessionStorage.getItem('signup_complete') === 'true';
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');

  useEffect(() => {
    if (skipSplash) {
        sessionStorage.removeItem('signup_complete');
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Splash screen duration

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            const isPasswordProvider = firebaseUser.providerData.some(p => p.providerId === 'password');
            const canProceed = !isPasswordProvider || (isPasswordProvider && firebaseUser.emailVerified);

            if (canProceed) {
                // User is signed in and allowed, fetch their data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data() as FirestoreUserData;

                    // Check for referral bonus and claim it once.
                    if (userData.appliedReferralCode && !userData.bonusClaimed) {
                        alert("Congratulations! You've received a bonus for using a referral code.");
                        await updateDoc(userDocRef, {
                            bonusClaimed: true
                        });
                        // Update local data to reflect the change immediately
                        userData.bonusClaimed = true;
                    }

                    setUser({
                        name: userData.name || 'User',
                        referralCode: userData.referralCode || 'N/A',
                        appliedReferralCode: userData.appliedReferralCode || null,
                        bonusClaimed: userData.bonusClaimed,
                    });
                    setIsAuthenticated(true);
                } else {
                    // User document not yet created, probably in sign-up flow.
                    console.log("User document not yet created or found.");
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                // User is not allowed (unverified email)
                console.log("User has not verified their email address. Access denied.");
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            // User is signed out
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false);
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribe(); // Cleanup the listener
    };
  }, []);
  
  const handleLogout = async () => {
    try {
        await signOut(auth);
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
            default:
                return <HomeScreen user={user} onNavigate={handleNavigation} />;
        }
    }
    return <AuthPage />;
  }

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
};

export default App;