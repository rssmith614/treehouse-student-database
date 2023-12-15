// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// import { connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { connectAuthEmulator } from "firebase/auth";
import { getStorage } from "firebase/storage";
// import { getFunctions } from "firebase/functions";
// import { connectFunctionsEmulator } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxcwcn9iAgiI1XhBgvivo_lA3Lf53mhw0",
  authDomain: "student-database-2aa8d.firebaseapp.com",
  databaseURL: "https://student-database-2aa8d-default-rtdb.firebaseio.com",
  projectId: "student-database-2aa8d",
  storageBucket: "student-database-2aa8d.appspot.com",
  messagingSenderId: "272553516141",
  appId: "1:272553516141:web:410a204b241f5f4d26f364",
  measurementId: "G-ZQM9BZCXXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);
// const functions = getFunctions(app);

// eslint-disable-next-line no-restricted-globals
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export { app, analytics, db, auth, storage };