import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import React, { createContext, useEffect, useState } from 'react';

// Firebase configuration – values are read from environment variables.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp = null;
export const initFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    // expose globally for legacy compatibility (e.g., older code using window.firebase)
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.firebase = firebase;
    }
  }
  return firebase.auth();
};

// Convenience wrapper to obtain a Firebase Auth instance (same as initFirebase).
export const getFirebaseAuth = async () => {
  // initFirebase now returns the auth instance directly.
  return initFirebase();
};

// ----- React Auth Context -----
const AuthContext = createContext({ user: null, setUser: () => {} });
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = initFirebase();
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};