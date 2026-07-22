# Frontend Architecture & Guide 💻

The frontend of the School Clinic Appointment System is a modern, single-page application (SPA) built to be blazing fast and highly responsive.

## Technology Stack
- **Framework:** React.js
- **Build Tool:** Vite (for extremely fast Hot Module Replacement and optimized builds)
- **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development)
- **Routing:** React Router DOM (for seamless page navigation without reloading)
- **HTTP Client:** Axios (for making secure requests to our backend API)
- **Icons:** Tabler Icons React
- **Charting:** Recharts (used in the Admin Dashboard for analytics)

## Directory Structure
```text
frontend/
├── src/
│   ├── context/          # React Context providers (AuthContext.js)
│   ├── pages/            # Main view components (Dashboard, Login, StaffDashboard)
│   ├── utils/            # Helper functions (api.js with Axios interceptors)
│   ├── App.jsx           # Main application entry point and routing logic
│   ├── index.css         # Tailwind directives and global styles
│   └── main.jsx          # React DOM mounting
├── postcss.config.js     # PostCSS configuration for Tailwind
├── tailwind.config.js    # Tailwind theme customization
└── vite.config.js        # Vite bundler configuration
```

## Key Features & Logic

### 1. Authentication Flow (`AuthContext.jsx`)
We use React Context to globally manage the user's authentication state. 
- When a user logs in, the backend returns a JSON Web Token (JWT).
- This token is saved to the browser's `localStorage`.
- The `AuthContext` provides the current `user` object to any component that needs it.

### 2. Protected Routing (`App.jsx`)
We built a custom `<ProtectedRoute>` component that wraps around our sensitive routes.
- It checks if a `user` exists in context.
- It verifies that the user's `role` (student, staff, admin) matches the `allowedRoles` array for that specific route.
- If they do not have permission, it redirects them to the appropriate portal.

### 3. API Interceptor (`utils/api.js`)
We configured Axios to automatically attach the JWT token to the `Authorization` header of *every* outgoing request. This ensures that the backend securely recognizes the logged-in user without us needing to manually attach the token in every single file.

## How to Run Locally
1. Open a terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Visit `http://localhost:5173` in your browser.
