const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const adminAccount = {
  email: "admin@shopsphere.com",
  password: "admin123"
};

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

function productAccent(itemIndex) {
  const accents = ["#0f766e", "#c2410c", "#2563eb", "#65a30d", "#9333ea", "#be123c", "#0891b2", "#ca8a04", "#4f46e5", "#16a34a"];
  return accents[itemIndex % accents.length];
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function createInitialDb() {
  return {
    catalogVersion: CATALOG_VERSION,
    users: [
      {
        id: "u-demo",
        name: "Demo Customer",
        email: "customer@example.com",
        phone: "9876543210",
        passwordHash: hashPassword("customer123"),
        address: "MG Road, Bengaluru"
      }
    ],
    products: seedProducts,
    carts: {},
    orders: []
  };
}

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    writeDb(createInitialDb());
  }
}

function readDb() {
  ensureDatabase();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (db.catalogVersion !== CATALOG_VERSION) {
    db.catalogVersion = CATALOG_VERSION;
    db.products = seedProducts;
    db.carts = {};
    writeDb(db);
  }
  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { success: false, message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function isAdminRequest(req) {
  return req.headers["x-admin-token"] === "shopsphere-admin";
}

function findRoute(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return {
    method: req.method,
    pathname: url.pathname,
    searchParams: url.searchParams
  };
}

async function handleApi(req, res) {
  const route = findRoute(req);
  const db = readDb();

  if (route.method === "OPTIONS") {
    sendJson(res, 200, { success: true });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/auth/register") {
    const body = await parseBody(req);
    if (!body.name || !body.email || !body.password || !body.phone || !body.address) {
      sendError(res, 400, "All registration fields are required.");
      return;
    }
    const exists = db.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase());
    if (exists) {
      sendError(res, 409, "Email already registered.");
      return;
    }
    const user = {
      id: createId("u"),
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      passwordHash: hashPassword(body.password)
    };
    db.users.push(user);
    writeDb(db);
    sendJson(res, 201, { success: true, user: publicUser(user) });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/auth/login") {
    const body = await parseBody(req);
    const user = db.users.find(
      (item) => item.email.toLowerCase() === String(body.email || "").toLowerCase()
        && item.passwordHash === hashPassword(body.password || "")
    );
    if (!user) {
      sendError(res, 401, "Invalid email or password.");
      return;
    }
    sendJson(res, 200, { success: true, user: publicUser(user) });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/admin/login") {
    const body = await parseBody(req);
    if (body.email !== adminAccount.email || body.password !== adminAccount.password) {
      sendError(res, 401, "Invalid admin credentials.");
      return;
    }
    sendJson(res, 200, { success: true, adminToken: "shopsphere-admin" });
    return;
  }

  if (route.method === "GET" && route.pathname === "/api/products") {
    sendJson(res, 200, { success: true, products: db.products });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/products") {
    if (!isAdminRequest(req)) {
      sendError(res, 403, "Admin access required.");
      return;
    }
    const body = await parseBody(req);
    if (!body.name || !body.category || !body.price || !body.description) {
      sendError(res, 400, "Product name, category, price, and description are required.");
      return;
    }
    const product = {
      id: createId("p"),
      name: body.name.trim(),
      category: body.category.trim(),
      price: Number(body.price),
      stock: Number(body.stock || 0),
      image: body.image || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80",
      description: body.description.trim()
    };
    db.products.unshift(product);
    writeDb(db);
    sendJson(res, 201, { success: true, product });
    return;
  }

  const productDeleteMatch = route.pathname.match(/^\/api\/products\/([^/]+)$/);
  if (route.method === "DELETE" && productDeleteMatch) {
    if (!isAdminRequest(req)) {
      sendError(res, 403, "Admin access required.");
      return;
    }
    const productId = productDeleteMatch[1];
    db.products = db.products.filter((product) => product.id !== productId);
    Object.keys(db.carts).forEach((userId) => {
      db.carts[userId] = db.carts[userId].filter((item) => item.productId !== productId);
    });
    writeDb(db);
    sendJson(res, 200, { success: true });
    return;
  }

  if (route.method === "GET" && route.pathname === "/api/customers") {
    if (!isAdminRequest(req)) {
      sendError(res, 403, "Admin access required.");
      return;
    }
    sendJson(res, 200, { success: true, customers: db.users.map(publicUser) });
    return;
  }

  if (route.method === "GET" && route.pathname === "/api/cart") {
    const userId = route.searchParams.get("userId");
    if (!userId) {
      sendError(res, 400, "User id is required.");
      return;
    }
    sendJson(res, 200, { success: true, cart: db.carts[userId] || [] });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/cart") {
    const body = await parseBody(req);
    if (!body.userId || !body.productId) {
      sendError(res, 400, "User id and product id are required.");
      return;
    }
    const product = db.products.find((item) => item.id === body.productId);
    if (!product) {
      sendError(res, 404, "Product not found.");
      return;
    }
    db.carts[body.userId] ||= [];
    const existing = db.carts[body.userId].find((item) => item.productId === body.productId);
    if (existing) existing.quantity += Number(body.quantity || 1);
    else db.carts[body.userId].push({ productId: body.productId, quantity: Number(body.quantity || 1) });
    writeDb(db);
    sendJson(res, 200, { success: true, cart: db.carts[body.userId] });
    return;
  }

  if (route.method === "PATCH" && route.pathname === "/api/cart") {
    const body = await parseBody(req);
    if (!body.userId || !body.productId) {
      sendError(res, 400, "User id and product id are required.");
      return;
    }
    db.carts[body.userId] ||= [];
    const quantity = Number(body.quantity);
    if (quantity <= 0) {
      db.carts[body.userId] = db.carts[body.userId].filter((item) => item.productId !== body.productId);
    } else {
      const existing = db.carts[body.userId].find((item) => item.productId === body.productId);
      if (existing) existing.quantity = quantity;
      else db.carts[body.userId].push({ productId: body.productId, quantity });
    }
    writeDb(db);
    sendJson(res, 200, { success: true, cart: db.carts[body.userId] });
    return;
  }

  if (route.method === "GET" && route.pathname === "/api/orders") {
    const userId = route.searchParams.get("userId");
    if (userId) {
      sendJson(res, 200, { success: true, orders: db.orders.filter((order) => order.userId === userId) });
      return;
    }
    if (!isAdminRequest(req)) {
      sendError(res, 403, "Admin access required.");
      return;
    }
    sendJson(res, 200, { success: true, orders: db.orders });
    return;
  }

  if (route.method === "POST" && route.pathname === "/api/orders") {
    const body = await parseBody(req);
    if (!body.userId || !body.customerName || !body.email || !body.phone || !body.address) {
      sendError(res, 400, "Order details are required.");
      return;
    }
    const cart = db.carts[body.userId] || [];
    if (!cart.length) {
      sendError(res, 400, "Cart is empty.");
      return;
    }
    const items = cart.map((item) => {
      const product = db.products.find((entry) => entry.id === item.productId);
      return product
        ? { productId: product.id, name: product.name, price: product.price, quantity: item.quantity }
        : null;
    }).filter(Boolean);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: `ORD-${Date.now().toString().slice(-7)}`,
      userId: body.userId,
      customerName: body.customerName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      payment: "Cash on Delivery",
      status: "Order Placed",
      date: new Date().toLocaleString("en-IN"),
      items,
      total
    };
    db.orders.unshift(order);
    db.carts[body.userId] = [];
    writeDb(db);
    sendJson(res, 201, { success: true, message: "Order has been placed.", order });
    return;
  }

  sendError(res, 404, "API route not found.");
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexContent) => {
        if (indexError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(indexContent);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    sendError(res, 500, error.message || "Server error.");
  }
});

ensureDatabase();
server.listen(PORT, () => {
  console.log(`ShopSphere server running at http://localhost:${PORT}`);
});
