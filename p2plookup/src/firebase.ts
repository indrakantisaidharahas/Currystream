// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Put your own Firebase config here
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "REMOVED",
  authDomain: "streamapp-2650a.firebaseapp.com",
  projectId: "streamapp-2650a",
  storageBucket: "streamapp-2650a.firebasestorage.app",
  messagingSenderId: "615265106106",
  appId: "1:615265106106:web:ec6f4b3c7ab516e7816a83",
  measurementId: "G-FZ2Z34EYNT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore DB
export const db = getFirestore(app);
