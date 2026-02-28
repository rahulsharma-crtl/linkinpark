import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACupc8Q3dO_CaWzcp0YgTFlttJTD7_aA8",
  authDomain: "connect-115d5.firebaseapp.com",
  projectId: "connect-115d5",
  storageBucket: "connect-115d5.firebasestorage.app",
  messagingSenderId: "1043835872556",
  appId: "1:1043835872556:web:615f2955a8c040260ab889",
  measurementId: "G-D6RJ5J2M14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
