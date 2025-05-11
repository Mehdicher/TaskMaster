
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// IMPORTANT: Replace these with your actual Firebase project configuration
// These are placeholder values and will not work.
// You can find your Firebase config in the Firebase console:
// Project settings > General > Your apps > Web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvMn_2D80njjp3pIunOIJW09UTNddUBtQ",
  authDomain: "taskmaster-q35wl.firebaseapp.com",
  projectId: "taskmaster-q35wl",
  storageBucket: "taskmaster-q35wl.firebasestorage.app",
  messagingSenderId: "899224370804",
  appId: "1:899224370804:web:09c0b7a6fabd9d6971db21"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (typeof window !== 'undefined') {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Provide dummy initializers for server-side rendering or environments where Firebase isn't fully initialized
  // This prevents errors during Next.js build or server-side execution
  // Ensure client-side components that use Firebase are properly guarded (e.g., useEffect for initialization)
  // @ts-ignore
  app = null; 
  // @ts-ignore
  auth = null;
  // @ts-ignore
  db = null;
}


export { app, auth, db };
