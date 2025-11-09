// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Replace the config below with your Firebase config (double-check in Firebase Console → Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyDvvTlUdPl8pAhuGM5Jm7uXfnqExnHpOTY",
  authDomain: "ai-career-recommendation-deca9.firebaseapp.com",
  projectId: "ai-career-recommendation-deca9",
  storageBucket: "ai-career-recommendation-deca9.firebasestorage.app",
  messagingSenderId: "763231129541",
  appId: "1:763231129541:web:0e4e800bd99f0ea738c5ac"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
