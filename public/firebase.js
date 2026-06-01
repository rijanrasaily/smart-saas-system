import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmMfnzk2Qa3nsfQSynkATm7prP8fcyCPI",
  authDomain: "smart-saas-system.firebaseapp.com",
  projectId: "smart-saas-system",
  storageBucket: "smart-saas-system.firebasestorage.app",
  messagingSenderId: "950345796748",
  appId: "1:950345796748:web:72a57f12febf4ad7c5ffa9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
