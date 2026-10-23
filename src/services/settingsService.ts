import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { PlatformSettings } from '../types';
import { DEFAULT_PLATFORM_SETTINGS } from '../data/tunisiaData';

const SETTINGS_DOC = 'platform_settings/default';

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const docRef = doc(db, 'platform_settings', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    } else {
      // Initialize default
      await setDoc(docRef, DEFAULT_PLATFORM_SETTINGS);
      return DEFAULT_PLATFORM_SETTINGS;
    }
  } catch (error) {
    console.warn('Could not read settings from Firestore, using default local settings', error);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export async function updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  try {
    const docRef = doc(db, 'platform_settings', 'default');
    const updated = {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, updated, { merge: true });
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, SETTINGS_DOC);
  }
}
