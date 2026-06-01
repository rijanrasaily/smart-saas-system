import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.signup = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const restaurantName = document.getElementById("restaurantName").value;

  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "restaurants", user.user.uid), {
      restaurantName,
      email,
      plan: "trial",
      trialEnd: Date.now() + 7 * 86400000,
      createdAt: Date.now()
    });

    location.href = "dashboard.html";

  } catch (err) {
    alert(err.message);
  }
};

window.login = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
};
