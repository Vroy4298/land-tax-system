import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon, User, LogOut, Menu, X, Building2, ShieldCheck, Languages } from "lucide-react";
import { getAuthToken, isAdmin } from "../utils/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const adminRef = useRef(null);
  const { t, i18n } = useTranslation();

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    setAdminUser(!!token && isAdmin());
    setMobileOpen(false); // close mobile menu on route change
    setAvatarUrl(localStorage.getItem("userAvatar"));
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
    navigate("/");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const isActive = (path) => location.pathname === path;
  const isActivePre = (prefix) => location.pathname.startsWith(prefix);

  const navLinkClass = (active) =>
    `relative text-sm font-medium transition-colors duration-200 py-1 group ${active
      ? "text-blue-600 dark:text-blue-400"
      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    }`;

  const navIndicator = (active) =>
    `absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-blue-500 transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* LOGO */}
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition-colors">
            <Building2 size={18} />
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="text-slate-700 dark:text-slate-200">LandTax</span>
            <span className="text-blue-600 dark:text-blue-400"> System</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className={navLinkClass(isActive("/") || isActive("/dashboard"))}
          >
            {t("Home")}
            <span className={navIndicator(isActive("/") || isActive("/dashboard"))} />
          </Link>

          {isLoggedIn && !adminUser && (
            <>
              <Link to="/dashboard" className={navLinkClass(isActive("/dashboard"))}>
                {t("Dashboard")}
                <span className={navIndicator(isActive("/dashboard"))} />
              </Link>
              <Link to="/properties" className={navLinkClass(isActivePre("/properties"))}>
                {t("Properties")}
                <span className={navIndicator(isActivePre("/properties"))} />
              </Link>
              <Link to="/add-property" className={navLinkClass(isActive("/add-property"))}>
                {t("Add Property")}
                <span className={navIndicator(isActive("/add-property"))} />
              </Link>
              <Link to="/payment-history" className={navLinkClass(isActive("/payment-history"))}>
                {t("History")}
                <span className={navIndicator(isActive("/payment-history"))} />
              </Link>
              <Link to="/map" className={`flex items-center gap-1 ${navLinkClass(isActive("/map"))}`}>
                <Map size={14} /> {t("Map")}
                <span className={navIndicator(isActive("/map"))} />
              </Link>
              <Link to="/disputes" className={`flex items-center gap-1 ${navLinkClass(isActive("/disputes"))}`}>
                <AlertCircle size={14} /> {t("Disputes")}
                <span className={navIndicator(isActive("/disputes"))} />
              </Link>
            </>
          )}

          {/* ADMIN NAV LINKS */}
          {adminUser && (
            <>
              <Link to="/admin" className={navLinkClass(isActive("/admin"))}>
                {t("Analytics")}
                <span className={navIndicator(isActive("/admin"))} />
              </Link>
              <Link to="/admin/properties" className={navLinkClass(isActivePre("/admin/properties"))}>
                {t("All Properties")}
                <span className={navIndicator(isActivePre("/admin/properties"))} />
              </Link>
              <Link to="/admin/users" className={navLinkClass(isActivePre("/admin/users"))}>
                {t("All Users")}
                <span className={navIndicator(isActivePre("/admin/users"))} />
              </Link>
              <Link to="/disputes" className={`flex items-center gap-1 ${navLinkClass(isActive("/disputes"))}`}>
                <AlertCircle size={14} /> {t("All Disputes")}
                <span className={navIndicator(isActive("/disputes"))} />
              </Link>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" className={navLinkClass(isActive("/login"))}>
                {t("Login")}
                <span className={navIndicator(isActive("/login"))} />
              </Link>
              <Link to="/register" className={navLinkClass(isActive("/register"))}>
                {t("Register")}
                <span className={navIndicator(isActive("/register"))} />
              </Link>
            </>
          )}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group hidden sm:flex items-center">
            <Languages size={18} className="text-slate-400 absolute left-2 pointer-events-none" />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="pl-8 pr-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg outline-none appearance-none hover:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {dark ? (
              <Sun className="w-[18px] h-[18px] text-yellow-400" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-gray-500" />
            )}
          </button>

          {isLoggedIn && avatarUrl && (
            <Link to="/dashboard" className="hidden sm:block h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all focus:outline-none">
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </Link>
          )}

          {isLoggedIn && (
            <button
              onClick={logout}
              className="hidden sm:block text-sm font-semibold px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              {t("Logout")}
            </button>
          )}

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b1220] px-6 py-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
          {[
            { to: isLoggedIn && !adminUser ? "/dashboard" : isLoggedIn && adminUser ? "/admin" : "/", label: t("Home"), show: true },
            { to: "/dashboard", label: t("Dashboard"), show: isLoggedIn && !adminUser },
            { to: "/properties", label: t("Properties"), show: isLoggedIn && !adminUser },
            { to: "/add-property", label: t("Add Property"), show: isLoggedIn && !adminUser },
            { to: "/payment-history", label: t("Payment History"), show: isLoggedIn && !adminUser },
            { to: "/map", label: t("Map View"), show: isLoggedIn && !adminUser },
            { to: "/disputes", label: t("Disputes"), show: isLoggedIn && !adminUser },
            { to: "/admin", label: t("Analytics"), show: adminUser },
            { to: "/admin/properties", label: t("All Properties"), show: adminUser },
            { to: "/admin/users", label: t("All Users"), show: adminUser },
            { to: "/disputes", label: t("All Disputes"), show: adminUser },
            { to: "/login", label: t("Login"), show: !isLoggedIn },
            { to: "/register", label: t("Register"), show: !isLoggedIn },
          ]
            .filter((item) => item.show)
            .map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === to
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {label}
              </Link>
            ))}

          {isLoggedIn && (
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
            >
              {t("Logout")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
