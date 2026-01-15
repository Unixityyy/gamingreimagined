// creds.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyD2B6GywfjWNvYoPvBsM97Z_Q0YK1Y736Y",
  authDomain: "pwr-gamingreimagined.firebaseapp.com",
  projectId: "pwr-gamingreimagined",
  storageBucket: "pwr-gamingreimagined.firebasestorage.app",
  messagingSenderId: "1031733683542",
  appId: "1:1031733683542:web:772729552ffce628a1e2f7",
  measurementId: "G-SKQX2P9LVR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export let UID = null;

onAuthStateChanged(auth, user => {
  if (user) {
    UID = user.uid;
    console.log("Logged in:", UID);
  } else {
    UID = null;
    console.log("Not logged in");
  }
});
