import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  CreditCard,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronRight,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

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
      setLoading(true);

      try {
        const token = getAuthToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // ✅ PARALLEL FETCH (FAST)
        const [userRes, propRes, payRes] = await Promise.all([
          fetch(`${API_URL}/api/users/profile`, { headers }),
          fetch(`${API_URL}/api/properties`, { headers }),
          fetch(`${API_URL}/api/payments`, { headers }),
        ]);

        const userData = await userRes.json();
        const propertyData = await propRes.json();
        const paymentData = await payRes.json();

        setUser(userData);
        setProperties(propertyData);
        setPayments(paymentData);

        const totalTax = propertyData.reduce(
          (sum, p) => sum + (p.finalTaxAmount || 0),
          0
        );

        setStats({
          totalProperties: propertyData.length,
          totalTax,
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart data (unchanged)
  const getChartData = () => {
    const counts = properties.reduce((acc, curr) => {
      const type = curr.propertyType || "Residential";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

  if (loading) return <Loader />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 hidden md:flex">
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

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
            Main Menu
          </div>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-200 group">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-800 p-8 md:p-10 text-white shadow-2xl shadow-slate-900/20"
          >
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
          </motion.div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Properties */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden"
            >
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
            </motion.div>

            {/* Total Tax */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CreditCard size={64} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Tax Value</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{stats.totalTax.toLocaleString()}</span>
                <span className="text-sm text-slate-400 font-medium">INR</span>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard size={64} className="text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Registered Email</p>
              <div className="mt-4">
                <span className="text-lg font-semibold text-slate-900 dark:text-white truncate block" title={user?.email}>
                  {user?.email}
                </span>
                <span className="text-xs text-blue-500 font-medium mt-1 inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  Verified Account
                </span>
              </div>
            </motion.div>
          </div>

          {/* ================= NEW LOWER SECTIONS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            
            {/* LEFT COLUMN: PRIMARY DATA (Properties Table) */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Properties</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your latest added assets</p>
                  </div>
                  <Link to="/properties" className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ArrowRight size={16} />
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-8 py-4">Address</th>
                        <th className="px-8 py-4">Type</th>
                        <th className="px-8 py-4">Tax Value</th>
                        <th className="px-8 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {properties.length > 0 ? properties.slice(0, 5).map((prop, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                                <Building2 size={16} />
                              </div>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 max-w-[180px]" title={prop.address}>
                                {prop.address}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                              {prop.propertyType || 'Residential'}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              ₹{(prop.finalTaxAmount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-1.5">
                              {prop.paymentStatus === 'paid' ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                                  <CheckCircle2 size={14} /> Paid
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                  <Clock size={14} /> Pending
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-12 text-center text-slate-400">
                            No properties added yet. Click "Add New Property" to start.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* QUICK ACTIONS ROW */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all">
                  <div className="absolute -bottom-6 -right-6 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={120} />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Digital Tax Receipts</h4>
                  <p className="text-sm text-blue-100 opacity-80 mb-6">Download verified payment history and certificates instantly.</p>
                  <Link to="/payment-history" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-all">
                    Access Documents <ExternalLink size={16} />
                  </Link>
                </div>

                {/* SYSTEM INSIGHTS: Interactive circles stack */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group cursor-default transition-all duration-300"
                >
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">System Insights</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total portfolio valuation and tax projections for the current cycle.</p>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <motion.div 
                      className="flex -space-x-3"
                      whileHover="hover"
                      initial="initial"
                    >
                      {[1, 2, 3, 4].map((i, idx) => (
                        <motion.div 
                          key={i}
                          variants={{
                            initial: { x: 0 },
                            hover: { x: idx * 8, zIndex: 10 }
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-500 shadow-sm transition-shadow hover:shadow-md"
                        >
                          {String.fromCharCode(64 + i)}
                        </motion.div>
                      ))}
                      <motion.div 
                        variants={{
                          initial: { x: 0 },
                          hover: { x: 4 * 8, zIndex: 10 }
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-600 text-[11px] font-bold text-white shadow-lg shadow-blue-500/30"
                      >
                        +8
                      </motion.div>
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Active Contributors</span>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE NOW
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: ANALYTICS & ACTIVITY */}
            <div className="space-y-8">
              
              {/* ANALYTICS CARD */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Type Distribution</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData().length > 0 ? getChartData() : [{name: 'Empty', value: 1}]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(getChartData().length > 0 ? getChartData() : [{name: 'Empty', value: 1}]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChartData().length > 0 ? COLORS[index % COLORS.length] : '#e2e8f0'} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-3">
                  {getChartData().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* RECENT ACTIVITY TIMELINE */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                    <Clock size={16} />
                  </div>
                </div>

                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                  {/* Dummy activities for UI richness */}
                  {[
                    { title: "Property Updated", desc: "Civil lines residential updated", time: "2h ago", color: "text-blue-500", bg: "bg-blue-500" },
                    { title: "Payment Verified", desc: "Tax receipt generated for #TX892", time: "5h ago", color: "text-green-500", bg: "bg-green-500" },
                    { title: "New Property Added", desc: "Added to Industrial sector A", time: "1d ago", color: "text-indigo-500", bg: "bg-indigo-500" },
                  ].map((act, idx) => (
                    <div key={idx} className="relative pl-8 group">
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${act.bg} z-10 shadow-sm`}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">{act.title}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">{act.desc}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
                  View System Logs
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
