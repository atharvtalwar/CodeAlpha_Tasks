let cartCount = 0;

function checkLoginStatus() {
  const user = localStorage.getItem("user");
  const loginBtn = document.querySelector(".login-btn");

  if (user) {
    const userData = JSON.parse(user);
    loginBtn.innerText = `Hi, ${userData.name} (Logout)`;
    loginBtn.href = "#";
    loginBtn.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.reload();
    };
  } else {
    loginBtn.innerText = "Login";
    loginBtn.href = "login.html";
    loginBtn.onclick = null;
  }
}

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("product-list").innerHTML =
      "<p>Could not fetch products.</p>";
  }
}

function renderProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
            <div class="product-placeholder" onclick="viewProduct(${product.id})" style="cursor:pointer">${product.icon}</div>
            <h3 onclick="viewProduct(${product.id})" style="cursor:pointer">${product.name}</h3>
            <p>₹${product.price}</p>
            <button class="add-to-cart-btn" onclick="addToCart(this)">Add to Cart</button>
        `;

    productList.appendChild(productCard);
  });
}

function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

function addToCart(buttonElement) {
  cartCount++;
  document.getElementById("cart-btn").innerText = `Cart (${cartCount})`;

  buttonElement.innerText = "Added! ✔️";
  buttonElement.style.backgroundColor = "#28a745";

  setTimeout(() => {
    buttonElement.innerText = "Add to Cart";
    buttonElement.style.backgroundColor = "";
  }, 1000);
}

document.getElementById("nav-home")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("nav-products")?.addEventListener("click", (e) => {
  e.preventDefault();
  document
    .querySelector(".products-section")
    ?.scrollIntoView({ behavior: "smooth" });
});

document.querySelector(".shop-now-btn")?.addEventListener("click", (e) => {
  document
    .querySelector(".products-section")
    ?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("cart-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "checkout.html";
});

document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  if (document.getElementById("product-list")) {
    fetchProducts();
  }
});
