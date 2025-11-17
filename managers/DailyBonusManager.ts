

import { db } from '../firebase';
// FIX: Import firebase v8 namespace for serverTimestamp. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Bonus amounts for a 7-day streak cycle
const bonuses = [10, 15, 20, 25, 30, 35, 50]; 

// Helper to get date in YYYY-MM-DD format
const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface UserData {
    uid: string;
    lastLoginDate: string | null;
    activeStreak: number;
}

/**
 * Checks if a user is eligible for a daily login bonus, and if so,
 * awards it in an atomic transaction.
 * @param user - A partial user object with uid, lastLoginDate, and activeStreak.
 * @returns A promise that resolves to an object with the new streak and bonus amount if awarded, otherwise null.
 */
export const checkAndAwardDailyBonus = async (
    user: UserData
): Promise<{ streak: number; amount: number } | null> => {
    
    const today = new Date();
    const todayStr = getDateString(today);

    const lastLoginStr = user.lastLoginDate;

    // If last login was today, no bonus
    if (lastLoginStr === todayStr) {
        return null;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getDateString(yesterday);
    
    let newStreak = 1;
    // If last login was yesterday, increment streak
    if (lastLoginStr === yesterdayStr) {
        newStreak = user.activeStreak + 1;
    }
    // Otherwise, the streak is broken and resets to 1 (for today's login)

    const bonusAmount = bonuses[(newStreak - 1) % bonuses.length];
    
    // FIX: Use Firebase v8 syntax to get document and collection references.
    const userDocRef = db.collection('users').doc(user.uid);
    const transactionDocRef = db.collection('users').doc(user.uid).collection('transactions').doc();
    const dailyEarningsDocRef = db.collection('users').doc(user.uid).collection('dailyEarnings').doc(todayStr);

    try {
        // FIX: Use Firebase v8 syntax for runTransaction.
        await db.runTransaction(async (transaction) => {
            const [userDoc, dailyEarningsDoc] = await Promise.all([
                transaction.get(userDocRef),
                transaction.get(dailyEarningsDocRef)
            ]);

            if (!userDoc.exists) {
                throw new Error("User document does not exist for daily bonus!");
            }

            const userData = userDoc.data();
            if (!userData) {
                throw new Error("User data is missing!");
            }
            const currentCoins = userData.coins || 0;
            const currentTotalEarnings = userData.totalEarnings || 0;

            const newCoins = currentCoins + bonusAmount;
            const newMoney = newCoins / 10;
            const newTotalEarnings = currentTotalEarnings + bonusAmount;

            // 1. Update user document with new streak, last login, and balances
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.update(userDocRef, {
                activeStreak: newStreak,
                lastLoginDate: todayStr,
                coins: newCoins,
                money: newMoney,
                totalEarnings: newTotalEarnings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. Log the bonus transaction
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.set(transactionDocRef, {
                title: `Daily Bonus: Day ${newStreak}`,
                amount: bonusAmount,
                isCoin: true,
                type: 'credit',
                category: 'daily_bonus',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // 3. Update today's earnings subcollection
            const currentDailyCoins = dailyEarningsDoc.exists ? dailyEarningsDoc.data()?.coinsEarned : 0;
            const newDailyCoins = currentDailyCoins + bonusAmount;
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.set(dailyEarningsDocRef, {
                coinsEarned: newDailyCoins,
                date: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        console.log(`Awarded daily bonus to ${user.uid}: ${bonusAmount} coins for Day ${newStreak}`);
        return { streak: newStreak, amount: bonusAmount };

    } catch (error) {
        console.error("Daily bonus transaction failed:", error);
        return null;
    }
};