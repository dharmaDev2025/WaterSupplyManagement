# 💧 AquaFlow - Water Supply Management System

AquaFlow is a full-stack Water Supply Management System developed using the MERN stack.

The application allows customers to register, log in, browse water products, add products to their cart, place orders, make secure payments using Stripe, track their orders, and reorder previous purchases.

The project currently contains the Customer Panel. The Admin Panel will be developed as the next major module for managing products, customers, orders, stock, and order statuses.

---

## 🚀 Features

### 👤 Customer Authentication

- Customer Registration
- Customer Login
- Email and Password Authentication
- Google OAuth 2.0 Authentication
- JWT-based Authentication
- Protected Routes
- Customer Logout

Authentication Flow:

```text
Customer
   ↓
Register / Login
   ↓
Email & Password OR Google OAuth
   ↓
Authentication Successful
   ↓
JWT Token
   ↓
Customer Dashboard
```

---

## 👤 Customer Profile

Customers can:

- View profile
- Update profile information
- Store delivery address
- Store map coordinates
- Update delivery location
- Change password
- Use saved address during checkout

Customer information includes:

```text
Name
Phone
Email
Address
Customer Type
Latitude
Longitude
Account Status
```

---

## 📦 Product Module

Customers can browse available water products.

The system supports:

### Water Jars

Customers can choose:

```text
New Jar
Refill
```

### Water Bottles

Customers can directly purchase bottles.

Product information includes:

```text
Product Name
Product Type
Size
Unit
Stock
New Jar Price
Refill Price
Bottle Price
Active Status
```

Example:

```text
25L Water Jar
New Jar: ₹...
Refill: ₹...

500ml Water Bottle
Price: ₹...
```

---

## 🛒 Cart System

Customers can:

- Add products to cart
- Select purchase type
- Increase quantity
- Decrease quantity
- Remove products
- View cart total
- Proceed to checkout

Cart data is managed on the frontend using React Context.

---

## ⚡ Buy Now

Customers can directly purchase a product without adding it to the cart.

Flow:

```text
Products
   ↓
Buy Now
   ↓
Checkout
   ↓
Confirm Delivery Details
   ↓
Stripe Payment
   ↓
Order Created
```

---

## 📍 Delivery Address & Location

During checkout, customers can confirm:

- House / Flat Number
- Street / Area
- City
- Exact delivery location
- Latitude
- Longitude

The customer can select an exact delivery point using the map.

Checkout address changes apply to the current order.

---

## 💳 Stripe Payment Integration

AquaFlow uses Stripe Checkout for secure online payments.

Payment Flow:

```text
Checkout
   ↓
POST /api/orders/create-payment
   ↓
Backend validates products
   ↓
Backend checks stock
   ↓
Backend calculates total amount
   ↓
Stripe Checkout Session Created
   ↓
Customer completes payment
   ↓
Stripe redirects to Checkout
   ↓
POST /api/orders/verify-payment
   ↓
Backend verifies payment
   ↓
New Order Created
   ↓
Product Stock Reduced
```

The backend calculates the final amount instead of trusting prices sent from the frontend.

---

## 📋 Order Management

After successful payment, a new order is created.

An order contains information such as:

```text
Order Number
Customer
Products
Purchase Type
Quantity
Price
Subtotal
Total Amount
Delivery Address
Delivery Location
Order Status
Payment Status
Stripe Session ID
Stripe Payment Intent ID
Order Date
Delivery Date
```

Possible order statuses include:

```text
Pending
Confirmed
Assigned
Packed
Out for Delivery
Delivered
Cancelled
```

---

## 📦 My Orders

Customers can view all their previous orders.

Each order displays:

- Order Number
- Order Date
- Ordered Products
- Quantity
- Purchase Type
- Total Amount
- Payment Status
- Order Status

Two important actions are available:

```text
Track Order
Reorder
```

---

## 🚚 Track Order

Customers can check the current status of an order.

Flow:

```text
My Orders
   ↓
Track Order
   ↓
GET /api/orders/:id/status
   ↓
Current Order Status
```

Example:

```text
Order Number: AQ12345

Status:
Confirmed
   ↓
Packed
   ↓
Out for Delivery
   ↓
Delivered
```

---

## 🔄 Reorder

Customers can reorder products from a previous order.

For example, suppose the previous order contains:

```text
25L Water Jar × 1
500ml Water Bottle × 1
```

When the customer clicks:

```text
Reorder
```

the system prepares the same products and quantities.

Flow:

```text
Previous Order
      ↓
Click Reorder
      ↓
Get Previous Order Items
      ↓
Checkout
      ↓
Same Products Displayed
      ↓
Confirm Delivery Details
      ↓
Stripe Payment
      ↓
Payment Verification
      ↓
New Order Created
      ↓
Stock Reduced
```

The previous order is not modified.

A completely new order is created after successful payment.

---

# 🔄 Complete Customer Workflow

```text
Customer
   ↓
Register / Login
   ↓
Email & Password
      OR
Google OAuth 2.0
   ↓
Customer Dashboard
   ↓
Browse Products
   ↓
Choose Product
   ↓
 ┌──────────────┬──────────────┐
 │              │              │
Cart         Buy Now       Reorder
 │              │              │
 └──────────────┴──────────────┘
                ↓
             Checkout
                ↓
        Confirm Address
                ↓
      Select Map Location
                ↓
          Stripe Payment
                ↓
       Payment Verification
                ↓
          Order Created
                ↓
          Stock Reduced
                ↓
            My Orders
                ↓
          Track Order
```

---

# 🛠️ Technology Stack

## Frontend

- React.js
- TypeScript
- React Router
- Axios
- Tailwind CSS
- Context API
- Local Storage
- Session Storage

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Google OAuth 2.0
- Stripe

## Authentication

- Email and Password Authentication
- Google OAuth 2.0
- JWT Authentication
- Protected API Routes

## Payment

- Stripe Checkout

## Location

- Map-based delivery location
- Latitude
- Longitude

---

# 📁 Project Structure

```text
WaterSupplyManagement/
│
├── frontend/
│   │
│   └── src/
│       │
│       ├── components/
│       │
│       ├── context/
│       │
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Products.tsx
│       │   ├── Cart.tsx
│       │   ├── Checkout.tsx
│       │   ├── MyOrders.tsx
│       │   └── Profile.tsx
│       │
│       ├── services/
│       │   └── api.ts
│       │
│       └── App.tsx
│
├── backend/
│   │
│   ├── config/
│   │   └── stripe.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   └── order.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   └── order.routes.js
│   │
│   └── server.js
│
├── README.md
└── .gitignore
```

The exact file names may vary depending on the project structure.

---

# 🔗 Important Order APIs

```text
GET    /api/orders/my-orders

GET    /api/orders/:id

GET    /api/orders/:id/status

POST   /api/orders/:id/reorder

POST   /api/orders/create-payment

POST   /api/orders/verify-payment
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend.

Example:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_SECRET=YOUR_STRONG_JWT_SECRET

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

GOOGLE_CALLBACK_URL=YOUR_GOOGLE_CALLBACK_URL

STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY

CLIENT_URL=http://localhost:5173
```

Additional email or authentication environment variables can be added depending on the project configuration.

Never upload your real `.env` file to GitHub.

---

# ⚙️ Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Enter the project:

```bash
cd WaterSupplyManagement
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

---

# 💳 Stripe Test Payment

During development, Stripe should be used in Test Mode.

Example Stripe test card:

```text
Card Number:
4242 4242 4242 4242

Expiry:
Any future date

CVC:
Any valid 3-digit number
```

No real money is charged while using Stripe test mode.

---

# 🔒 Security

The application follows important security practices:

- Passwords should be hashed before storing them.
- JWT is used for protected customer routes.
- Google OAuth credentials remain on the backend.
- Stripe secret keys remain on the backend.
- Payment amounts are calculated on the server.
- Payment is verified before creating the final order.
- Customers can access only their own orders.
- Environment variables are stored in `.env`.
- `.env` should never be committed to GitHub.

---

# 🛡️ Admin Panel - Next Development Phase

The next major module of AquaFlow will be the Admin Panel.

The Admin Panel will be designed separately from the Customer Panel.

## Planned Admin Features

### Admin Authentication

```text
Admin Login
   ↓
Verify Admin
   ↓
Admin Dashboard
```

Admin routes will be protected using admin authorization middleware.

---

## 📊 Admin Dashboard

The dashboard can display information such as:

```text
Total Customers
Total Orders
Total Products
Total Sales
Pending Orders
Confirmed Orders
Delivered Orders
Low Stock Products
```

---

## 📦 Product Management

Admin will be able to:

- View all products
- Add products
- Update products
- Update product prices
- Update stock
- Activate products
- Deactivate products

Flow:

```text
Admin Dashboard
      ↓
Products
      ↓
 ┌───────────────┐
 │ Add Product   │
 │ Edit Product  │
 │ Update Stock  │
 │ Update Price  │
 │ Change Status │
 └───────────────┘
```

---

## 📋 Order Management

Admin will be able to:

- View all orders
- View individual order details
- View customer information
- View delivery address
- View delivery location
- Update order status

Example:

```text
Confirmed
   ↓
Packed
   ↓
Out for Delivery
   ↓
Delivered
```

The customer will see these changes using the Track Order feature.

---

## 👥 Customer Management

Admin will be able to:

- View registered customers
- View customer details
- View customer order history
- View customer account status

---

## 📦 Stock Management

Admin will manage available product stock.

Example:

```text
25L Jar

Current Stock: 50

Customer Orders: 2

Remaining Stock: 48
```

The system already reduces stock after successful customer orders.

The Admin Panel will provide the interface for managing and updating that stock.

---

# 🔮 Future Enhancements

After completing the Admin Panel, possible improvements include:

- Admin analytics
- Sales reports
- Low-stock alerts
- Order search
- Order filters
- Customer search
- Notifications
- Professional PDF invoice/bill generation
- Better delivery tracking
- Dashboard charts
- Revenue reports

---

# 🗺️ Development Roadmap

```text
Customer Registration/Login       ✅
Google OAuth 2.0                  ✅
JWT Authentication                ✅
Customer Profile                  ✅
Product Listing                   ✅
Cart                              ✅
Buy Now                           ✅
Delivery Location                 ✅
Checkout                          ✅
Stripe Payment                    ✅
Order Creation                    ✅
Stock Reduction                   ✅
My Orders                         ✅
Track Order                       ✅
Reorder                           🔄
Admin Panel                       ⏳ Next
```

---

# 🎯 Project Objective

The objective of AquaFlow is to digitize the ordering and management process of a water supply business.

The complete planned system is:

```text
CUSTOMER
   ↓
Register / Login / Google Login
   ↓
Browse Products
   ↓
Cart / Buy Now / Reorder
   ↓
Checkout
   ↓
Delivery Location
   ↓
Stripe Payment
   ↓
Order Created
   ↓
             ADMIN PANEL
                  ↓
             View Order
                  ↓
           Process Order
                  ↓
        Update Order Status
                  ↓
CUSTOMER TRACKS ORDER
                  ↓
              Delivered
```

---

## 📌 Current Project Status

The Customer Panel is the current completed development focus.

The next development phase is:

**Admin Panel Development**

The Admin Panel will connect with the existing Product, Customer, Stock, and Order systems rather than creating a separate ordering system.

---

# 💧 AquaFlow

**Smart Water Supply Management System**

Built using the MERN Stack with TypeScript, Google OAuth 2.0, JWT Authentication, Stripe Payment Integration, and map-based delivery location.
