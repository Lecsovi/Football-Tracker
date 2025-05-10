import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function saveTournamentData(userId, data) {
  const ref = doc(db, 'tournaments', userId);
  await setDoc(ref, {
    ...data,
    teamNames: JSON.parse(localStorage.getItem('tournament-team-names') || '{}')
  }, { merge: true });
}

export async function loadTournamentData(userId) {
  const ref = doc(db, 'tournaments', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data(); // Includes: tournament, matches, teamNames
  }
  return null;
}