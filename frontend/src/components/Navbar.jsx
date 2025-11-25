import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Active link style
  const activeLink = "text-blue-400 font-semibold";
  const normalLink = "text-gray-200 hover:text-blue-400 transition";


  return (
    <div className="
      fixed top-4 left-1/2 -translate-x-1/2
      w-[95%] max-w-6xl
      backdrop-blur-lg bg-white/10
      border border-white/20 shadow-2xl
      rounded-2xl px-6 py-3
      flex items-center justify-between
      z-50
    ">
      {/* Logo */}
      <Link to="/" className="text-gray-200 hover:text-blue-400 text-2xl font-bold tracking-wide">
        LandTax <span className="text-blue-400">System</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">

        <Link
          to="/"
          className={location.pathname === "/" ? activeLink : normalLink}
        >
          Home
        </Link>

        {isLoggedIn && (
          <>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? activeLink : normalLink}
            >
              Dashboard
            </Link>

            <Link
              to="/properties"
              className={location.pathname === "/properties" ? activeLink : normalLink}
            >
              Properties
            </Link>

            <Link
              to="/add-property"
              className={location.pathname === "/add-property" ? activeLink : normalLink}
            >
              Add Property
            </Link>
          </>
        )}

        {!isLoggedIn && (
          <>
            <Link
              to="/login"
              className={location.pathname === "/login" ? activeLink : normalLink}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={location.pathname === "/register" ? activeLink : normalLink}
            >
              Register
            </Link>
          </>
        )}

        {isLoggedIn && (
          <button
            onClick={logout}
            className="
              text-gray-200 hover:text-blue-400 bg-red-500 px-4 py-1 rounded-lg
              hover:bg-red-600 transition shadow-md
            "
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
