import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const activeLink = "nav-active";
  const normalLink = "nav-link";

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="glass-card flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold text-gray-700">
          <span className="text-gray-500">LandTax</span>{" "}
          <span className="text-[#2563EB]">System</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className={location.pathname === "/" ? activeLink : normalLink}>Home</Link>

          {isLoggedIn && (
            <>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? activeLink : normalLink}>Dashboard</Link>
              <Link to="/properties" className={location.pathname === "/properties" ? activeLink : normalLink}>Properties</Link>
              <Link to="/add-property" className={location.pathname === "/add-property" ? activeLink : normalLink}>Add Property</Link>
              <Link to="/payment-history" className="hover:text-blue-600 transition"> Payment History</Link>

            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" className={location.pathname === "/login" ? activeLink : normalLink}>Login</Link>
              <Link to="/register" className={location.pathname === "/register" ? activeLink : normalLink}>Register</Link>
            </>
          )}

          {isLoggedIn && (
            <button onClick={logout} className="ml-2 btn-primary">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
