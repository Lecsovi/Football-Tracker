// src/lib/firestore.js

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function loadTournamentData(username) {
  const docRef = doc(db, 'tournaments', username);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function saveTournamentData(username, data) {
  const docRef = doc(db, 'tournaments', username);
  await setDoc(docRef, data, { merge: true });
}

// Load tournament data
export const loadTournamentData = async (userId) => {
  const ref = doc(db, 'tournaments', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};