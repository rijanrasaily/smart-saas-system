import { auth, db }
from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const message =
document.getElementById("message");

window.signup = async () => {

  try {

    const restaurantName =
      document.getElementById(
        "restaurantName"
      ).value;

    const email =
      document.getElementById(
        "email"
      ).value;

    const password =
      document.getElementById(
        "password"
      ).value;

    if(
      !restaurantName ||
      !email ||
      !password
    ){
      return message.innerText =
      "Please fill all fields";
    }

    const user =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const trialEnd =
      Date.now() +
      (7 * 24 * 60 * 60 * 1000);

    await setDoc(
      doc(
        db,
        "restaurants",
        user.user.uid
      ),
      {
        restaurantName,
        email,

        plan:"trial",

        trialDays:7,

        trialEnd,

        status:"active",

        createdAt:
        Date.now()
      }
    );

    location.href =
      "dashboard.html";

  }
  catch(error){

    message.innerText =
      error.message;

  }

};

window.login = async () => {

  try {

    const email =
      document.getElementById(
        "email"
      ).value;

    const password =
      document.getElementById(
        "password"
      ).value;

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    location.href =
      "dashboard.html";

  }
  catch(error){

    message.innerText =
      error.message;

  }

};