import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isMock } from '../firebase/config';

const MOCK_KEY = (uid) => `omnisocial_settings_${uid}`;

/**
 * Load user settings from Firestore (or localStorage in mock mode).
 * Returns { botToken, channelId } or null if not set.
 */
export const loadUserSettings = async (uid) => {
  if (isMock) {
    const raw = localStorage.getItem(MOCK_KEY(uid));
    return raw ? JSON.parse(raw) : null;
  }
  const ref = doc(db, 'userSettings', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

/**
 * Save user settings to Firestore (or localStorage in mock mode).
 */
export const saveUserSettings = async (uid, settings) => {
  if (isMock) {
    localStorage.setItem(MOCK_KEY(uid), JSON.stringify(settings));
    return;
  }
  const ref = doc(db, 'userSettings', uid);
  await setDoc(ref, settings, { merge: true });
};
