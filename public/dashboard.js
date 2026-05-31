import { auth, db }
from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let uid = null;

const restaurantTitle =
document.getElementById(
  "restaurantTitle"
);

const planBadge =
document.getElementById(
  "planBadge"
);

window.logout = async () => {

  await signOut(auth);

  location.href =
    "index.html";

};

onAuthStateChanged(
  auth,
  async user => {

    if(!user){

      location.href =
        "index.html";

      return;
    }

    uid = user.uid;

    loadRestaurant();

    loadMenu();

    loadTables();

    loadOrders();

  }
);

async function loadRestaurant(){

  const docRef =
    doc(
      db,
      "restaurants",
      uid
    );

  const snap =
    await getDoc(
      docRef
    );

  if(!snap.exists())
    return;

  const data =
    snap.data();

  restaurantTitle.innerText =
    data.restaurantName;

  planBadge.innerText =
    data.plan.toUpperCase();

}

/* MENU */

window.addMenu =
async () => {

  const name =
    document
      .getElementById(
        "itemName"
      )
      .value;

  const price =
    document
      .getElementById(
        "itemPrice"
      )
      .value;

  if(!name || !price)
    return;

  await addDoc(
    collection(
      db,
      "restaurants",
      uid,
      "menu"
    ),
    {
      name,
      price
    }
  );

};

function loadMenu(){

  onSnapshot(

    collection(
      db,
      "restaurants",
      uid,
      "menu"
    ),

    snap => {

      const list =
        document
          .getElementById(
            "menuList"
          );

      list.innerHTML =
        "";

      snap.forEach(
        doc => {

          const item =
            doc.data();

          list.innerHTML += `
            <div class="order-card">
              ${item.name}
              - ₹${item.price}
            </div>
          `;

        }
      );

    }

  );

}

/* TABLES */

import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let uid = null;

/* AUTH */
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) location.href = "index.html";
  uid = user.uid;

  loadTables();
  loadOrders();
});

/* ===================== TABLES ===================== */

window.addTable = async () => {

  const name = document.getElementById("tableName").value;

  if (!name) return;

  const tableRef = await addDoc(
    collection(db, "restaurants", uid, "tables"),
    {
      name: name,
      createdAt: Date.now()
    }
  );

  const qrLink =
    `${location.origin}/table.html?r=${uid}&t=${tableRef.id}`;

  alert("Table created!\nQR Link:\n" + qrLink);

};

function loadTables() {

  onSnapshot(
    collection(db, "restaurants", uid, "tables"),
    (snap) => {

      const list = document.getElementById("tableList");
      list.innerHTML = "";

      snap.forEach((doc) => {

        const t = doc.data();

        const qrLink =
          `${location.origin}/table.html?r=${uid}&t=${doc.id}`;

        list.innerHTML += `
          <div class="order-card">

            🪑 ${t.name}
            <br><br>

            <small>${qrLink}</small>

          </div>
        `;

      });

    }
  );

}
/* ORDERS */

import {
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function loadOrders() {

  onSnapshot(
    collection(db, "restaurants", uid, "orders"),
    (snap) => {

      const list = document.getElementById("ordersList");
      list.innerHTML = "";

      snap.forEach((doc) => {

        const o = doc.data();

        let itemsText = "";

        o.items.forEach(i => {
          itemsText += `${i.name} `;
        });

        list.innerHTML += `
          <div class="order-card">

            🪑 Table: ${o.tableId}
            <br>
            🍔 Items: ${itemsText}
            <br>
            📌 Status: ${o.status}

          </div>
        `;

      });

    }
  );

}
