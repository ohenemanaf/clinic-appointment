# Backend Architecture & Guide ⚙️

The backend serves as the brain of the School Clinic Application, providing a secure RESTful API for the frontend to consume, and handling all complex database interactions.

## Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js (for routing and middleware handling)
- **Database Driver:** `mysql2` (specifically using the Promise-wrapper for async/await support)
- **Authentication:** `jsonwebtoken` (JWT for stateless authentication)
- **Security:** `bcryptjs` (for securely hashing user passwords)
- **Environment:** `dotenv` (for managing secret configuration variables)

## Directory Structure
```text
backend/
├── config/
│   └── db.js                 # MySQL database connection pool configuration
├── controllers/              # Core business logic (The "C" in MVC)
│   ├── adminController.js    # Analytics and staff creation
│   ├── appointmentController.js # Booking, fetching, and cancelling slots
│   ├── authController.js     # Login and registration
│   ├── notificationController.js # Managing student alerts
│   ├── recordController.js   # Creating medical records
│   └── studentController.js  # Updating student profiles
├── routes/                   # Endpoint definitions mapping to controllers
│   ├── adminRoutes.js
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── notificationRoutes.js
│   ├── recordRoutes.js
│   └── studentRoutes.js
├── server.js                 # Main Express server entry point
└── schema.sql                # The raw SQL file defining the database schema
```

## Key Features & Logic

### 1. Connection Pooling (`config/db.js`)
Instead of opening and closing a single database connection for every API request, we use a `Connection Pool`. This maintains a set of open connections to the MySQL database, significantly improving the performance and reliability of the application under heavy load.

### 2. Transaction Management
For operations that require multiple database queries to succeed simultaneously (like booking an appointment and updating a time slot), we use SQL **Transactions** (`await connection.beginTransaction()`). 
If any single query fails, the backend triggers a `rollback()`, ensuring the database is never left in an incomplete or corrupted state.

### 3. Password Hashing
We never store plain-text passwords. When a user registers, `bcryptjs` salts and hashes the password before saving it to MySQL. When they log in, `bcrypt` securely compares the inputted password against the hash.

## How to Run Locally
1. Ensure MySQL is running on your machine and the database is configured.
2. Open a terminal and navigate to the backend folder: `cd backend`
3. Install dependencies: `npm install`
4. Set up your `.env` file with your database credentials and a `JWT_SECRET`.
5. Start the server: `node server.js`
6. The API will be available at `http://localhost:5000`.
