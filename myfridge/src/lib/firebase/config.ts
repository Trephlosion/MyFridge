import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getAnalytics, Analytics } from "firebase/analytics";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

};

// Initialize Firebase
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);


// Initialize Firebase services

export const analytics: Analytics = getAnalytics(firebaseApp);
export const auth: Auth = getAuth(firebaseApp);            // Authentication
export const database: Firestore = getFirestore(firebaseApp);  // Firestore Database
export const storage: FirebaseStorage = getStorage();



/*firebaseConfig.collections = {
    userCollection: collection(database, "User"),
    postsCollection: collection(database, "Posts"),
    recipeCollection: collection(database, "Recipe"),
    ingredientsCollection: collection(database, "Ingredients"),
    bookmarksCollection: collection(database, "Bookmarks"),
};*/

// Custom avatars service for upload and download
export const avatars = {
    // Upload avatar to Firebase Storage
    uploadAvatar: async (file: File, userId: string): Promise<string> => {
        // Create a reference to the avatar file
        const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);

        // Upload the file
        const snapshot = await uploadBytes(avatarRef, file);

        // Get the file's download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    },

    // Get the URL of an existing avatar file
    getAvatarURL: async (userId: string, fileName: string): Promise<string> => {
        const avatarRef = ref(storage, `avatars/${userId}/${fileName}`);
        return await getDownloadURL(avatarRef);
    }
};
