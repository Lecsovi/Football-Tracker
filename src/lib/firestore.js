// src/lib/firestore.js

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { db } from './firebase'; // Ensure you have initialized Firebase
import { doc, getDoc } from 'firebase/firestore';

export async function loadTournamentData(username) {
  const docRef = doc(db, 'tournaments', username);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log('No such document!');
    return null;
  }
}


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