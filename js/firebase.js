import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Safe to commit and expose publicly — access is controlled by the database
// security rules (see README.md), not by hiding this API key.
const config = {
  apiKey: "AIzaSyCYEDZwCzOFpor5_2S8rgR32hegtk3dImc",
  authDomain: "prefects-cup.firebaseapp.com",
  databaseURL: "https://prefects-cup-default-rtdb.firebaseio.com",
  projectId: "prefects-cup",
  storageBucket: "prefects-cup.firebasestorage.app",
  messagingSenderId: "1048228025380",
  appId: "1:1048228025380:web:8a6aec24eb2fa8f275b4b1",
};

const app = initializeApp(config);

export const db = getDatabase(app);
export const auth = getAuth(app);

export {
  ref, onValue, get, set, update, remove, push, child,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

export {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
