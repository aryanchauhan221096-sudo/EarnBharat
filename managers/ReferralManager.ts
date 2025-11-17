

import { db } from '../firebase';
// FIX: Import firebase v8 namespace for serverTimestamp. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

/**
 * Finds a referrer by their referral code and awards them a bonus.
 * This function handles finding the referrer, updating their balance and stats,
 * and logging the transaction in a single atomic operation.
 *
 * @param appliedCode The referral code used by the new user.
 * @returns An object indicating success or failure.
 */
export const processReferral = async (
    appliedCode: string,
): Promise<{ success: boolean; message: string }> => {
    if (!appliedCode || appliedCode.trim() === '') {
        return { success: true, message: 'No referral code applied.' }; // Not an error
    }

    const codeToFind = appliedCode.trim().toUpperCase();
    // FIX: Use Firebase v8 syntax to reference a collection.
    const usersRef = db.collection('users');
    // FIX: Use Firebase v8 syntax for querying.
    const q = usersRef.where("referralCode", "==", codeToFind).limit(1);
    
    try {
        // FIX: Use Firebase v8 syntax to execute a query.
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            console.warn(`Referral code "${codeToFind}" not found.`);
            // Don't throw an error, the user might have typed it wrong.
            // The sign-up process should continue.
            return { success: false, message: 'Referral code not found.' };
        }

        const referrerDoc = querySnapshot.docs[0];
        const referrerId = referrerDoc.id;
        const rewardAmount = 300;

        // FIX: Use Firebase v8 syntax to get document and collection references.
        const referrerDocRef = db.collection('users').doc(referrerId);
        // We also need a new transaction document for the referrer
        const transactionDocRef = db.collection('users').doc(referrerId).collection('transactions').doc();

        // FIX: Use Firebase v8 syntax for runTransaction.
        await db.runTransaction(async (transaction) => {
            const referrerSnapshot = await transaction.get(referrerDocRef);
            if (!referrerSnapshot.exists) {
                throw new Error("Referrer document does not exist!");
            }

            const currentData = referrerSnapshot.data();
             if (!currentData) {
                throw new Error("Referrer data is missing!");
            }
            const currentCoins = currentData.coins || 0;
            const currentTotalEarnings = currentData.totalEarnings || 0;
            const currentReferralsMade = currentData.referralsMade || 0;
            
            const newCoins = currentCoins + rewardAmount;
            const newMoney = newCoins / 10; // Conversion: 10 coins = ₹1
            const newTotalEarnings = currentTotalEarnings + rewardAmount;
            const newReferralsMade = currentReferralsMade + 1;

            // 1. Update the referrer's main document
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.update(referrerDocRef, { 
                coins: newCoins,
                money: newMoney,
                totalEarnings: newTotalEarnings,
                referralsMade: newReferralsMade,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. Log the transaction for the referrer
            // FIX: Use Firebase v8 syntax for serverTimestamp.
            transaction.set(transactionDocRef, {
                title: 'New User Referral',
                amount: rewardAmount,
                isCoin: true,
                type: 'credit',
                category: 'referral_credit',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log(`Successfully awarded ${rewardAmount} coins to referrer: ${referrerId}`);
        return { success: true, message: 'Referral bonus awarded successfully.' };

    } catch (e: any) {
        console.error("Referral processing failed: ", e);
        return { success: false, message: e.message || "Failed to process referral due to a server error." };
    }
};