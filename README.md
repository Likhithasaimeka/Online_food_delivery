# 🍕 Online Food Delivery System

A complete full-stack food delivery web application built with **React (Vite)** on the frontend and **Node.js (Express + SQLite3)** on the backend.

---

## 🔑 Login Credentials

### 🛡️ Admin Credentials
Access the Admin Dashboard to manage menu items, restaurant listings, customer orders, live delivery tracking, and view financial earnings reports.

* **Admin Login URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login) or via the **Auth** page "Admin Login" tab.

| Credential Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Personal Admin** | `sailikhitha68@gmail.com` | `1234` | Full Admin |
| **Default System Admin** | `admin@foodapp.com` | `Admin@123` | Full Admin |

> Both credential sets are fully supported and verified!

#### 🛠️ What the Admin Can Do:
* **Dashboard Overview**: View real-time statistics (total users, total dishes, total orders placed).
* **Menu Management**: Add new food dishes, edit existing prices/descriptions/images, or delete items.
* **Order & Delivery Control**: View customer orders and transition statuses (`Pending` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
* **Restaurant Directory**: Add and configure restaurant branches across locations with ratings and estimated delivery times.
* **Income Analytics**: Analyze sales earnings with dynamic filters (`Today`, `This Week`, `This Month`, `This Year`, or `All Time`).
* **User Management**: Inspect registered user accounts and manage access.

---

### 👤 Customer User Accounts
* **User Login URL**: [http://localhost:5173/login](http://localhost:5173/login) or [http://localhost:5173/auth](http://localhost:5173/auth)

| Name | Email | Password | Status |
| :--- | :--- | :--- | :--- |
| **likkhi** | `sailikhitha68@gmail.com` | `123456` | Verified |
| **vidhya** | `srividhyamaganti2103@gmail.com` | `123456` | Verified |
| **chandhini** | `chandinipothula99@gmail.com` | `123456` | Verified |
| **srinivas** | `mekasrinivas1978@gmail.com` | `Bapanna2405` | Verified |
| **Demo User** | `demo@foodapp.com` | `123456` | Verified |

> **New Registrations**: You can also register a new account anytime on the **Register** tab. If your Gmail App Password is not set up, a built-in development fallback will display the 6-digit verification OTP right on your screen and in the server console!

---

## 🚀 How to Run the Application

### Option 1: One-Click Launch (Windows)
Double-click `start-all.bat` in the project root folder. It starts both servers in separate command windows:
* **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

### Option 2: Run via Terminal

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm install
npm start
```
*Server starts on `http://localhost:5000` and automatically initializes SQLite database.*

#### Terminal 2 — Start Frontend Server:
```bash
cd frontend
npm install
npm run dev
```
*Vite dev server starts on `http://localhost:5173`.*

---

## 🐙 Ready to Push to GitHub

This repository is pre-configured with a clean `.gitignore` to ensure **no bulky `node_modules`**, **no private `.env` secrets**, and **no temporary build files** get committed.

To push this project to a new repository on your GitHub account, run these commands:

```bash
# 1. Initialize git
git init

# 2. Stage all project files (safe-listed via .gitignore)
git add .

# 3. Create your initial commit
git commit -m "Initial commit: Online Food Delivery System with fixes"

# 4. Set default branch to main
git branch -M main

# 5. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 🛠️ Summary of Fixes Applied

1. **CSS Build Error Resolved**: Fixed duplicate and unterminated selector blocks in [profile.css](file:///c:/Users/likhi/online-food-delivery/frontend/src/styles/profile.css) that were causing minification warnings during Vite builds.
2. **Income Dashboard SQL Query Fixed**: In [paymentModel.js](file:///c:/Users/likhi/online-food-delivery/backend/models/paymentModel.js), repaired a broken `WHERE` clause concatenation that caused a SQLite syntax crash whenever the filter was set to `'all'`.
3. **Registration OTP Fallback**: Added a development fallback in [userController.js](file:///c:/Users/likhi/online-food-delivery/backend/controllers/userController.js) so new user registration never gets blocked even if the Gmail SMTP app password is expired or unconfigured.
4. **Order Payment Status Sync**: Enhanced [paymentController.js](file:///c:/Users/likhi/online-food-delivery/backend/controllers/paymentController.js) and [Cart.jsx](file:///c:/Users/likhi/online-food-delivery/frontend/src/pages/Cart.jsx) so all cart orders are marked `"Paid"` upon successful wallet checkout.
5. **Dual Admin Authentication**: Enabled support for both the user's custom admin credentials (`sailikhitha68@gmail.com` / `1234`) and the system default (`admin@foodapp.com` / `Admin@123`).
6. **Project Launchers & Security**: Added root `package.json`, `start-all.bat`, `.env.example`, and `.gitignore`.

---

## 📂 Project Structure

```
online-food-delivery/
├── backend/
│   ├── config/             # Database (SQLite), Admin, & Mail configurations
│   ├── controllers/        # User, Order, Food, Restaurant, Payment, Wallet, Admin controllers
│   ├── middleware/         # Admin JWT verification & Multer file uploads
│   ├── models/             # SQLite data access objects
│   ├── routes/             # Express REST API routes
│   ├── uploads/            # Profile picture uploads (with .gitkeep)
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point (port 5000)
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, FoodCard, OrderTracker
│   │   ├── pages/          # Home, Auth, Cart, Profile, EditProfile, Wallet, Admin pages
│   │   ├── services/       # API integration client
│   │   └── styles/         # Custom styling sheets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration (port 5173)
├── .gitignore              # Git ignore rules for node_modules, secrets, & dist
├── package.json            # Root workspace scripts
├── start-all.bat           # Windows one-click launcher
└── README.md               # Complete documentation
```
