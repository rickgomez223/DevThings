
	
	
	// Import Firebase core and service-specific modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getDatabase, ref as databaseRef, set, onValue, get, remove, update } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

console.log('Initializing Firebase...');
// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAtTnLj0NRnF8mu8zkaPv9pGJjDQF44_6I",
    authDomain: "rickgomez223.firebaseapp.com",
    databaseURL: "https://rickgomez223-default-rtdb.firebaseio.com",
    projectId: "rickgomez223",
    storageBucket: "rickgomez223.appspot.com",
    messagingSenderId: "417545171709",
    appId: "1:417545171709:web:736a61acabab07bee04494"
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
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, signInWithPopup, GoogleAuthProvider, 
  database, databaseRef, set, onValue, get, remove, update,
  storage, storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject,
  analytics, logEvent,
  firestore, doc, getDoc, setDoc
};

console.log('Firebase Is Ready');




