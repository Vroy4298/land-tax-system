import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getAuthToken } from "../utils/auth";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // 🔐 Sync login state on route change
  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, [location.pathname]);

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
                Payment History
              </Link>
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
