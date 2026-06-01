import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  doc as docRef,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let uid = null;

/* ---------------- AUTH ---------------- */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    location.href = "index.html";
    return;
  }

  uid = user.uid;

  await loadRestaurant();

  loadMenu();
  loadTables();
  loadOrders();

});

/* ---------------- RESTAURANT ---------------- */

async function loadRestaurant() {

  const snap = await getDoc(doc(db, "restaurants", uid));

  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("restaurantTitle").innerText =
    data.restaurantName || "Restaurant";

}

/* ---------------- MENU ADD ---------------- */

window.addMenu = async () => {

  const name = document.getElementById("itemName").value;
  const price = document.getElementById("itemPrice").value;
  const image = document.getElementById("itemImage").value;

  if (!name || !price) {
    alert("Enter name and price");
    return;
  }

  await addDoc(
    collection(db, "restaurants", uid, "menu"),
    {
      name,
      price: Number(price),
      image: image || ""
    }
  );

  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  document.getElementById("itemImage").value = "";

};

/* ---------------- MENU LOAD + DELETE ---------------- */

function loadMenu() {

  onSnapshot(
    collection(db, "restaurants", uid, "menu"),
    (snap) => {

      const list = document.getElementById("menuList");
      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const item = docSnap.data();
        const id = docSnap.id;

        list.innerHTML += `
          <div class="order-card">

            ${item.image ? `
              <img src="${item.image}"
                style="width:100%;border-radius:12px;margin-bottom:10px;">
            ` : ""}

            <b>${item.name}</b><br>
            ₹ ${item.price}

            <br><br>

            <button
              onclick="deleteMenuItem('${id}')"
              style="
                background:#ef4444;
                color:white;
                padding:8px;
                border:none;
                border-radius:8px;
                cursor:pointer;
              ">
              Delete
            </button>

          </div>
        `;
      });

    }
  );
}

/* ---------------- DELETE MENU ITEM ---------------- */

window.deleteMenuItem = async (id) => {

  if (!confirm("Delete this menu item?")) return;

  await deleteDoc(
    docRef(db, "restaurants", uid, "menu", id)
  );

};

/* ---------------- TABLES ---------------- */

window.addTable = async () => {

  const tableName = document.getElementById("tableName").value;

  if (!tableName) {
    alert("Enter table name");
    return;
  }

  await addDoc(
    collection(db, "restaurants", uid, "tables"),
    {
      name: tableName,
      createdAt: Date.now()
    }
  );

  document.getElementById("tableName").value = "";

};

/* ---------------- ORDERS (unchanged) ---------------- */

function loadOrders() {
  onSnapshot(
    collection(db, "restaurants", uid, "orders"),
    (snap) => {

      const list = document.getElementById("ordersList");
      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const order = docSnap.data();

        let itemsText = "";

        if (order.items) {
          order.items.forEach(i => {
            itemsText += `${i.name} x${i.qty}, `;
          });
        }

        list.innerHTML += `
          <div class="order-card">

            🪑 Table: ${order.tableId}<br><br>

            🍔 ${itemsText}<br><br>

            📌 ${order.status}

          </div>
        `;
      });

    }
  );
}
