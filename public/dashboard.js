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
  onSnapshot,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= STATE ================= */
let uid;
let tables = [];
let orders = [];
let menu = [];
let activeTable = null;

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  uid = user.uid;

  loadRestaurant();
  listenTables();
  listenOrders();
  listenMenu();
});

/* ================= RESTAURANT ================= */
async function loadRestaurant() {
  const snap = await getDoc(doc(db, "restaurants", uid));
  const data = snap.data();

  document.getElementById("restaurantTitle").innerText =
    data?.restaurantName || "Restaurant";

  document.getElementById("planBadge").innerText =
    (data?.plan || "trial").toUpperCase();
}

/* ================= LOGOUT ================= */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};

/* ================= TABLES ================= */
function listenTables() {
  onSnapshot(collection(db, "restaurants", uid, "tables"), (snap) => {
    tables = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTables();
  });
}

window.addTable = async () => {
  const name = document.getElementById("tableName").value;
  if (!name) return;

  await addDoc(collection(db, "restaurants", uid, "tables"), {
    name,
    createdAt: Date.now()
  });

  document.getElementById("tableName").value = "";
};

/* ================= ORDERS ================= */
function listenOrders() {
  onSnapshot(collection(db, "restaurants", uid, "orders"), (snap) => {
    orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTables();
    renderTableView();
  });
}

/* ================= MENU ================= */
function listenMenu() {
  onSnapshot(collection(db, "restaurants", uid, "menu"), (snap) => {
    menu = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderMenu();
  });
}

function renderMenu() {
  const el = document.getElementById("menuList");
  el.innerHTML = "";

  menu.forEach(m => {
    el.innerHTML += `
      <div class="order-card">
        🍔 <b>${m.name}</b><br>
        ₹ ${m.price}
      </div>
    `;
  });
}

/* ================= TABLE GRID ================= */
function renderTables() {
  const grid = document.getElementById("tableGrid");
  grid.innerHTML = "";

  tables.forEach(t => {

    const tOrders = orders.filter(o => o.tableId === t.id);
    const total = tOrders.reduce((s, o) => s + (o.total || 0), 0);

    const box = document.createElement("div");
    box.className = "order-card";

    box.innerHTML = `
      🪑 <b>${t.name}</b>
      ${tOrders.length ? `<span style="color:red;float:right">●</span>` : ""}
      <br><br>
      💰 ₹ ${total}
      <br><br>
      <button class="btn-primary small">Open</button>
    `;

    box.querySelector("button").onclick = () => openTable(t.id);

    grid.appendChild(box);
  });
}

/* ================= ENTER TABLE ================= */
window.openTable = (id) => {

  activeTable = id;

  document.getElementById("tableGrid").classList.add("hidden");
  document.getElementById("tableView").classList.remove("hidden");

  renderTableView();
};

/* ================= TABLE VIEW ================= */
function renderTableView() {

  if (!activeTable) return;

  const table = tables.find(t => t.id === activeTable);
  const tOrders = orders.filter(o => o.tableId === activeTable);

  const total = tOrders.reduce((s, o) => s + (o.total || 0), 0);

  const el = document.getElementById("tableView");

  el.innerHTML = `
    <div class="card">

      <button class="btn-secondary small" onclick="closeTable()">
        ← Back
      </button>

      <h2>🪑 ${table?.name}</h2>

      <h3>💰 Total: ₹ ${total}</h3>

      <button class="btn-success" onclick="markPaid()">
        Mark as Paid
      </button>

      <div style="margin-top:15px;"></div>

      ${tOrders.length === 0
        ? `<p>No orders yet</p>`
        : tOrders.map(o => `
          <div class="order-card">
            🍔 ${o.items?.map(i => i.name).join(", ")}
            <br>
            💰 ₹ ${o.total}
            <br>
            📌 ${o.status || "pending"}
          </div>
        `).join("")
      }

    </div>
  `;
}

/* ================= CLOSE TABLE ================= */
window.closeTable = () => {
  activeTable = null;

  document.getElementById("tableGrid").classList.remove("hidden");
  document.getElementById("tableView").classList.add("hidden");
};

/* ================= MARK PAID ================= */
window.markPaid = async () => {

  const tOrders = orders.filter(o => o.tableId === activeTable);

  for (let o of tOrders) {
    await deleteDoc(doc(db, "restaurants", uid, "orders", o.id));
  }

  closeTable();
};

/* ================= QR ================= */
window.openQR = () => {

  const panel = document.getElementById("qrPanel");
  panel.style.display = "block";

  panel.innerHTML = `
    <div class="card">

      <button class="btn-danger small" onclick="closeQR()">Close</button>

      <h3>Tables QR</h3>

      ${tables.map(t => {
        const url = `${location.origin}/table.html?r=${uid}&t=${t.id}`;

        return `
          <div class="order-card">
            🪑 ${t.name}
            <br><br>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}">
          </div>
        `;
      }).join("")}

    </div>
  `;
};

window.closeQR = () => {
  document.getElementById("qrPanel").style.display = "none";
};
