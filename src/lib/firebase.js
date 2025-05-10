// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDnbBkXr7zxAJi_yUuWe5TdjKd9pkWzoQ",
  authDomain: "football-tracker-bc03b.firebaseapp.com",
  projectId: "football-tracker-bc03b",
  storageBucket: "football-tracker-bc03b.firebasestorage.app",
  messagingSenderId: "395073998037",
  appId: "1:395073998037:web:b168dda79800c64d6de65c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);