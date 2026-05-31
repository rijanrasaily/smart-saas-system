import { db }
from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* GET URL PARAMS */
const params =
new URLSearchParams(
  location.search
);

const restaurantId =
params.get("r");

const table =
params.get("t");

/* CART */
let cart = [];

/* LOAD MENU */
async function loadMenu(){

  const snap =
    await getDocs(
      collection(
        db,
        "restaurants",
        restaurantId,
        "menu"
      )
    );

  const list =
    document.getElementById(
      "menuList"
    );

  list.innerHTML = "";

  snap.forEach(doc => {

    const item =
      doc.data();

    const div =
      document.createElement("div");

    div.className =
      "order-card";

    div.innerHTML = `
      <b>${item.name}</b>
      - ₹${item.price}
      <button class="btn-success"
        style="float:right;width:auto;padding:5px 10px;"
        onclick="addToCart('${item.name}',${item.price})">
        +
      </button>
    `;

    list.appendChild(div);

  });

}

/* ADD TO CART */
window.addToCart =
(name,price) => {

  cart.push({name,price});

  renderCart();

};

function renderCart(){

  const cartBox =
    document.getElementById("cart");

  cartBox.innerHTML = "";

  cart.forEach((item,i) => {

    cartBox.innerHTML += `
      <div class="order-card">

        ${item.name} - ₹${item.price}

      </div>
    `;

  });

}

/* PLACE ORDER */
window.placeOrder =
async () => {

  if(cart.length === 0)
    return;

  await addDoc(
    collection(
      db,
      "restaurants",
      restaurantId,
      "orders"
    ),
    {
      table,
      items: cart,
      status: "pending",
      time: Date.now()
    }
  );

  alert("Order placed!");

  cart = [];

  renderCart();

};

loadMenu();