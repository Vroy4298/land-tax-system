import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Ruler, 
  Calendar, 
  Building2, 
  Briefcase, 
  Map, 
  Calculator, 
  Save, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "../utils/api";
import { getAuthToken } from "../utils/auth";
import Loader from "../components/Loader";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    address: "",
    propertyType: "Residential",
    usageType: "self",
    zone: "A",
    builtUpArea: "",
    constructionYear: "",
  });

  useEffect(() => {
  const fetchProperty = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      const res = await apiFetch(`/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        const data = await res.json();
        if (res.ok) {
          setProperty(data);
          setForm({
            ownerName: data.ownerName ?? data.owner ?? "",
            ownerPhone: data.ownerPhone ?? data.phone ?? "",
            ownerEmail: data.ownerEmail ?? data.email ?? "",
            address: data.address ?? data.propertyAddress ?? "",
            propertyType: data.propertyType ?? "Residential",
            usageType: mapIncomingUsageToKey(data.usageType ?? data.usage),
            zone: data.zone ?? "A",
            builtUpArea: data.builtUpArea ?? data.area ?? data.landSize ?? "",
            constructionYear:
              data.constructionYear ??
              data.buildYear ??
              (data.createdAt ? new Date(data.createdAt).getFullYear() : ""),
          });
        } else {
          showToast("error", data.error || "Failed to load property");
        }
      } catch (err) {
        showToast("error", "Network error while fetching property");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  function mapIncomingUsageToKey(val) {
    if (!val) return "self";
    const s = String(val).toLowerCase();
    if (s.includes("self")) return "self";
    if (s.includes("rent")) return "rented";
    if (s.includes("mixed")) return "mixed";
    if (s.includes("commercial")) return "commercial";
    return "self";
  }

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // TAX PREVIEW
  const taxPreview = useMemo(() => {
    const { propertyType, builtUpArea, zone, usageType, constructionYear } = form;

    if (!builtUpArea || Number(builtUpArea) <= 0) {
      return { finalTaxAmount: 0, breakdown: {} };
    }

    const baseRates = {
      residential: 2.5,
      commercial: 5,
      industrial: 3.5,
      agriculture: 1.5,
    };

    const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0, D: 0.8 };

    const usageMultiplier = {
      self: 1.0,
      rented: 1.2,
      mixed: 1.1,
      commercial: 1.25,
    };

    const ptKey = String(propertyType).toLowerCase();
    const baseRate = baseRates[ptKey] ?? 2.5;

    const zKey = (zone || "A").toUpperCase();
    const zMult = zoneMultiplier[zKey] ?? 1.0;

    let uKey = String(usageType).toLowerCase();
    if (!usageMultiplier[uKey]) uKey = "self";
    const uMult = usageMultiplier[uKey];

    const currentYear = new Date().getFullYear();
    const year = Number(constructionYear) || currentYear;
    const age = Math.max(0, currentYear - year);

    let ageFactor = 1.0;
    if (age >= 11 && age <= 20) ageFactor = 0.9;
    else if (age >= 21 && age <= 30) ageFactor = 0.8;
    else if (age > 30) ageFactor = 0.7;

    const area = Number(builtUpArea) || 0;
    const rawTax = area * baseRate * zMult * uMult * ageFactor;
    const finalTaxAmount = Math.round(rawTax);

    const breakdown = {
      area,
      baseRate,
      zMult,
      uMult,
      age,
      ageFactor,
      rawTax,
    };

    return { finalTaxAmount, breakdown };
  }, [form]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.ownerName || !form.address || !form.builtUpArea) {
      showToast("error", "Owner, Address, and Area are required.");
      return;
    }

    setSaving(true);
    try {
      const token = getAuthToken();

      const res = await apiFetch(`/api/properties/${id}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    ...form,
    finalTaxAmount: taxPreview.finalTaxAmount,
  }),
});


      const data = await res.json();
      if (res.ok) {
        showToast("success", "Property details updated successfully");
        setTimeout(() => navigate("/properties"), 1000);
      } else {
        showToast("error", data.error || "Update failed");
      }
    } catch (err) {
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

    try {
      const token = getAuthToken();
      const res = await apiFetch(`/api/properties/${id}`, {
      method: "DELETE",
      headers: {
      Authorization: `Bearer ${token}`,
      },
     });


      const data = await res.json();
      if (res.ok) {
        showToast("success", "Property deleted successfully");
        setTimeout(() => navigate("/properties"), 1000);
      } else {
        showToast("error", data.error || "Delete failed");
      }
    } catch (err) {
      showToast("error", "Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <Loader />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Property Not Found</h2>
          <button onClick={() => navigate("/properties")} className="text-blue-600 hover:underline">
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const breakdown = taxPreview.breakdown || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 border ${
          toast.type === "success" 
            ? "bg-white dark:bg-slate-900 border-green-500 text-green-700 dark:text-green-400" 
            : "bg-white dark:bg-slate-900 border-red-500 text-red-600 dark:text-red-400"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
               <Link to="/properties" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                 <ArrowLeft size={14} /> Back to List
               </Link>
               <span>/</span>
               <span className="text-slate-800 dark:text-slate-200 font-medium">Edit Property</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Edit Property Record
            </h1>
          </div>
          
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 size={18} />
            <span>Delete Property</span>
          </button>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >

          {/* LEFT COLUMN: EDIT FORM */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* SECTION 1: OWNER */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Owner Details</h3>
                    <p className="text-xs text-slate-500 font-medium">Update contact information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Owner Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        name="ownerName"
                        value={form.ownerName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                          name="ownerPhone"
                          value={form.ownerPhone}
                          onChange={handleChange}
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                          name="ownerEmail"
                          value={form.ownerEmail}
                          onChange={handleChange}
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* SECTION 2: SPECS */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Property Specs</h3>
                    <p className="text-xs text-slate-500 font-medium">Update location & dimensions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <textarea
                        name="address"
                        rows="2"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Built-up Area (sq ft)</label>
                      <div className="relative group">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                          name="builtUpArea"
                          type="number"
                          value={form.builtUpArea}
                          onChange={handleChange}
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Construction Year</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                          name="constructionYear"
                          type="number"
                          value={form.constructionYear}
                          onChange={handleChange}
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* SECTION 3: CLASSIFICATION */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Classification</h3>
                    <p className="text-xs text-slate-500 font-medium">Update zoning & usage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Type</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <select
                        name="propertyType"
                        value={form.propertyType}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                        <option>Agriculture</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Usage</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <select
                        name="usageType"
                        value={form.usageType}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="self">Self-Occupied</option>
                        <option value="rented">Rented</option>
                        <option value="mixed">Mixed</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Zone</label>
                    <div className="relative group">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <select
                        name="zone"
                        value={form.zone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="A">A - High</option>
                        <option value="B">B - Medium</option>
                        <option value="C">C - Low</option>
                        <option value="D">D - Very Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <button 
                  type="button" 
                  onClick={() => navigate("/properties")}
                  className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Save size={22} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: TAX PREVIEW (STICKY) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit">
             <motion.div 
              variants={itemVariants}
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <Calculator className="text-blue-400" /> 
                Live Estimation
              </h3>

              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                   <span className="text-slate-400">Built-up Area</span>
                   <span className="font-mono text-slate-200">{breakdown.area || 0} <span className="text-xs text-slate-500">sq ft</span></span>
                 </div>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                   <span className="text-slate-400">Base Rate</span>
                   <span className="font-mono text-slate-200">₹{breakdown.baseRate || 0}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                   <span className="text-slate-400">Zone Multiplier</span>
                   <span className="font-mono text-emerald-400">× {breakdown.zMult || 1}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                   <span className="text-slate-400">Usage Multiplier</span>
                   <span className="font-mono text-emerald-400">× {breakdown.uMult || 1}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                   <span className="text-slate-400">Age Factor ({breakdown.age}y)</span>
                   <span className="font-mono text-emerald-400">× {breakdown.ageFactor || 1}</span>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700 relative z-10">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">New Annual Tax</p>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 font-mono">
                  ₹{taxPreview.finalTaxAmount.toLocaleString()}
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <CheckCircle2 size={14} className="mt-0.5 text-blue-500" />
                  Updating this value will generate a new tax demand notice.
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
