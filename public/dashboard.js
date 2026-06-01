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

/* ---------------- LOGOUT ---------------- */

window.logout = async () => {

  await signOut(auth);

  location.href = "index.html";

};

/* ---------------- RESTAURANT INFO ---------------- */

async function loadRestaurant() {

  try {

    const snap =
      await getDoc(
        doc(db, "restaurants", uid)
      );

    if (!snap.exists()) return;

    const data = snap.data();

    const title =
      document.getElementById("restaurantTitle");

    const badge =
      document.getElementById("planBadge");

    if (title)
      title.innerText =
        data.restaurantName || "Restaurant";

    if (badge)
      badge.innerText =
        (data.plan || "trial").toUpperCase();

  }
  catch (e) {
    console.error(e);
  }

}

/* ---------------- MENU ---------------- */

window.addMenu = async () => {

  const name =
    document.getElementById("itemName").value;

  const price =
    document.getElementById("itemPrice").value;

  if (!name || !price) {
    alert("Enter item and price");
    return;
  }

  try {

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

    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";

  }
  catch (e) {

    console.error(e);

  }

};

function loadMenu() {

  onSnapshot(
    collection(
      db,
      "restaurants",
      uid,
      "menu"
    ),
    (snap) => {

      const list =
        document.getElementById("menuList");

      if (!list) return;

      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const item =
          docSnap.data();

        list.innerHTML += `
          <div class="order-card">
            🍔 ${item.name}
            <br>
            ₹ ${item.price}
          </div>
        `;

      });

    }
  );

}

/* ---------------- TABLES ---------------- */

window.addTable = async () => {

  const tableName =
    document.getElementById("tableName").value;

  if (!tableName) {
    alert("Enter table name");
    return;
  }

  try {

    await addDoc(
      collection(
        db,
        "restaurants",
        uid,
        "tables"
      ),
      {
        name: tableName,
        createdAt: Date.now()
      }
    );

    document.getElementById("tableName").value = "";

  }
  catch (e) {

    console.error(e);

  }

};

function loadTables() {

  onSnapshot(
    collection(
      db,
      "restaurants",
      uid,
      "tables"
    ),
    (snap) => {

      const list =
        document.getElementById("tableList");

      if (!list) return;

      list.innerHTML = "";

      snap.forEach((docSnap) => {

        const table =
          docSnap.data();

        const tableId =
          docSnap.id;

        const qrUrl =
          `${location.origin}/table.html?r=${uid}&t=${tableId}`;

        list.innerHTML += `

          <div class="order-card">

            <h3>🪑 ${table.name}</h3>

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}"
              style="
                width:200px;
                display:block;
                margin:auto;
                margin-top:10px;
                margin-bottom:10px;
              "
            >

            <button
              class="btn-primary"
              onclick="window.open('${qrUrl}','_blank')">

              Test QR

            </button>

          </div>

        `;

      });

    }
  );

}

/* ---------------- ORDERS ---------------- */

function loadOrders() {

  const ordersList = document.getElementById("ordersList");

  onSnapshot(
    collection(db, "restaurants", uid, "tables"),
    (tableSnap) => {

      ordersList.innerHTML = "";

      tableSnap.forEach(async (tableDoc) => {

        const tableId = tableDoc.id;

        const ordersSnap = await getDocs(
          collection(
            db,
            "restaurants",
            uid,
            "tables",
            tableId,
            "orders"
          )
        );

        let total = 0;
        let itemsText = "";

        ordersSnap.forEach(orderDoc => {

          const order = orderDoc.data();

          order.items.forEach(i => {
            itemsText += `${i.name} x${i.qty}, `;
            total += i.price * i.qty;
          });

        });

        ordersList.innerHTML += `
          <div class="order-card">

            <h3>🪑 ${tableId}</h3>

            🍔 ${itemsText || "No orders"}<br><br>

            💰 Total: Rs ${total}<br><br>

            📌 Status: pending

          </div>
        `;

      });

    }
  );
}

window.markPaid = async function(tableId) {

  const ordersRef = collection(
    db,
    "restaurants",
    uid,
    "tables",
    tableId,
    "orders"
  );

  const snap = await getDocs(ordersRef);

  snap.forEach(async (d) => {
    await deleteDoc(d.ref);
  });

  alert("Table cleared (Paid)");
};
