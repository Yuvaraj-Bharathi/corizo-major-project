const STORAGE_KEY = "shopsphere_state_v1";
const SESSION_KEY = "shopsphere_session_v1";
const CATALOG_VERSION = "five-categories-ten-products-v7";

const catalogGroups = [
  {
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
    items: [
      ["Wireless Headphones", 4599, 15],
      ["Smart Fitness Watch", 3999, 18],
      ["Bluetooth Speaker", 2299, 26],
      ["Portable Power Bank", 1599, 42],
      ["USB-C Fast Charger", 999, 55],
      ["Gaming Mouse", 1499, 30],
      ["Mechanical Keyboard", 3299, 17],
      ["Web Camera HD", 2499, 21],
      ["Tablet Stand", 799, 48],
      ["Noise Cancelling Earbuds", 5499, 13]
    ]
  },
  {
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    items: [
      ["Classic Denim Jacket", 2199, 24],
      ["Cotton Casual Shirt", 1199, 38],
      ["Slim Fit Chinos", 1699, 28],
      ["Printed Summer Dress", 1899, 19],
      ["Formal Blazer", 3499, 12],
      ["Graphic T-Shirt", 799, 60],
      ["Wool Blend Sweater", 1599, 25],
      ["Athleisure Joggers", 1299, 34],
      ["Leather Belt", 699, 52],
      ["Silk Touch Scarf", 899, 31]
    ]
  },
  {
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    items: [
      ["Urban Runner Sneakers", 2499, 32],
      ["Canvas Walking Shoes", 1399, 36],
      ["Leather Formal Shoes", 2999, 16],
      ["Sports Training Shoes", 2799, 22],
      ["Comfort Sandals", 999, 44],
      ["High Top Sneakers", 2199, 18],
      ["Slip-On Loafers", 1899, 27],
      ["Trekking Boots", 3999, 11],
      ["Daily Flip Flops", 499, 70],
      ["Kids School Shoes", 1199, 33]
    ]
  },
  {
    category: "Home",
    image: "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&w=900&q=80",
    items: [
      ["Ceramic Coffee Set", 1299, 40],
      ["LED Desk Lamp", 999, 30],
      ["Cotton Bedsheet Set", 1799, 23],
      ["Wall Clock", 899, 35],
      ["Storage Organizer", 1199, 29],
      ["Nonstick Cookware Pan", 1499, 24],
      ["Decor Cushion Pair", 799, 46],
      ["Aroma Diffuser", 1599, 20],
      ["Dinner Plate Set", 1999, 17],
      ["Foldable Study Table", 2499, 14]
    ]
  },
  {
    category: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    items: [
      ["Travel Backpack", 1899, 27],
      ["Laptop Messenger Bag", 2199, 18],
      ["Office Tote Bag", 1799, 22],
      ["Weekend Duffle Bag", 2499, 15],
      ["School Backpack", 1299, 40],
      ["Mini Sling Bag", 899, 36],
      ["Hard Shell Suitcase", 4999, 10],
      ["Gym Training Bag", 1599, 25],
      ["Leather Wallet", 799, 58],
      ["Camera Carry Bag", 1999, 16]
    ]
  }
];

const seedProducts = catalogGroups.flatMap((group, groupIndex) =>
  group.items.map(([name, price, stock], itemIndex) => ({
    id: `p-${groupIndex + 1}${String(itemIndex + 1).padStart(2, "0")}`,
    name,
    category: group.category,
    price,
    stock,
    image: group.image,
    tone: productTone(itemIndex),
    accent: productAccent(itemIndex),
    description: `${name} from our ${group.category.toLowerCase()} collection, selected for everyday quality, useful features, and strong value.`
  }))
);

function productTone(itemIndex) {
  const tones = [
    "none",
    "hue-rotate(18deg) saturate(1.15)",
    "hue-rotate(42deg) saturate(1.2)",
    "hue-rotate(72deg) saturate(1.12)",
    "hue-rotate(105deg) saturate(1.18)",
    "hue-rotate(148deg) saturate(1.15)",
    "hue-rotate(190deg) saturate(1.16)",
    "hue-rotate(235deg) saturate(1.12)",
    "hue-rotate(285deg) saturate(1.18)",
    "sepia(0.28) saturate(1.25) contrast(1.04)"
  ];
  return tones[itemIndex % tones.length];
}

function imageToneStyle(product) {
  return product.tone ? `style="filter: ${product.tone};"` : "";
}

function productAccent(itemIndex) {
  const accents = ["#0f766e", "#c2410c", "#2563eb", "#65a30d", "#9333ea", "#be123c", "#0891b2", "#ca8a04", "#4f46e5", "#16a34a"];
  return accents[itemIndex % accents.length];
}

function productMediaStyle(product) {
  return product.accent ? `style="--tone-color: ${product.accent};"` : "";
}

const state = loadState();
let session = loadSession();
let route = { name: "home", params: {} };

const app = document.querySelector("#app");
const nav = document.querySelector("#mainNav");
const toast = document.querySelector("#toast");
const brandButton = document.querySelector("#brandButton");

brandButton.addEventListener("click", () => {
  go(session.role === "admin" ? "admin" : "home");
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const { action: actionName, id } = action.dataset;
  handlers[actionName]?.(id, action);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  formHandlers[form.dataset.form]?.(form);
});

function loadState() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved) {
    if (saved.catalogVersion !== CATALOG_VERSION) {
      saved.catalogVersion = CATALOG_VERSION;
      saved.products = seedProducts;
      saved.carts = {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    return saved;
  }

  const initial = {
    catalogVersion: CATALOG_VERSION,
    users: [
      {
        id: "u-demo",
        name: "Demo Customer",
        email: "customer@example.com",
        phone: "9876543210",
        password: "customer123",
        address: "MG Road, Bengaluru"
      }
    ],
    products: seedProducts,
    orders: [],
    carts: {}
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function loadSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") || { role: "guest", userId: null };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveSession(nextSession) {
  session = nextSession;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function currentUser() {
  return state.users.find((user) => user.id === session.userId);
}

function userCart() {
  if (!session.userId) return [];
  state.carts[session.userId] ||= [];
  return state.carts[session.userId];
}

function cartItems() {
  return userCart()
    .map((item) => ({ ...item, product: state.products.find((product) => product.id === item.productId) }))
    .filter((item) => item.product);
}

function cartTotal() {
  return cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function go(name, params = {}) {
  route = { name, params };
  render();
}

function requireUser() {
  if (session.role !== "user") {
    showToast("Please login as a customer first.");
    go("login");
    return false;
  }
  return true;
}

function requireAdmin() {
  if (session.role !== "admin") {
    showToast("Please login as admin first.");
    go("adminLogin");
    return false;
  }
  return true;
}

const handlers = {
  go: (id) => go(id),
  viewProduct: (id) => go("product", { id }),
  addToCart: (id) => addToCart(id),
  removeCart: (id) => updateCart(id, 0),
  increaseCart: (id) => changeCartQuantity(id, 1),
  decreaseCart: (id) => changeCartQuantity(id, -1),
  logout: () => {
    saveSession({ role: "guest", userId: null });
    showToast("Logged out successfully.");
    go("login");
  },
  adminLogout: () => {
    saveSession({ role: "guest", userId: null });
    showToast("Admin logged out.");
    go("adminLogin");
  },
  deleteProduct: (id) => {
    state.products = state.products.filter((product) => product.id !== id);
    saveState();
    showToast("Product removed.");
    render();
  },
  fillDemo: () => {
    const email = document.querySelector("#loginEmail");
    const password = document.querySelector("#loginPassword");
    if (email && password) {
      email.value = "customer@example.com";
      password.value = "customer123";
    }
  },
  fillAdmin: () => {
    const email = document.querySelector("#adminEmail");
    const password = document.querySelector("#adminPassword");
    if (email && password) {
      email.value = "admin@shopsphere.com";
      password.value = "admin123";
    }
  }
};

const formHandlers = {
  register(form) {
    const data = Object.fromEntries(new FormData(form));
    const exists = state.users.some((user) => user.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      showToast("This email is already registered.");
      return;
    }
    const user = {
      id: `u-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      password: data.password
    };
    state.users.push(user);
    saveState();
    saveSession({ role: "user", userId: user.id });
    showToast("Registration successful. Welcome to ShopSphere.");
    go("home");
  },
  login(form) {
    const data = Object.fromEntries(new FormData(form));
    const user = state.users.find(
      (item) => item.email.toLowerCase() === data.email.toLowerCase() && item.password === data.password
    );
    if (!user) {
      showToast("Invalid customer email or password.");
      return;
    }
    saveSession({ role: "user", userId: user.id });
    showToast(`Welcome back, ${user.name}.`);
    go("home");
  },
  adminLogin(form) {
    const data = Object.fromEntries(new FormData(form));
    if (data.email !== "admin@shopsphere.com" || data.password !== "admin123") {
      showToast("Invalid admin credentials.");
      return;
    }
    saveSession({ role: "admin", userId: null });
    showToast("Admin login successful.");
    go("admin");
  },
  addProduct(form) {
    if (!requireAdmin()) return;
    const data = Object.fromEntries(new FormData(form));
    state.products.unshift({
      id: `p-${Date.now()}`,
      name: data.name.trim(),
      category: data.category.trim(),
      price: Number(data.price),
      stock: Number(data.stock),
      image: data.image.trim() || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80",
      description: data.description.trim()
    });
    saveState();
    showToast("Product added to dashboard.");
    go("admin");
  },
  checkout(form) {
    if (!requireUser()) return;
    const items = cartItems();
    if (!items.length) {
      showToast("Your cart is empty.");
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const order = {
      id: `ORD-${Date.now().toString().slice(-7)}`,
      userId: session.userId,
      customerName: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      payment: "Cash on Delivery",
      status: "Order Placed",
      date: new Date().toLocaleString("en-IN"),
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: cartTotal()
    };
    state.orders.unshift(order);
    state.carts[session.userId] = [];
    saveState();
    showToast("Notification: order has been placed.");
    go("orderSuccess", { id: order.id });
  }
};

function addToCart(productId) {
  if (!requireUser()) return;
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const cart = userCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, quantity: 1 });
  saveState();
  showToast(`${product.name} added to cart.`);
  renderNav();
}

function updateCart(productId, quantity) {
  const cart = userCart();
  const index = cart.findIndex((item) => item.productId === productId);
  if (index === -1) return;
  if (quantity <= 0) cart.splice(index, 1);
  else cart[index].quantity = quantity;
  saveState();
  render();
}

function changeCartQuantity(productId, change) {
  const item = userCart().find((entry) => entry.productId === productId);
  if (!item) return;
  updateCart(productId, item.quantity + change);
}

function renderNav() {
  const count = cartItems().reduce((sum, item) => sum + item.quantity, 0);
  if (session.role === "admin") {
    nav.innerHTML = `
      <button class="nav-button" data-action="go" data-id="admin" type="button">Dashboard</button>
      <button class="nav-button" data-action="go" data-id="addProduct" type="button">Add Product</button>
      <button class="nav-button" data-action="go" data-id="adminOrders" type="button">Orders</button>
      <button class="nav-button" data-action="go" data-id="customers" type="button">Customers</button>
      <button class="danger-button" data-action="adminLogout" type="button">Logout</button>
    `;
    return;
  }

  if (session.role === "user") {
    nav.innerHTML = `
      <button class="nav-button" data-action="go" data-id="home" type="button">Dashboard</button>
      <button class="nav-button" data-action="go" data-id="orders" type="button">My Orders</button>
      <button class="nav-button" data-action="go" data-id="cart" type="button">Cart (${count})</button>
      <button class="danger-button" data-action="logout" type="button">Logout</button>
    `;
    return;
  }

  nav.innerHTML = `
    <button class="nav-button" data-action="go" data-id="login" type="button">Login</button>
    <button class="nav-button" data-action="go" data-id="register" type="button">Register</button>
    <button class="nav-button" data-action="go" data-id="adminLogin" type="button">Admin</button>
  `;
}

function render() {
  renderNav();
  const screens = {
    home: renderHome,
    login: renderLogin,
    register: renderRegister,
    product: renderProductDetails,
    cart: renderCart,
    checkout: renderCheckout,
    orders: renderMyOrders,
    orderSuccess: renderOrderSuccess,
    adminLogin: renderAdminLogin,
    admin: renderAdminDashboard,
    addProduct: renderAddProduct,
    adminOrders: renderAdminOrders,
    customers: renderCustomers
  };
  (screens[route.name] || renderHome)();
}

function renderHome() {
  const categories = ["All", ...new Set(state.products.map((product) => product.category))];
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <h1>ShopSphere</h1>
        <p>Discover electronics, fashion, home essentials, and daily favorites in one clean shopping dashboard.</p>
      </div>
      <aside class="summary-panel">
        <div class="metric-grid">
          <div class="metric"><span>Products</span><strong>${state.products.length}</strong></div>
          <div class="metric"><span>Categories</span><strong>${categories.length - 1}</strong></div>
          <div class="metric"><span>Cart Items</span><strong>${cartItems().reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
          <div class="metric"><span>Payment</span><strong>COD</strong></div>
        </div>
        <button class="primary-button" data-action="go" data-id="${session.role === "user" ? "cart" : "login"}" type="button">
          ${session.role === "user" ? "Open Cart" : "Start Shopping"}
        </button>
      </aside>
    </section>
    <section>
      <div class="toolbar">
        <div class="page-title">
          <h1>Products</h1>
          <p>Browse products, open details, and add your favorites to cart.</p>
        </div>
        <div class="search-row">
          <input id="searchInput" type="search" placeholder="Search products">
          <select id="categoryFilter" aria-label="Filter category">
            ${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}
          </select>
        </div>
      </div>
      <div id="productGrid" class="grid"></div>
    </section>
  `;
  const search = document.querySelector("#searchInput");
  const category = document.querySelector("#categoryFilter");
  const draw = () => renderProducts(search.value, category.value);
  search.addEventListener("input", draw);
  category.addEventListener("change", draw);
  draw();
}

function renderProducts(query = "", category = "All") {
  const grid = document.querySelector("#productGrid");
  const filtered = state.products.filter((product) => {
    const matchesQuery = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    return matchesQuery && matchesCategory;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">No matching products found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(productCard).join("");
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-media" ${productMediaStyle(product)}><img src="${product.image}" alt="${product.name}" ${imageToneStyle(product)}></div>
      <div class="product-info">
        <div>
          <p class="eyebrow">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
        </div>
        <div class="product-footer">
          <strong>${formatCurrency(product.price)}</strong>
          <div>
            <button class="secondary-button" data-action="viewProduct" data-id="${product.id}" type="button">View</button>
            <button class="small-button" data-action="addToCart" data-id="${product.id}" type="button">Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderLogin() {
  app.innerHTML = authShell(`
    <div class="form-card">
      <form data-form="login">
        <h2>User Login</h2>
        <div class="field"><label for="loginEmail">Email</label><input id="loginEmail" name="email" type="email" required></div>
        <div class="field"><label for="loginPassword">Password</label><input id="loginPassword" name="password" type="password" required></div>
        <button class="primary-button" type="submit">Login</button>
        <button class="secondary-button" data-action="fillDemo" type="button">Use Demo Login</button>
        <p class="switch-line">New customer? <button class="link-button" data-action="go" data-id="register" type="button">Create account</button></p>
      </form>
    </div>
  `);
}

function renderRegister() {
  app.innerHTML = authShell(`
    <div class="form-card">
      <form data-form="register">
        <h2>Registration Page</h2>
        <div class="field"><label for="name">Full Name</label><input id="name" name="name" required></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" pattern="[0-9]{10}" title="Enter a 10 digit phone number" required></div>
        <div class="field"><label for="address">Address</label><textarea id="address" name="address" required></textarea></div>
        <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" minlength="6" required></div>
        <button class="primary-button" type="submit">Register</button>
        <p class="switch-line">Already registered? <button class="link-button" data-action="go" data-id="login" type="button">Login</button></p>
      </form>
    </div>
  `);
}

function authShell(formHtml) {
  return `
    <section class="auth-layout">
      <div class="auth-art">
        <h1>Shop better, faster.</h1>
        <p>Login, fill your cart, place cash on delivery orders, and track every order from your dashboard.</p>
      </div>
      ${formHtml}
    </section>
  `;
}

function renderProductDetails() {
  const product = state.products.find((item) => item.id === route.params.id);
  if (!product) {
    app.innerHTML = `<div class="empty-state">Product not found.</div>`;
    return;
  }
  app.innerHTML = `
    <section class="detail-layout">
      <div class="detail-media"><img src="${product.image}" alt="${product.name}" ${imageToneStyle(product)}></div>
      <div class="detail-panel">
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <strong class="price">${formatCurrency(product.price)}</strong>
        <p>${product.description}</p>
        <p><strong>Available stock:</strong> ${product.stock}</p>
        <div class="detail-actions">
          <button class="secondary-button" data-action="go" data-id="home" type="button">Back</button>
          <button class="primary-button" data-action="addToCart" data-id="${product.id}" type="button">Add to Cart</button>
        </div>
      </div>
    </section>
  `;
}

function renderCart() {
  if (!requireUser()) return;
  const items = cartItems();
  app.innerHTML = `
    <section class="page-title">
      <h1>Add to Cart</h1>
      <p>Review product quantities before moving to the order page.</p>
    </section>
    ${items.length ? `
      <section class="checkout-layout">
        <div class="cart-list">
          ${items.map((item) => `
            <article class="cart-item">
              <img src="${item.product.image}" alt="${item.product.name}" ${imageToneStyle(item.product)}>
              <div class="stack">
                <div>
                  <p class="eyebrow">${item.product.category}</p>
                  <h3>${item.product.name}</h3>
                  <p>${formatCurrency(item.product.price)} each</p>
                </div>
                <div class="cart-footer">
                  <div class="quantity-control" aria-label="Quantity controls">
                    <button data-action="decreaseCart" data-id="${item.product.id}" type="button">-</button>
                    <span>${item.quantity}</span>
                    <button data-action="increaseCart" data-id="${item.product.id}" type="button">+</button>
                  </div>
                  <button class="danger-button" data-action="removeCart" data-id="${item.product.id}" type="button">Remove</button>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
        <aside class="form-card order-summary">
          <div class="stack">
            <h2>Cart Total</h2>
            <div class="metric"><span>Total Amount</span><strong>${formatCurrency(cartTotal())}</strong></div>
            <button class="primary-button" data-action="go" data-id="checkout" type="button">Place Order</button>
          </div>
        </aside>
      </section>
    ` : `<div class="empty-state">Your cart is empty. Add products from the dashboard.</div>`}
  `;
}

function renderCheckout() {
  if (!requireUser()) return;
  const user = currentUser();
  if (!cartItems().length) {
    go("cart");
    return;
  }
  app.innerHTML = `
    <section class="page-title">
      <h1>Order Page</h1>
      <p>Confirm delivery details and complete payment by cash on delivery.</p>
    </section>
    <section class="checkout-layout">
      <div class="form-card">
        <form data-form="checkout">
          <h2>User Details</h2>
          <div class="field"><label for="orderName">Full Name</label><input id="orderName" name="name" value="${user.name}" required></div>
          <div class="field"><label for="orderEmail">Email</label><input id="orderEmail" name="email" type="email" value="${user.email}" required></div>
          <div class="field"><label for="orderPhone">Phone</label><input id="orderPhone" name="phone" value="${user.phone}" required></div>
          <div class="field"><label for="orderAddress">Delivery Address</label><textarea id="orderAddress" name="address" required>${user.address}</textarea></div>
          <div class="field">
            <label for="payment">Payment Page</label>
            <select id="payment" name="payment" required>
              <option>Cash on Delivery</option>
            </select>
          </div>
          <button class="primary-button" type="submit">Confirm COD Order</button>
        </form>
      </div>
      <aside class="form-card order-summary">
        <div class="stack">
          <h2>Order Summary</h2>
          ${cartItems().map((item) => `<p>${item.product.name} x ${item.quantity} - <strong>${formatCurrency(item.product.price * item.quantity)}</strong></p>`).join("")}
          <div class="metric"><span>Pay on Delivery</span><strong>${formatCurrency(cartTotal())}</strong></div>
        </div>
      </aside>
    </section>
  `;
}

function renderOrderSuccess() {
  const order = state.orders.find((item) => item.id === route.params.id);
  app.innerHTML = `
    <section class="detail-panel">
      <p class="eyebrow">Notification</p>
      <h2>Order has been placed</h2>
      <p>Your order ${order?.id || ""} is confirmed with cash on delivery payment.</p>
      <div class="detail-actions">
        <button class="primary-button" data-action="go" data-id="orders" type="button">View My Orders</button>
        <button class="secondary-button" data-action="go" data-id="home" type="button">Continue Shopping</button>
      </div>
    </section>
  `;
}

function renderMyOrders() {
  if (!requireUser()) return;
  const orders = state.orders.filter((order) => order.userId === session.userId);
  app.innerHTML = `
    <section class="page-title">
      <h1>View My Orders</h1>
      <p>All orders placed from your customer account.</p>
    </section>
    ${ordersTable(orders)}
  `;
}

function renderAdminLogin() {
  app.innerHTML = authShell(`
    <div class="form-card">
      <form data-form="adminLogin">
        <h2>Admin Login</h2>
        <div class="field"><label for="adminEmail">Email</label><input id="adminEmail" name="email" type="email" required></div>
        <div class="field"><label for="adminPassword">Password</label><input id="adminPassword" name="password" type="password" required></div>
        <button class="primary-button" type="submit">Login as Admin</button>
        <button class="secondary-button" data-action="fillAdmin" type="button">Use Admin Login</button>
      </form>
    </div>
  `);
}

function renderAdminDashboard() {
  if (!requireAdmin()) return;
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  app.innerHTML = `
    <section class="page-title">
      <h1>Admin Dashboard</h1>
      <p>Add products, view customers, and monitor all placed orders.</p>
    </section>
    <section class="summary-panel">
      <div class="metric-grid">
        <div class="metric"><span>Products</span><strong>${state.products.length}</strong></div>
        <div class="metric"><span>Customers</span><strong>${state.users.length}</strong></div>
        <div class="metric"><span>Orders</span><strong>${state.orders.length}</strong></div>
        <div class="metric"><span>COD Revenue</span><strong>${formatCurrency(revenue)}</strong></div>
      </div>
      <div class="admin-actions">
        <button class="primary-button" data-action="go" data-id="addProduct" type="button">Add Product</button>
        <button class="secondary-button" data-action="go" data-id="adminOrders" type="button">View Orders</button>
        <button class="secondary-button" data-action="go" data-id="customers" type="button">View Customers</button>
      </div>
    </section>
    <section class="toolbar"><div class="page-title"><h1>Product Inventory</h1></div></section>
    <section class="grid">
      ${state.products.map((product) => `
        <article class="product-card">
          <div class="product-media" ${productMediaStyle(product)}><img src="${product.image}" alt="${product.name}" ${imageToneStyle(product)}></div>
          <div class="product-info">
            <div>
              <p class="eyebrow">${product.category}</p>
              <h3>${product.name}</h3>
              <p class="product-description">Stock: ${product.stock} units</p>
            </div>
            <div class="product-footer">
              <strong>${formatCurrency(product.price)}</strong>
              <button class="danger-button" data-action="deleteProduct" data-id="${product.id}" type="button">Delete</button>
            </div>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderAddProduct() {
  if (!requireAdmin()) return;
  app.innerHTML = `
    <section class="page-title">
      <h1>Add Product Page</h1>
      <p>Create a new product for the customer dashboard.</p>
    </section>
    <div class="form-card">
      <form data-form="addProduct">
        <div class="field"><label for="productName">Product Name</label><input id="productName" name="name" required></div>
        <div class="field"><label for="productCategory">Category</label><input id="productCategory" name="category" required></div>
        <div class="field"><label for="productPrice">Price</label><input id="productPrice" name="price" type="number" min="1" required></div>
        <div class="field"><label for="productStock">Stock</label><input id="productStock" name="stock" type="number" min="0" required></div>
        <div class="field"><label for="productImage">Image URL</label><input id="productImage" name="image" type="url" placeholder="https://example.com/product.jpg"></div>
        <div class="field"><label for="productDescription">Description</label><textarea id="productDescription" name="description" required></textarea></div>
        <button class="primary-button" type="submit">Add Product</button>
      </form>
    </div>
  `;
}

function renderAdminOrders() {
  if (!requireAdmin()) return;
  app.innerHTML = `
    <section class="page-title">
      <h1>View Orders Page</h1>
      <p>All customer orders and cash on delivery totals.</p>
    </section>
    ${ordersTable(state.orders)}
  `;
}

function renderCustomers() {
  if (!requireAdmin()) return;
  app.innerHTML = `
    <section class="page-title">
      <h1>View Customers</h1>
      <p>Registered customers are listed here for admin reference.</p>
    </section>
    <section class="table-panel">
      <h2>Customers</h2>
      <table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead>
        <tbody>
          ${state.users.map((user) => `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.phone}</td>
              <td>${user.address}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function ordersTable(orders) {
  if (!orders.length) return `<div class="empty-state">No orders available yet.</div>`;
  return `
    <section class="table-panel">
      <h2>Orders</h2>
      <table class="data-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          ${orders.map((order) => `
            <tr>
              <td><strong>${order.id}</strong><br>${order.date}</td>
              <td>${order.customerName}<br>${order.phone}<br>${order.address}</td>
              <td>${order.items.map((item) => `${item.name} x ${item.quantity}`).join("<br>")}</td>
              <td>${order.payment}</td>
              <td><strong>${formatCurrency(order.total)}</strong></td>
              <td><span class="status-pill">${order.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

render();
