import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(location.search);

const restaurantId = params.get("r");
const tableId = params.get("t");

let cart = [];

/* LOAD MENU */
async function loadMenu() {

  const snap = await getDocs(collection(db, "restaurants", restaurantId, "menu"));

  const menu = document.getElementById("menuList");
  menu.innerHTML = "";

  snap.forEach(doc => {

    const item = doc.data();

    menu.innerHTML += `
      <div class="order-card">

        🍔 ${item.name}
        <br>
        ₹ ${item.price}

        <button onclick="add('${item.name}', ${item.price})">
          Add
        </button>

      </div>
    `;
  });
}

window.add = (name, price) => {

  const found = cart.find(i => i.name === name);

  if (found) found.qty++;
  else cart.push({ name, price, qty: 1 });

  renderCart();
};

function renderCart() {

  const box = document.getElementById("cart");

  let total = 0;
  let html = "";

  cart.forEach((i, idx) => {

    const sub = i.price * i.qty;
    total += sub;

    html += `
      <div class="order-card">

        ${i.name}
        <br>

        Qty: ${i.qty}

        <br>

        ₹ ${sub}

      </div>
    `;
  });

  html += `<h3>Total: ₹ ${total}</h3>`;

  box.innerHTML = html;
}

window.placeOrder = async () => {

  if (!cart.length) return alert("Cart empty");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  await addDoc(collection(db, "restaurants", restaurantId, "orders"), {
    tableId,
    items: cart,
    total,
    status: "pending",
    createdAt: Date.now()
  });

  alert("Order placed!");

  cart = [];
  renderCart();
};

loadMenu();
