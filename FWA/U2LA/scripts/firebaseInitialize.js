import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";

// Firebase configuration

  const firebaseConfig = {
    apiKey: "AIzaSyAQ-epoeVZHWvZotVGSPr9rvE0cQwpz3jo",
    authDomain: "franks-web-apps.firebaseapp.com",
    projectId: "franks-web-apps",
    storageBucket: "franks-web-apps.appspot.com",
    messagingSenderId: "456320242191",
    appId: "1:456320242191:web:f7ec05693af07364d1c97a",
    measurementId: "G-32LF0RV1LR"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Send Them Away For Calling 
export { analytics };
export { storage };
