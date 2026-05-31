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

  const snap = await getDocs(
    collection(db, "restaurants", restaurantId, "menu")
  );

  const list = document.getElementById("menuList");
  list.innerHTML = "";

  snap.forEach((doc) => {

    const item = doc.data();

    list.innerHTML += `
      <div class="order-card">

        <b>${item.name}</b> - ₹${item.price}

        <button class="btn-success"
          style="float:right;width:auto;padding:5px 10px"
          onclick="addToCart('${item.name}',${item.price})">
          +
        </button>

      </div>
    `;

  });

}

window.addToCart = (name, price) => {
  cart.push({ name, price });
  renderCart();
};

function renderCart() {

  const box = document.getElementById("cart");
  box.innerHTML = "";

  cart.forEach((item) => {

    box.innerHTML += `
      <div class="order-card">
        ${item.name} - ₹${item.price}
      </div>
    `;

  });

}

/* PLACE ORDER */
window.placeOrder = async () => {

  if (cart.length === 0) return;

  await addDoc(
    collection(db, "restaurants", restaurantId, "orders"),
    {
      tableId: tableId,
      items: cart,
      status: "pending",
      createdAt: Date.now()
    }
  );

  alert("Order placed!");

  cart = [];
  renderCart();

};

loadMenu();
