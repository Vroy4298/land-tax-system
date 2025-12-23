import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Edit2, 
  Trash2, 
  MapPin, 
  Layers, 
  Home, 
  MoreHorizontal,
  Search,
  Filter,
  Plus
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";
import { apiFetch } from "../utils/api";

/* ---------------- ANIMATION VARIANTS ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const rowVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20 }
};

/* ---------------- FORMATTERS ---------------- */
const formatUsage = (u) =>
  u === "self" ? "Self-Occupied" :
  u === "rented" ? "Rented" :
  u;

const formatType = (t) =>
  t?.charAt(0).toUpperCase() + t?.slice(1);

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  /* ---------------- LOAD PROPERTIES ---------------- */
  const loadProperties = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await apiFetch("/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setProperties(data);
    } catch (err) {
      console.error("Load properties error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return;

    setDeleting(id);

    try {
      const token = getAuthToken();
      const res = await apiFetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting");
    } finally {
      setDeleting(null);
    }
  };

  const formatINR = (n) =>
    "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  /* ---------------- LOADER ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      {/* 
        Container with padding-top: 32 (8rem/128px) to explicitly clear fixed navbar.
        Padding is applied here to avoid conflicts with other utility classes.
      */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-12 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Property Portfolio
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Manage your land assets, track taxes, and view payment history.
            </p>
          </div>

          {properties.length > 0 && (
            <div className="flex items-center gap-4">
               {/* Search Bar */}
               <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all w-64 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              {/* Add Button */}
              <Link 
                to="/add-property"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={20} strokeWidth={3} />
                <span className="hidden sm:inline">Add Property</span>
              </Link>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {properties.length === 0 && (
          <div className="animate-in fade-in zoom-in duration-500 pt-10">
            <EmptyState
              title="No properties added yet"
              description="Start by adding your first property to calculate tax."
              actionLabel="Add Property"
              onAction={() => window.location.href = "/add-property"}
            />
          </div>
        )}

        {/* DATA TABLE */}
        {properties.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Table Controls */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  All Records
                </h3>
                <span className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {properties.length}
                </span>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Filter size={20} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner / Address</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Zone</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tax Value</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900"
                >
                  <AnimatePresence>
                    {properties.map((p) => (
                      <motion.tr 
                        key={p._id} 
                        variants={rowVariants}
                        exit="exit"
                        className="group hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors duration-200"
                      >
                        {/* Owner & Address */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 ring-2 ring-white dark:ring-slate-800">
                              {p.ownerName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {p.ownerName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <MapPin size={12} className="shrink-0" />
                                <span className="truncate max-w-[150px]">{p.address}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Property Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                              <Home size={14} className="text-slate-400" />
                              {p.builtUpArea} <span className="text-xs text-slate-500">sq ft</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Layers size={14} className="text-slate-400" />
                              {p.usageType}
                            </div>
                          </div>
                        </td>

                        {/* Zone */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {p.zone}
                          </span>
                        </td>

                        {/* Tax Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {formatINR(p.finalTaxAmount)}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Estimated</div>
                        </td>

                        {/* Status Pill */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {p.paymentStatus === "paid" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link to={`/properties/${p._id}`}>
                              <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="View Details">
                                <Eye size={18} />
                              </button>
                            </Link>

                            <Link to={`/properties/${p._id}/edit`}>
                              <button className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Edit Property">
                                <Edit2 size={18} />
                              </button>
                            </Link>

                            <button
                              onClick={() => handleDelete(p._id)}
                              disabled={deleting === p._id}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                              title="Delete Property"
                            >
                              {deleting === p._id ? (
                                <span className="h-4 w-4 block rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                          {/* Mobile fallback for actions */}
                          <div className="sm:hidden flex items-center justify-end">
                            <MoreHorizontal size={20} className="text-slate-400" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
            
            {/* Pagination / Footer Placeholder */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing all {properties.length} records
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
