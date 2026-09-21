# 💧 AquaFlow — Water Supply Management System

AquaFlow is a full-stack **Water Supply Management System** designed to simplify the process of ordering, managing, and delivering drinking water.

The platform provides separate interfaces for **Customers, Administrators, and Delivery Personnel**, covering the complete workflow from customer registration and product ordering to online payment, order assignment, delivery tracking, and OTP-based delivery confirmation.

AquaFlow is built using the **MERN Stack** with TypeScript-based frontend applications, MongoDB for data storage, Stripe for online payments, Google OAuth 2.0 for social authentication, and map-based location support for delivery addresses.

---

## 🌐 Live Application

### Customer Application

Customers can register, sign in, browse available water products, manage their cart, place orders, make online payments, track orders, and manage their profiles.

**Live Website:**
https://water-supply-management-5egv.vercel.app

### Admin & Delivery Application

The management application provides dedicated role-based interfaces for administrators and delivery personnel.

Administrators can manage products, customers, orders, delivery personnel, and order assignments.

Delivery personnel can view assigned orders, manage active deliveries, update delivery progress, and complete deliveries using OTP verification.

**Live Website:**
https://water-supply-management-j4sd.vercel.app

---

# 📌 Project Overview

Traditional water delivery businesses often manage customer orders, delivery addresses, payments, and delivery personnel manually.

AquaFlow provides a centralized digital solution where the complete water delivery lifecycle can be managed through a web application.

The basic workflow is:

**Customer Registration → Product Selection → Cart → Checkout → Payment → Order Confirmation → Admin Processing → Delivery Assignment → Delivery Tracking → OTP Verification → Delivered**

---

# ✨ Key Features

## 👤 Customer Module

The customer application provides a simple and responsive interface for ordering drinking water.

Customers can:

* Create an account using email and password
* Sign in using email/password
* Sign in using Google OAuth 2.0
* Recover forgotten passwords using OTP verification
* View and update their profile
* Store delivery address information
* Store map-based location coordinates
* Browse available water products
* View individual product details
* Add products to the cart
* Buy products directly
* Update cart quantities
* Proceed through checkout
* Make secure online payments
* View previous and current orders
* Track order status
* Reorder previously purchased products

---

## 🔐 Authentication & Security

AquaFlow implements role-based authentication for different types of users.

Authentication features include:

* JWT-based authentication
* Password hashing
* Protected API routes
* Role-based route protection
* Google OAuth 2.0 authentication
* Email OTP verification
* Forgot-password OTP flow
* Password reset
* Rate limiting for sensitive authentication operations
* Separate authentication flows for customers, administrators, and delivery personnel

Sensitive configuration values such as database credentials, JWT secrets, OAuth credentials, payment keys, and email API keys are managed through environment variables and are not stored in the source repository.

---

# 🛒 Product & Cart Management

Customers can browse the water products currently available through the platform.

Product information can include:

* Product name
* Description
* Price
* Stock
* Product image
* Availability

The cart system allows customers to:

* Add products
* Remove products
* Change quantities
* Review selected products
* Calculate order totals
* Continue to checkout

Product inventory can be managed from the administrator dashboard.

---

# 📦 Order Management

AquaFlow provides complete order lifecycle management.

An order contains information such as:

* Unique order number
* Customer
* Ordered products
* Quantity
* Product price
* Total amount
* Delivery address
* Delivery location
* Payment information
* Assigned delivery person
* Current order status
* Creation and update timestamps

The primary order workflow is:

**Confirmed → Packed → Out for Delivery → Delivered**

Customers can check their current order status through the application.

Administrators can manage and process orders, while delivery personnel handle assigned deliveries.

---

# 💳 Stripe Payment Integration

AquaFlow integrates **Stripe Checkout** for secure online payments.

The payment workflow is:

**Customer Checkout → Backend Creates Stripe Session → Stripe Checkout → Payment Verification → Order Creation → Stock Update**

The backend verifies successful payments before creating the final order.

This prevents an order from being considered successfully paid only because the frontend redirects to a success page.

Stripe test mode can be used during development and demonstration.

---

# 🗺️ Map & Location Integration

AquaFlow supports map-based delivery locations.

Customer address information can contain normal address details as well as geographic coordinates:

```text
Latitude
Longitude
```

These coordinates allow the system to store a more accurate delivery location instead of relying only on a manually typed address.

Map/location support is used as part of the delivery-address workflow to help identify where an order needs to be delivered.

---

# 👨‍💼 Admin Module

The Admin Dashboard provides centralized management of the AquaFlow platform.

Administrators can manage:

* Dashboard information
* Customers
* Products
* Product stock
* Orders
* Order statuses
* Delivery personnel
* Delivery assignments

The administrator controls the operational side of the water supply business.

A typical admin workflow is:

**Admin Login → View Dashboard → Manage Products → Review Orders → Process Order → Assign Delivery Person → Monitor Delivery**

---

# 🚚 Delivery Personnel Module

AquaFlow includes a dedicated interface for delivery personnel.

Delivery personnel can:

* Log in securely
* View their dashboard
* View assigned active orders
* Open individual order details
* View customer and delivery information
* Update delivery progress
* View completed deliveries
* Confirm final delivery using customer OTP

The main delivery routes include:

```text
/delivery/dashboard
/delivery/orders
/delivery/orders/:id
/delivery/delivered
```

The delivery interface is responsive across desktop, tablet, and mobile devices.

---

# 🔢 OTP-Based Delivery Verification

AquaFlow uses OTP verification to improve the reliability of final delivery confirmation.

Instead of allowing an order to be marked as delivered without customer confirmation, the delivery process can require a customer-provided OTP.

Workflow:

**Delivery Person Reaches Customer → Customer Receives/Provides OTP → OTP Verified → Order Marked Delivered**

This provides an additional confirmation step for completed deliveries.

---

# 📧 Email & OTP System

Email functionality is used for account-related operations such as password recovery and OTP verification.

The system supports:

* Forgot-password OTP
* OTP verification
* Password reset
* Transactional email delivery

Production email configuration is maintained through environment variables rather than hardcoded credentials.

---

# 🔑 Google OAuth 2.0

Customers can authenticate using their Google account.

The Google OAuth flow is:

**Customer → Google Sign-In → Google Authorization → Backend OAuth Callback → Customer Verification/Creation → JWT Generation → Customer Application**

Google OAuth credentials and callback URLs are configured separately for development and production environments.

---

# 🧑‍💻 Technology Stack

## Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide React

## Backend

* Node.js
* Express.js
* JavaScript ES Modules
* REST API architecture
* JWT authentication
* bcrypt
* Passport.js
* Google OAuth 2.0

## Database

* MongoDB
* MongoDB Atlas
* Mongoose

## Payment

* Stripe Checkout
* Stripe Payment Verification

## Email

* Transactional email / OTP integration
* Production credentials managed through environment variables

## Maps & Location

* Map-based delivery location support
* Latitude and longitude storage
* Delivery address integration

## Deployment

* Vercel — frontend deployment
* Render — backend/API deployment
* MongoDB Atlas — cloud database

---

# 🏗️ System Architecture

```text
                    AquaFlow
                       │
         ┌─────────────┴─────────────┐
         │                           │
 Customer Application       Admin/Delivery Application
         │                           │
         └─────────────┬─────────────┘
                       │
                  REST API
                       │
               Node.js + Express
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   MongoDB          Stripe         Google OAuth
    Atlas           Payment              │
       │               │                │
       └───────────────┼────────────────┘
                       │
                 AquaFlow Backend
```

---

# 🔄 Complete Application Workflow

```text
Customer
   ↓
Register / Login / Google Login
   ↓
Browse Water Products
   ↓
Add to Cart / Buy Now
   ↓
Select Delivery Address & Location
   ↓
Checkout
   ↓
Stripe Payment
   ↓
Payment Verification
   ↓
Order Created
   ↓
Admin Receives Order
   ↓
Order Processing
   ↓
Delivery Person Assigned
   ↓
Order Packed
   ↓
Out for Delivery
   ↓
Customer Delivery OTP Verification
   ↓
Delivered
```

---

# 📁 Project Structure

A simplified project structure is:

```text
WaterSupplyManagement/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── admin/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Environment Variables

The backend requires environment variables for external services and security configuration.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=your_customer_frontend_url
ADMIN_URL=your_admin_frontend_url

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url

STRIPE_SECRET_KEY=your_stripe_secret_key

EMAIL_USER=your_verified_sender_email
EMAIL_PASS=your_email_password_if_smtp_is_used
BREVO_API_KEY=your_email_api_key_if_brevo_is_used
```

Never commit real `.env` credentials to GitHub.

---

# 🚀 Running the Project Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd WaterSupplyManagement
```

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Configure the backend `.env` file and start the server:

```bash
npm start
```

## 3. Start Customer Frontend

```bash
cd frontend
npm install
npm run dev
```

## 4. Start Admin/Delivery Frontend

```bash
cd admin
npm install
npm run dev
```

---

# 🌍 Deployment Architecture

AquaFlow uses separate production services:

```text
Customer Frontend
        │
        │ Vercel
        ↓
https://water-supply-management-5egv.vercel.app
        │
        ↓
AquaFlow REST API
        │
        │ Render
        ↓
Node.js + Express Backend
        │
        ├── MongoDB Atlas
        ├── Stripe
        ├── Google OAuth
        └── Email Service


Admin / Delivery Frontend
        │
        │ Vercel
        ↓
https://water-supply-management-j4sd.vercel.app
        │
        └──────────────→ AquaFlow REST API
```

---

# 📱 Responsive Design

AquaFlow is designed to work across:

* Desktop computers
* Laptops
* Tablets
* Mobile devices

The customer, admin, and delivery interfaces use responsive layouts so the application remains usable across different screen sizes.

---

# 🎯 Project Objective

The main objective of AquaFlow is to digitize the workflow of a local water supply business.

Instead of managing orders, payments, customers, products, and deliveries manually, AquaFlow combines them into one centralized platform.

The project demonstrates practical implementation of:

**Full-stack web development, REST APIs, authentication, authorization, cloud database integration, online payments, Google OAuth, map/location handling, transactional email, role-based dashboards, order tracking, OTP verification, responsive UI design, and cloud deployment.**

---

# 🔮 Future Enhancements

Possible future improvements include:

* Real-time delivery tracking
* WebSocket-based live order updates
* Push notifications
* Advanced analytics dashboard
* Sales reports
* Invoice/PDF generation
* Multiple delivery locations
* Delivery route optimization
* Customer ratings and reviews
* Automated stock alerts
* Subscription-based recurring water delivery
* Progressive Web App support

---

# 🔒 Security

For security:

* Passwords are hashed before storage.
* JWT is used for authenticated requests.
* Protected routes require valid authentication.
* Role-based authorization separates customer, admin, and delivery functionality.
* Sensitive credentials are stored in environment variables.
* Payment confirmation is verified by the backend.
* OTP verification is used for sensitive operations and delivery confirmation.
* Authentication endpoints can be protected using rate limiting.
* `.env` files and production secrets should never be committed to Git.

---

# 📄 Project Status

**AquaFlow is deployed and available as a full-stack web application.**

Customer Application:
https://water-supply-management-5egv.vercel.app

Admin & Delivery Application:
https://water-supply-management-j4sd.vercel.app

---

## 💧 AquaFlow

**Smart Water Ordering. Secure Payments. Efficient Delivery Management.**
