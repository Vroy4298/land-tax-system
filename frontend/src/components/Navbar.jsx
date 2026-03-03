import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, ChevronDown, ShieldCheck, Map, AlertCircle } from "lucide-react";
import { getAuthToken, isAdmin } from "../utils/auth";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef(null);

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // 🔐 Sync login state on route change
  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    setAdminUser(!!token && isAdmin());
  }, [location.pathname]);

  // Close admin dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const activeLink = "nav-active";
  const normalLink = "nav-link";

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="text-xl font-bold">
          <span className="text-gray-500 dark:text-gray-300">LandTax</span>{" "}
          <span className="text-blue-600 dark:text-blue-400">System</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-6 whitespace-nowrap">

          {/* HOME (context-aware) */}
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className={
              location.pathname === "/" || location.pathname === "/dashboard"
                ? activeLink
                : normalLink
            }
          >
            Home
          </Link>

          {/* PRIVATE LINKS */}
          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className={
                  location.pathname === "/dashboard" ? activeLink : normalLink
                }
              >
                Dashboard
              </Link>

              <Link
                to="/properties"
                className={
                  location.pathname.startsWith("/properties")
                    ? activeLink
                    : normalLink
                }
              >
                Properties
              </Link>

              <Link
                to="/add-property"
                className={
                  location.pathname === "/add-property"
                    ? activeLink
                    : normalLink
                }
              >
                Add Property
              </Link>

              <Link
                to="/payment-history"
                className={
                  location.pathname === "/payment-history"
                    ? activeLink
                    : normalLink
                }
              >
                History
              </Link>

              <Link
                to="/map"
                className={`flex items-center gap-1 ${location.pathname === "/map" ? activeLink : normalLink}`}
              >
                <Map size={14} /> Map
              </Link>

              <Link
                to="/disputes"
                className={`flex items-center gap-1 ${location.pathname === "/disputes" ? activeLink : normalLink}`}
              >
                <AlertCircle size={14} /> Disputes
              </Link>

              {/* ADMIN DROPDOWN */}
              {adminUser && (
                <div className="relative" ref={adminRef}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    <ShieldCheck size={14} /> Admin <ChevronDown size={12} className={`transition-transform ${adminOpen ? "rotate-180" : ""}`} />
                  </button>
                  {adminOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                      {[
                        { to: "/admin", label: "Analytics" },
                        { to: "/admin/properties", label: "All Properties" },
                        { to: "/admin/users", label: "All Users" },
                      ].map(({ to, label }) => (
                        <Link key={to} to={to} onClick={() => setAdminOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition">
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* PUBLIC LINKS */}
          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className={
                  location.pathname === "/login" ? activeLink : normalLink
                }
              >
                Login
              </Link>
              <Link
                to="/register"
                className={
                  location.pathname === "/register" ? activeLink : normalLink
                }
              >
                Register
              </Link>
            </>
          )}

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 ml-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              title="Toggle theme"
            >
              {dark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {isLoggedIn && (
              <button onClick={logout} className="btn-primary">
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
