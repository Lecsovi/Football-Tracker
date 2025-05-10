import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function loadTournamentData(userId) {
  const ref = doc(db, 'tournaments', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveTournamentData(userId, data) {
  const ref = doc(db, 'tournaments', userId);
  await setDoc(ref, data, { merge: true });
}