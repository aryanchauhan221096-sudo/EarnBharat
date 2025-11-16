// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbRiYCewXuzaQHhDD6fMU-f1YIw0I1Zok",
  authDomain: "earnbharat-de023.firebaseapp.com",
  databaseURL: "https://earnbharat-de023-default-rtdb.firebaseio.com",
  projectId: "earnbharat-de023",
  storageBucket: "earnbharat-de023.appspot.com",
  messagingSenderId: "339642052380",
  appId: "1:339642052380:web:b6c1c46bec63c3f8c454d9",
  measurementId: "G-Z42PYJXQ8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
