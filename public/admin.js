import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* 🔐 CHANGE THIS TO YOUR ADMIN EMAIL */
const ADMIN_EMAIL = "rijanrasaily1@gmail.com";

window.loginAdmin = async () => {

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    /* 🚨 ADMIN CHECK */
    if (user.email !== ADMIN_EMAIL) {

      alert("Access denied: Not admin");

      await signOut(auth);

      return;

    }

    alert("Welcome Admin");

    location.href =
      "admin-dashboard.html";

  }

  catch (error) {

    alert(error.message);

  }

};

/* OPTIONAL LOGOUT */
window.logoutAdmin = async () => {

  await signOut(auth);

  location.href =
    "admin.html";

};