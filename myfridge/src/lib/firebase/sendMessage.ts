// src/api/sendMessage.ts


import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "./firebase"; // ✅ relative path to firebase.ts

export const sendMessage = async ({ toUserId, fromUserId, subject, text }) => {
    try {
        await addDoc(collection(db, 'Messages'), {
            toUserId,
            fromUserId,
            subject,
            text,
            sentAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error };
    }
};

