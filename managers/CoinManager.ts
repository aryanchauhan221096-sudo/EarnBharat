

import { db } from '../firebase';
// FIX: Import firebase v8 namespace for serverTimestamp. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Helper function to get date in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


/**
 * Atomically adds coins to a user's account and logs the transaction.
 * This prevents race conditions and ensures data integrity by performing both
 * the balance update and transaction logging in a single atomic operation.
 *
 * @param userId The UID of the user.
 * @param amount The number of coins to add (must be positive).
 * @param title A description of the transaction (e.g., "Daily Check-In Reward").
 * @param category An optional category for filtering transactions (e.g., "watch_and_earn").
 * @returns An object indicating success or failure with a message.
 */
export const addCoins = async (
    userId: string, 
    amount: number, 
    title: string,
    category?: string
): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) {
        return { success: false, message: 'Coin amount must be positive.' };
    }

    // FIX: Use Firebase v8 syntax to get document and collection references.
    const userDocRef = db.collection('users').doc(userId);
    const transactionDocRef = db.collection('users').doc(userId).collection('transactions').doc();
    
    // New: Reference to today's earnings document
    const todayDateString = getTodayDateString();
    // FIX: Use Firebase v8 syntax to reference a nested document.
    const dailyEarningsDocRef = db.collection('users').doc(userId).collection('dailyEarnings').doc(todayDateString);

    try {
        // FIX: Use Firebase v8 syntax for runTransaction.
        await db.runTransaction(async (transaction) => {
            // Get user document and today's earnings document
            const [userDoc, dailyEarningsDoc] = await Promise.all([
                transaction.get(userDocRef),
                transaction.get(dailyEarningsDocRef)
            ]);

            if (!userDoc.exists) {
                throw new Error("User document does not exist!");
            }

            const currentData = userDoc.data();
            if (!currentData) {
                throw new Error("User data is missing!");
            }
            const currentCoins = currentData.coins || 0;
            const currentTotalEarnings = currentData.totalEarnings || 0;
            
            const newCoins = currentCoins + amount;
            const newMoney = newCoins / 10; // Conversion: 10 coins = ₹1
            const newTotalEarnings = currentTotalEarnings + amount;

            // 1. Update the user's main document with new balances
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.update(userDocRef, { 
                coins: newCoins,
                money: newMoney,
                totalEarnings: newTotalEarnings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. Create a new document in the user's 'transactions' subcollection
            const transactionData: { [key: string]: any } = {
                title,
                amount,
                isCoin: true,
                type: 'credit',
                // FIX: Use Firebase v8 syntax for serverTimestamp.
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (category) {
                transactionData.category = category;
            }

            transaction.set(transactionDocRef, transactionData);

            // 3. Update today's earnings
            const currentDailyCoins = dailyEarningsDoc.exists ? dailyEarningsDoc.data()?.coinsEarned : 0;
            const newDailyCoins = currentDailyCoins + amount;
            transaction.set(dailyEarningsDocRef, {
                coinsEarned: newDailyCoins,
                // FIX: Use Firebase v8 syntax for serverTimestamp.
                date: firebase.firestore.FieldValue.serverTimestamp() // To track last update for this day
            }, { merge: true });
        });

        console.log(`Successfully added ${amount} coins to user: ${userId}`);
        return { success: true, message: 'Coins added successfully.' };
    } catch (e: any) {
        console.error("Coin transaction failed: ", e);
        return { success: false, message: e.message || "Failed to add coins due to a server error." };
    }
};