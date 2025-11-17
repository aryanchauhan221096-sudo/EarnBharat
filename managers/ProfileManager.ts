



import { db } from '../firebase';
// FIX: Import firebase v8 namespace for serverTimestamp. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

/**
 * Updates a user's display name in Firestore.
 * @param userId The UID of the user.
 * @param newName The new display name.
 * @returns An object indicating success or failure with a message.
 */
export const updateUserName = async (
    userId: string,
    newName: string
): Promise<{ success: boolean; message: string }> => {
    if (!newName || newName.trim().length === 0) {
        return { success: false, message: "Name cannot be empty." };
    }

    // FIX: Use Firebase v8 syntax to get a document reference.
    const userDocRef = db.collection('users').doc(userId);
    try {
        // FIX: Use Firebase v8 syntax for updateDoc and serverTimestamp.
        await userDocRef.update({
            name: newName.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Name updated successfully." };
    } catch (e: any) {
        console.error("Error updating user name: ", e);
        return { success: false, message: e.message || "Failed to update name." };
    }
};

/**
 * Updates a user's avatar URL in Firestore.
 * @param userId The UID of the user.
 * @param newAvatarUrl The new URL for the avatar.
 * @returns An object indicating success or failure with a message.
 */
export const updateUserAvatar = async (
    userId: string,
    newAvatarUrl: string
): Promise<{ success: boolean; message: string }> => {
    if (!newAvatarUrl) {
        return { success: false, message: "Avatar URL cannot be empty." };
    }

    // FIX: Use Firebase v8 syntax to get a document reference.
    const userDocRef = db.collection('users').doc(userId);
    try {
        // FIX: Use Firebase v8 syntax for updateDoc and serverTimestamp.
        await userDocRef.update({
            avatarUrl: newAvatarUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Avatar updated successfully." };
    } catch (e: any) {
        console.error("Error updating user avatar: ", e);
        return { success: false, message: e.message || "Failed to update avatar." };
    }
};