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

window.addTable =
async () => {

  const tableName =
    document
      .getElementById(
        "tableName"
      )
      .value;

  if(!tableName)
    return;

  await addDoc(

    collection(
      db,
      "restaurants",
      uid,
      "tables"
    ),

    {
      name:
      tableName
    }

  );

};

function loadTables(){

  onSnapshot(

    collection(
      db,
      "restaurants",
      uid,
      "tables"
    ),

    snap => {

      const list =
        document
          .getElementById(
            "tableList"
          );

      list.innerHTML =
        "";

      snap.forEach(
        doc => {

          const table =
            doc.data();

          list.innerHTML += `
            <div class="order-card">

              ${table.name}

            </div>
          `;

        }
      );

    }

  );

}

/* ORDERS */

function loadOrders(){

  onSnapshot(

    collection(
      db,
      "restaurants",
      uid,
      "orders"
    ),

    snap => {

      const list =
        document
          .getElementById(
            "ordersList"
          );

      list.innerHTML =
        "";

      snap.forEach(
        doc => {

          const order =
            doc.data();

          list.innerHTML += `
            <div class="order-card">

              🪑 ${order.table}

              <br>

              🍔 ${order.item}

              <br>

              ₹ ${order.price}

            </div>
          `;

        }
      );

    }

  );

}