// src/lib/firebase/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ... other config fields
};

// Check if Firebase app is already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
