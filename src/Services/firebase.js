// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";
// import { getFunctions } from "firebase/functions";
// import { connectFunctionsEmulator } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = require('./firebase-config.json');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app, firebaseConfig.databaseId);
const auth = getAuth();
auth.tenantId = firebaseConfig.tenantId;
const storage = getStorage(app);
// const functions = getFunctions(app);

// eslint-disable-next-line no-restricted-globals
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, analytics, db, auth, storage };