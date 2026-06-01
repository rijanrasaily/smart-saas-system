import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const restaurantId = params.get("r");
const tableId = params.get("t");

let cart = [];

/* ---------------- LOAD MENU ---------------- */

async function loadMenu() {

  const menuContainer = document.getElementById("menuList");
  menuContainer.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "restaurants", restaurantId, "menu")
  );

  snapshot.forEach((doc) => {

    const item = doc.data();

    menuContainer.innerHTML += `
      <div class="order-card">

        ${item.image ? `
          <img src="${item.image}"
            style="width:100%;border-radius:12px;margin-bottom:10px;">
        ` : ""}

        <h3>${item.name}</h3>
        <p>Rs. ${item.price}</p>

        <button onclick="addToCart('${item.name}', ${item.price})">
          Add
        </button>

      </div>
    `;
  });
}

/* ---------------- CART ---------------- */

window.addToCart = function(name, price) {

  const existing = cart.find(i => i.name === name);

  if (existing) existing.qty++;
  else cart.push({ name, price, qty: 1 });

  renderCart();
};

function renderCart() {

  const cartBox = document.getElementById("cart");

  let html = "";
  let total = 0;

  cart.forEach((item, index) => {

    const subtotal = item.price * item.qty;
    total += subtotal;

    html += `
      <div class="order-card">

        <b>${item.name}</b><br>
        Rs ${item.price}<br><br>

        <button onclick="decreaseQty(${index})">-</button>
        ${item.qty}
        <button onclick="increaseQty(${index})">+</button>

        <br><br>
        Rs ${subtotal}

      </div>
    `;
  });

  html += `<h2>Total: Rs ${total}</h2>`;
  cartBox.innerHTML = html;
}

window.increaseQty = (i) => {
  cart[i].qty++;
  renderCart();
};

window.decreaseQty = (i) => {
  cart[i].qty--;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  renderCart();
};

/* ---------------- PLACE ORDER ---------------- */

window.placeOrder = async function() {

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  await addDoc(
    collection(db, "restaurants", restaurantId, "orders"),
    {
      tableId,
      items: cart,
      total,
      status: "pending",
      createdAt: Date.now()
    }
  );

  alert("Order placed!");

  cart = [];
  renderCart();
};

loadMenu();
