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
    alert("Enter name and price");
    return;
  }

  try {

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

  } catch (err) {
    console.error(err);
    alert("Failed to add menu item");
  }

};

/* ---------------- LOAD MENU ---------------- */

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

/* ---------------- 🔥 FIXED TABLE SYSTEM ---------------- */

window.addTable = async () => {

  const input = document.getElementById("tableName");
  const name = input.value.trim();

  if (!name) {
    alert("Enter table name");
    return;
  }

  try {

    // create table with better structure
    await addDoc(
      collection(db, "restaurants", uid, "tables"),
      {
        name,
        status: "empty",
        createdAt: Date.now()
      }
    );

    input.value = "";

    alert("Table added successfully!");

  } catch (err) {
    console.error("Table error:", err);
    alert("Failed to add table");
  }

};

/* ---------------- LOAD TABLES + QR ---------------- */

function loadTables() {

  onSnapshot(
    collection(db, "restaurants", uid, "tables"),
    (snap) => {

      const list = document.getElementById("tableList");
      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const table = docSnap.data();
        const tableId = docSnap.id;

        const qrUrl =
          `${location.origin}/table.html?r=${uid}&t=${tableId}`;

        list.innerHTML += `
          <div class="order-card">

            <h3>🪑 ${table.name}</h3>

            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}"
              style="width:180px;margin:10px auto;display:block;">

            <button onclick="window.open('${qrUrl}')"
              class="btn-primary">
              Open Table
            </button>

          </div>
        `;
      });

    }
  );
}

/* ---------------- ORDERS ---------------- */

function loadOrders() {

  onSnapshot(
    collection(db, "restaurants", uid, "orders"),
    (snap) => {

      const list = document.getElementById("ordersList");
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

/* ---------------- PAID SYSTEM ---------------- */

window.markPaid = async (orderId) => {

  await updateDoc(
    doc(db, "restaurants", uid, "orders", orderId),
    {
      status: "paid"
    }
  );

  alert("Marked as Paid");
};

/* ---------------- LOGOUT ---------------- */

window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
