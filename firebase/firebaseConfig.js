// Import Firebase core and service-specific modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getDatabase, ref as databaseRef, set, onValue, get, remove, update } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

console.log('Initializing Firebase...');
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQ-epoeVZHWvZotVGSPr9rvE0cQwpz3jo",
  authDomain: "franks-web-apps.firebaseapp.com",
  databaseURL: "https://franks-web-apps-default-rtdb.firebaseio.com",
  projectId: "franks-web-apps",
  storageBucket: "franks-web-apps.appspot.com",
  messagingSenderId: "456320242191",
  appId: "1:456320242191:web:f7ec05693af07364d1c97a",
  measurementId: "G-32LF0RV1LR"
};

console.log('Getting Firebase services...');
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

console.log('Firebase services initialized, Exporting Services');
// Export services and their related functions
export {
  app,
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile,
  database, databaseRef, set, onValue, get, remove, update,
  storage, storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject,
  analytics, logEvent,
  firestore, doc, getDoc, setDoc
};

console.log('Firebase Is Ready');




