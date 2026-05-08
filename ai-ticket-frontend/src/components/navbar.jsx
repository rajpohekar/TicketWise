import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Settings, User, Compass } from "lucide-react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-slate-950/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-xl border border-white/20">
              <Compass className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
              TicketWise
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Workspace
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          {token ? (
            <>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-300 transition hover:bg-violet-500/20 hover:border-violet-500/30"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              
              <div className="hidden sm:flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white font-bold border border-white/10 text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-slate-200 pr-2">
                  {user?.email?.split("@")[0]}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 px-4 py-2 text-sm font-bold text-slate-300 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              )}
              {location.pathname !== "/signup" && (
                <Link
                  to="/signup"
                  className="modern-btn rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
