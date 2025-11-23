// La configuration Firebase (que vous obtenez dans votre console Firebase)
// DOIT être fournie ici dans une application Expo réelle.
// Nous allons utiliser les variables fournies par l'environnement Canvas pour la simulation.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Global variables check (provided by the Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

if (!firebaseConfig) {
  console.error("Firebase config is missing. Data persistence will not work.");
}

// Initialisation de Firebase
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export { db, auth, appId, initialAuthToken };