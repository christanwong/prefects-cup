import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Register a "Web App" with your Firebase project and copy from the "Config" field
// Safe to publish
const config = {
  apiKey: "AIzaSyD2iNG2Pi-uIkUhhnydLCL1BiTdHE4UrbU",
  authDomain: "ucc-prefects-cup.firebaseapp.com",
  databaseURL: "https://ucc-prefects-cup-default-rtdb.firebaseio.com",
  projectId: "ucc-prefects-cup",
  storageBucket: "ucc-prefects-cup.firebasestorage.app",
  messagingSenderId: "926429196783",
  appId: "1:926429196783:web:d7f686efe3db75e7a6061a",
  measurementId: "G-WMSZW34X36"

};

const app = initializeApp(config);

export const db = getDatabase(app);
export const auth = getAuth(app);

export {
  ref, onValue, get, set, update, remove, push, child,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

export {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
