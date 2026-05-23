# ShopSphere E-commerce Major Project

ShopSphere is a simple e-commerce website with user and admin modules.

## Modules

- User registration and login
- Product dashboard
- Specific product page
- Add to cart
- Order details page
- Cash on delivery payment
- Order placed notification
- View my orders
- Admin login
- Admin dashboard
- Add product
- View orders
- View customers
- Logout

## Backend

The backend is written with built-in Node.js modules only. It stores data in:

```text
backend/data/db.json
```

No external npm packages are required.

## Run Project

```bash
npm start
```

Open:

```text
http://localhost:3000
```

If port 3000 is already busy, run with another port:

```bash
set PORT=3001 && npm start
```

Then open:

```text
http://localhost:3001
```

## Demo Credentials

User:

```text
Email: customer@example.com
Password: customer123
```

Admin:

```text
Email: admin@shopsphere.com
Password: admin123
```

## API Routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/admin/login
```

### Products

```text
GET    /api/products
POST   /api/products
DELETE /api/products/:id
```

Admin product routes require this header:

```text
x-admin-token: shopsphere-admin
```

### Cart

```text
GET   /api/cart?userId=u-demo
POST  /api/cart
PATCH /api/cart
```

### Orders

```text
GET  /api/orders?userId=u-demo
GET  /api/orders
POST /api/orders
```

Admin order list requires this header:

```text
x-admin-token: shopsphere-admin
```

### Customers

```text
GET /api/customers
```

Admin customer list requires this header:

```text
x-admin-token: shopsphere-admin
```
