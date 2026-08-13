import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCp6UCe8Otje2mbkAEzBgHBgpLXIl2jf1U",
  authDomain: "geoalerta-fundivel.firebaseapp.com",
  projectId: "geoalerta-fundivel",
  storageBucket: "geoalerta-fundivel.firebasestorage.app",
  messagingSenderId: "975389486216",
  appId: "1:975389486216:web:9cd8bf33b0b19582e5833d",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
export const auth = getAuth(app);
export const db = getFirestore(app);
