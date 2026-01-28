import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// Removed App.jsx import as it wasn't defined/used in the context
// import App from "./App.jsx";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom"; // Added Outlet, Navigate
import CheckAuth from "./components/check-auth.jsx"; // Ensure correct path/casing
import Navbar from "./components/navbar.jsx"; // Import Navbar
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";

// Layout component to include Navbar on relevant pages
function MainLayout() {
    return (
      <div>
        <Navbar />
        <main className="container mx-auto px-4 py-6"> {/* Added basic container/padding */}
            <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    );
}

// Separate component for auth check logic
function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login,
        // which is a nicer user experience than dropping them off on the home page.
        return <Navigate to="/login" replace />;
    }
    return children;
}

function PublicRoute({ children }) {
    const token = localStorage.getItem("token");
    if (token) {
        // Redirect them to the home page if they are already logged in
        return <Navigate to="/" replace />;
    }
    return children;
}

// Function to check if the user is an admin
function isAdmin() {
    const userString = localStorage.getItem("user");
    if (!userString) return false;
    try {
        const user = JSON.parse(userString);
        return user?.role === 'admin';
    } catch (e) {
        return false;
    }
}

// Specific check for Admin route
function AdminRoute({ children }) {
    if (!isAdmin()) {
        // Redirect non-admins to the home page
        return <Navigate to="/" replace />;
    }
    return children;
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Routes with Navbar */}
        <Route element={<MainLayout />}>
             <Route
               path="/"
               element={
                 <ProtectedRoute>
                   <Tickets />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/tickets/:id"
               element={
                 <ProtectedRoute>
                   <TicketDetailsPage />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/admin"
               element={
                 <ProtectedRoute> {/* First ensure logged in */}
                    <AdminRoute> {/* Then ensure they are admin */}
                        <Admin />
                    </AdminRoute>
                 </ProtectedRoute>
               }
             />
        </Route>

        {/* Routes without Navbar (Login/Signup) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

         {/* Optional: Add a catch-all 404 route */}
         <Route path="*" element={<Navigate to="/" replace />} /> {/* Or a dedicated 404 component */}

      </Routes>
    </BrowserRouter>
  </StrictMode>
);

// Removed the old CheckAuth component usage as the logic is now in ProtectedRoute/PublicRoute