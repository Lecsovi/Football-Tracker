// src/lib/firestore.js

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Save tournament data (groups + matches)
export const saveTournamentData = async (userId, data) => {
  const ref = doc(db, 'tournaments', userId);
  await setDoc(ref, data);
};

// Load tournament data
export const loadTournamentData = async (userId) => {
  const ref = doc(db, 'tournaments', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};