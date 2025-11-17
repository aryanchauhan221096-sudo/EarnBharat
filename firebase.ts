



// FIX: Update Firebase imports and initialization to v8 syntax to match project dependencies.
// FIX: Use namespace import for firebase compat app.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();