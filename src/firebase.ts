import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAogT0wi1jBZMcBbGL4qlz7yYXmptfQtnI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "contentguard-7ffc0.firebaseapp.com",
  projectId: "contentguard-7ffc0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "contentguard-7ffc0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "912498445200",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:912498445200:web:e7b0e115c871a5249d4115"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);