import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  CreditCard,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronRight
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTax: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const userRes = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUser(userData);

        const propRes = await fetch("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const propertyData = await propRes.json();
        setProperties(propertyData);

        const totalTax = propertyData.reduce(
          (sum, p) => sum + (p.finalTaxAmount || 0),
          0
        );

        setStats({
          totalProperties: propertyData.length,
          totalTax,
        });

        const payRes = await fetch("http://localhost:5000/api/payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payData = await payRes.json();
        setPayments(payData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 hidden md:flex">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              LandTax <span className="text-blue-600 font-extrabold">System</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
            Main Menu
          </div>

          <Link className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-200 group">
            <LayoutDashboard size={20} /> 
            <span className="font-medium">Dashboard</span>
            <ChevronRight size={16} className="ml-auto opacity-50" />
          </Link>

          <Link to="/properties" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 group">
            <Building2 size={20} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" /> 
            <span className="font-medium">Properties</span>
          </Link>

          <Link to="/add-property" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 group">
            <PlusSquare size={20} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" /> 
            <span className="font-medium">Add Property</span>
          </Link>

          <Link to="/payment-history" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 group">
            <CreditCard size={20} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" /> 
            <span className="font-medium">Payments</span>
          </Link>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:text-slate-400 dark:hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen relative scroll-smooth">
        
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Dashboard Overview
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
              />
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white dark:ring-slate-800 cursor-pointer hover:scale-105 transition-transform">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* WELCOME CARD */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-800 p-8 md:p-10 text-white shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user?.name}</span> 👋
                </h1>
                <p className="text-slate-300 text-lg opacity-90 max-w-xl">
                  Here's what's happening with your property portfolio and tax insights today.
                </p>
              </div>
              <Link to="/add-property" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <PlusSquare size={18} />
                Add New Property
              </Link>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Properties */}
            <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={64} className="text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Properties</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.totalProperties}</span>
                <span className="text-sm text-green-500 font-medium flex items-center gap-1">
                   Active
                </span>
              </div>
            </div>

            {/* Total Tax */}
            <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CreditCard size={64} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Tax Value</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{stats.totalTax.toLocaleString()}</span>
                <span className="text-sm text-slate-400 font-medium">INR</span>
              </div>
            </div>

            {/* Account Info */}
            <div className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard size={64} className="text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Registered Email</p>
              <div className="mt-4">
                <span className="text-lg font-semibold text-slate-900 dark:text-white truncate block" title={user.email}>
                  {user.email}
                </span>
                <span className="text-xs text-blue-500 font-medium mt-1 inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  Verified Account
                </span>
              </div>
            </div>
          </div>

          {/* YOU CAN KEEP YOUR CHARTS BELOW AS-IS */}

        </div>
      </main>
    </div>
  );
}
