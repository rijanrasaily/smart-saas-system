import { auth, db }
from "./firebase.js";

import {
  createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* CREATE USER */
window.createUser =
async () => {

  const email =
    document.getElementById("rEmail").value;

  const password =
    document.getElementById("rPassword").value;

  const user =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await addDoc(
    collection(db,"restaurants"),
    {
      uid: user.user.uid,
      email,
      plan: "trial",
      trialEnd: Date.now()+7*86400000
    }
  );

  alert("Restaurant created!");

};