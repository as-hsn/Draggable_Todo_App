// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Import for Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcLHRRg9Siu-haijmCcR-V45CUD047ttE",
  authDomain: "todo-app-e0d14.firebaseapp.com",
  databaseURL: "https://todo-app-e0d14-default-rtdb.firebaseio.com/", // Add Realtime Database URL here
  projectId: "todo-app-e0d14",
  storageBucket: "todo-app-e0d14.appspot.com",
  messagingSenderId: "874675106993",
  appId: "1:874675106993:web:1ff24fdcb71aecd23e9e90",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app); // Initialize and export Realtime Database

export default app;