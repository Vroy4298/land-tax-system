import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

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
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { getAuthToken } from "../utils/auth";

export default function AddProperty() {
  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    address: "",
    builtUpArea: "",
    constructionYear: "",
    propertyType: "Residential",
    usageType: "Self-Occupied",
    zone: "A",
  });

  const [taxPreview, setTaxPreview] = useState({
    finalTax: 0,
    baseRate: 0,
    zoneMultiplier: 1,
    usageMultiplier: 1,
    ageFactor: 1,
  });

  useEffect(() => {
    calculatePreview();
  }, [form]);

  const calculatePreview = () => {
    const { builtUpArea, propertyType, zone, usageType, constructionYear } = form;

    const baseRates = { Residential: 2.5, Commercial: 5, Industrial: 3.5 };
    const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0 };
    const usageMultiplier = { "Self-Occupied": 1.0, Rented: 1.2 };

    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(constructionYear || currentYear);
    const ageFactor = age > 30 ? 0.7 : age > 20 ? 0.8 : age > 10 ? 0.9 : 1;

    const final =
      Number(builtUpArea || 0) *
      baseRates[propertyType] *
      zoneMultiplier[zone] *
      usageMultiplier[usageType] *
      ageFactor;

    setTaxPreview({
      finalTax: Math.round(final),
      baseRate: baseRates[propertyType],
      zoneMultiplier: zoneMultiplier[zone],
      usageMultiplier: usageMultiplier[usageType],
      ageFactor,
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = getAuthToken();
//     if (!token) {
//       alert("Session expired. Please login again.");
//       window.location.href = "/login";
//       return;
//     }

//     const res = await apiFetch("/api/properties", {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${token}`,
//   },
//   body: JSON.stringify(payload),
// });

//     const data = await res.json();
//     if (res.ok) alert("Property Added!");
//     else alert(data.error);
//   };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
  e.preventDefault();

  const token = getAuthToken();
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "/login";
    return;
  }

  const payload = {
    ownerName: form.ownerName,
    ownerPhone: form.ownerPhone,
    ownerEmail: form.ownerEmail,
    address: form.address,

    propertyType: form.propertyType,
    usageType: form.usageType,
    zone: form.zone,

    builtUpArea: Number(form.builtUpArea),
    constructionYear: Number(form.constructionYear),
  };

  try {
    const res = await apiFetch("/properties", {   // ✅ FIXED
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to save property");
      return;
    }

    alert("✅ Property Added Successfully");
    window.location.href = "/properties";
  } catch (err) {
    console.error("Add property error:", err);
    alert("Network error. Please try again.");
  }
};



  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      {/* Main Content Wrapper - Added pt-32 to clear navbar */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200 dark:border-blue-800">
            <Calculator size={14} /> New Record
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Register New Property
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter the property details below. Our system will automatically calculate the estimated tax liability based on the current municipal zone rates.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >

          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* CARD 1: OWNER INFORMATION */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Owner Details</h3>
                    <p className="text-xs text-slate-500 font-medium">Primary contact information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        name="ownerName"
                        value={form.ownerName}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Jain"
                        className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                          name="ownerPhone"
                          value={form.ownerPhone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                          name="ownerEmail"
                          value={form.ownerEmail}
                          onChange={handleChange}
                          placeholder="rahul@example.com"
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CARD 2: PROPERTY LOCATION & SIZE */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Property Specs</h3>
                    <p className="text-xs text-slate-500 font-medium">Location and physical dimensions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <textarea
                        name="address"
                        rows="2"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Flat No, Street, Locality, City..."
                        className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Area */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Built-up Area (sq ft) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                          name="builtUpArea"
                          type="number"
                          value={form.builtUpArea}
                          onChange={handleChange}
                          placeholder="1200"
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Year */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Construction Year
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                          name="constructionYear"
                          type="number"
                          value={form.constructionYear}
                          onChange={handleChange}
                          placeholder="e.g. 2018"
                          className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CARD 3: CLASSIFICATION */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Classification</h3>
                    <p className="text-xs text-slate-500 font-medium">Zoning and usage category</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Property Type
                    </label>
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
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Usage Status
                    </label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <select
                        name="usageType"
                        value={form.usageType}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option>Self-Occupied</option>
                        <option>Rented</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Zone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Zone
                    </label>
                    <div className="relative group">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <select
                        name="zone"
                        value={form.zone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ACTION BUTTON */}
              <motion.div variants={itemVariants} className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  <Save size={22} />
                  Save Property Record
                </button>
              </motion.div>

            </form>
          </div>

          {/* ================= RIGHT COLUMN: PREVIEW ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit">
            <motion.div 
              variants={itemVariants}
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <Calculator className="text-blue-400" /> 
                Tax Calculator
              </h3>

              <div className="space-y-4 relative z-10">
                {/* Line Items */}
                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-400">Built-up Area</span>
                  <span className="font-mono text-slate-200">{form.builtUpArea || 0} <span className="text-xs text-slate-500">sq ft</span></span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-400">Base Rate ({form.propertyType})</span>
                  <span className="font-mono text-slate-200">₹{taxPreview.baseRate}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-400">Zone Multiplier ({form.zone})</span>
                  <span className="font-mono text-emerald-400">× {taxPreview.zoneMultiplier}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-400">Usage Factor</span>
                  <span className="font-mono text-emerald-400">× {taxPreview.usageMultiplier}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-400">Age Adjustment</span>
                  <span className="font-mono text-emerald-400">× {taxPreview.ageFactor}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-8 pt-6 border-t border-slate-700 relative z-10">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Estimated Annual Tax</p>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 font-mono">
                  ₹{taxPreview.finalTax.toLocaleString()}
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <CheckCircle2 size={14} className="mt-0.5 text-blue-500" />
                  Calculated automatically based on 2024 municipal tax guidelines.
                </div>
              </div>

            </motion.div>

            {/* Helper Card */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30"
            >
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-sm">Need Help?</h4>
              <p className="text-sm text-blue-800/70 dark:text-blue-200/60 leading-relaxed mb-3">
                Ensure the built-up area matches your property deed. Incorrect zoning declarations may lead to penalties.
              </p>
              <a href="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
                View Tax Guidelines <ArrowRight size={12} />
              </a>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
