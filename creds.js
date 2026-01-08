// creds.js
// 🔥 Firebase SDKs
const firebaseAppScript = document.createElement('script');
firebaseAppScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
firebaseAppScript.onload = () => {
    const firebaseAuthScript = document.createElement('script');
    firebaseAuthScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    firebaseAuthScript.onload = initFirebase;
    document.head.appendChild(firebaseAuthScript);
};
document.head.appendChild(firebaseAppScript);

// Global UID variable
var UID = null;

const firebaseConfig = {
  apiKey: "AIzaSyD2B6GywfjWNvYoPvBsM97Z_Q0YK1Y736Y",
  authDomain: "pwr-gamingreimagined.firebaseapp.com",
  projectId: "pwr-gamingreimagined",
  storageBucket: "pwr-gamingreimagined.firebasestorage.app",
  messagingSenderId: "1031733683542",
  appId: "1:1031733683542:web:772729552ffce628a1e2f7",
  measurementId: "G-SKQX2P9LVR"
};

// Initialize Firebase after SDKs load
function initFirebase() {
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Track logged-in user
    auth.onAuthStateChanged(user => {
        if (user) {
            UID = user.uid;
            console.log("Logged-in UID:", UID);
        } else {
            UID = null;
            console.log("No user logged in");
        }
    });
}
