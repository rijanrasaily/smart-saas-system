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
  onSnapshot,
  updateDoc
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

/* ---------------- MENU ---------------- */

window.addMenu = async () => {

  const name = document.getElementById("itemName").value;
  const price = document.getElementById("itemPrice").value;
  const image = document.getElementById("itemImage").value;

  if (!name || !price) {
    alert("Enter name & price");
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

};

/* ---------------- LOAD MENU + DELETE ---------------- */

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

            <button onclick="deleteMenu('${id}')"
              style="background:red;color:white;padding:8px;border:none;border-radius:8px;">
              Delete
            </button>

          </div>
        `;
      });

    }
  );
}

window.deleteMenu = async (id) => {
  await deleteDoc(doc(db, "restaurants", uid, "menu", id));
};

/* ---------------- TABLES ---------------- */

window.addTable = async () => {

  const name = document.getElementById("tableName").value;

  await addDoc(
    collection(db, "restaurants", uid, "tables"),
    {
      name,
      createdAt: Date.now()
    }
  );

};

/* ---------------- ORDERS ---------------- */

function loadOrders() {

  const list = document.getElementById("ordersList");

  onSnapshot(
    collection(db, "restaurants", uid, "orders"),
    (snap) => {

      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const order = docSnap.data();
        const orderId = docSnap.id;

        if (order.status === "paid") return;

        let itemsText = "";

        order.items.forEach(i => {
          itemsText += `${i.name} x${i.qty}, `;
        });

        list.innerHTML += `
          <div class="order-card">

            🪑 Table: <b>${order.tableId}</b><br><br>

            🍔 ${itemsText}<br><br>

            💰 Total: Rs ${order.total}<br><br>

            📌 Status: ${order.status}

            <br><br>

            <button onclick="markPaid('${orderId}')"
              style="background:green;color:white;padding:8px;border:none;border-radius:8px;">
              Mark Paid
            </button>

          </div>
        `;
      });

    }
  );
}

/* ---------------- PAID → AUTO CLEAR ---------------- */

window.markPaid = async (orderId) => {

  await updateDoc(
    doc(db, "restaurants", uid, "orders", orderId),
    {
      status: "paid"
    }
  );

  alert("Payment completed & order cleared!");
};

/* ---------------- LOGOUT ---------------- */

window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
