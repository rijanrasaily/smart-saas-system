import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------------- CREATE RESTAURANT ---------------- */

window.createUser = async () => {

  const restaurantName =
    document.getElementById("rName").value.trim();

  const email =
    document.getElementById("rEmail").value.trim();

  const password =
    document.getElementById("rPassword").value;

  if (!restaurantName || !email || !password) {
    alert("Fill all fields");
    return;
  }

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const uid =
      userCredential.user.uid;

    await setDoc(
      doc(db, "restaurants", uid),
      {
        restaurantName,
        email,
        active: true,
        plan: "trial",
        trialEnd:
          Date.now() + (7 * 86400000),
        createdAt: Date.now()
      }
    );

    alert("Restaurant created");

  } catch (err) {

    alert(err.message);

  }

};

/* ---------------- LOAD USERS ---------------- */

function loadUsers() {

  onSnapshot(
    collection(db, "restaurants"),
    (snap) => {

      const container =
        document.getElementById("users");

      container.innerHTML = "";

      snap.forEach((docSnap) => {

        const data =
          docSnap.data();

        const uid =
          docSnap.id;

        container.innerHTML += `

          <div class="order-card">

            <h3>
              ${data.restaurantName || "Restaurant"}
            </h3>

            📧 ${data.email || "-"}

            <br><br>

            💎 Plan:
            ${data.plan || "trial"}

            <br><br>

            📌 Status:
            <b>
              ${data.active === false
                ? "Disabled"
                : "Active"}
            </b>

            <br><br>

            <button
              onclick="toggleAccount(
                '${uid}',
                ${data.active === false}
              )"
              class="btn-primary">

              ${data.active === false
                ? "Enable"
                : "Disable"}

            </button>

            <br><br>

            <button
              onclick="deleteRestaurant(
                '${uid}'
              )"
              class="btn-danger">

              Delete Data

            </button>

          </div>

        `;
      });

    }
  );

}

/* ---------------- ENABLE / DISABLE ---------------- */

window.toggleAccount =
async (uid, disabled) => {

  try {

    await updateDoc(
      doc(db, "restaurants", uid),
      {
        active: disabled
      }
    );

  } catch (err) {

    alert(err.message);

  }

};

/* ---------------- DELETE RESTAURANT DATA ---------------- */

window.deleteRestaurant =
async (uid) => {

  const ok =
    confirm(
      "Delete restaurant data?"
    );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(db, "restaurants", uid)
    );

    alert(
      "Restaurant data deleted"
    );

  } catch (err) {

    alert(err.message);

  }

};

loadUsers();
