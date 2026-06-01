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

  if (!email || !password || !restaurantName)
    return alert("Fill all fields");

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "restaurants", userCred.user.uid), {
    restaurantName,
    email,
    plan: "trial",
    active: true,
    createdAt: Date.now()
  });

  location.href = "dashboard.html";
};

window.login = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);

  location.href = "dashboard.html";
};
