# School Clinic Appointment System - Local Setup Guide

Welcome to the School Clinic Appointment System! This guide provides step-by-step instructions for team members to set up and run the entire application on their local machines.

## Prerequisites
Before you begin, ensure you have the following installed on your PC:
1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended) - Required to run the Backend and Frontend.
2. **[XAMPP](https://www.apachefriends.org/index.html)** - Required to run the local MySQL Database.

---

## Step 1: Database Setup (Using XAMPP)
Our application requires a MySQL database to store users, appointments, and medical records.

1. Open the **XAMPP Control Panel**.
2. Start the **Apache** and **MySQL** modules by clicking the "Start" buttons next to them. (They should turn green).
3. Click the **Admin** button next to MySQL. This will open **phpMyAdmin** in your browser (`http://localhost/phpmyadmin/`).
4. On the left sidebar of phpMyAdmin, click **New** to create a new database.
5. Name the database **`clinic_db`** and click **Create**.
6. Select your new `clinic_db` database on the left sidebar.
7. Click the **SQL** tab at the top of the page.
8. Open the `backend/schema.sql` file from this project folder, copy all the SQL text inside it, paste it into the SQL box in phpMyAdmin, and click **Go** (or press Ctrl+Enter).
   *This will instantly generate all 7 tables required for the application!*

---

## Step 2: Backend Setup
The backend serves as the API bridge between the React frontend and the MySQL database.

1. Open your terminal or command prompt.
2. Navigate into the backend folder:
   ```bash
   cd path/to/project/backend
   ```
3. Install all necessary dependencies:
   ```bash
   npm install
   ```
4. Create a new file named exactly **`.env`** inside the `backend` folder and paste the following into it:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=clinic_db
   JWT_SECRET=supersecret12345
   ```
   *(Note: XAMPP's default MySQL username is `root` with no password, which is why `DB_PASSWORD` is blank).*
5. Start the backend server:
   ```bash
   node server.js
   ```
   *You should see a message saying "Server running on port 5000". Leave this terminal open!*

---

## Step 3: Frontend Setup
The frontend is built with React and Vite.

1. Open a **new, second terminal** (keep the backend terminal running).
2. Navigate into the frontend folder:
   ```bash
   cd path/to/project/frontend
   ```
3. Install all necessary dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. The terminal will give you a local URL (usually `http://localhost:5173`). Ctrl+Click it to open the application in your browser!

---

## Step 4: Testing the Application
The application is now fully running! To test the different portals, you can use the following default admin credentials that were automatically seeded into the database:

**Admin Account:**
- **Email:** `admin@clinic.com`
- **Password:** `admin123`

Log in with this account, and from the Admin Dashboard, you can create Doctor/Staff accounts to test the Staff Portal. You can also register a brand new account from the login screen to test the Student Portal!
