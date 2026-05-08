import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";

const isAdmin = () => {
    const userString = localStorage.getItem("user");
    if (!userString) return false;
    try {
        const user = JSON.parse(userString);
        return user?.role === "admin";
    } catch (error) {
        return false;
    }
};

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function PublicRoute({ children }) {
    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AdminRoute({ children }) {
    if (!isAdmin()) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="bg-animated"></div>
            <Navbar />
            <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <Routes>
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
                        <ProtectedRoute>
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                />
            </Route>
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
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
