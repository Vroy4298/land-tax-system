
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Calculator,
  Calendar,
  Layers,
  FileText,
  Edit,
  CheckCircle2,
  Share2,
  Printer,
  Mail,
  Phone,
  Copy,
  MessageSquare,
  CreditCard
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";

/* ---------------- ANIMATIONS ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  /* 🔹 Share dropdown */
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef(null);

  /* ---------------- FETCH PROPERTY ---------------- */
  useEffect(() => {
    const fetchProperty = async () => {
      const token = getAuthToken();
      if (!token) return navigate("/login");

      try {
        const res = await fetch(
          `http://localhost:5000/api/properties/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Property not found");

        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  /* 🔹 Close share dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- SHARE HANDLER ---------------- */
  const handleShare = (type) => {
    const url = window.location.href;

    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          "Property Details for " + property.address + ":\n" + url
        )}`,
        "_blank"
      );
    }

    if (type === "email") {
      window.location.href = `mailto:?subject=Property Details&body=${encodeURIComponent(
        "Check out these property details: " + url
      )}`;
    }

    if (type === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }

    setShowShare(false);
  };

  /* ---------------- PRINT HANDLER ---------------- */
  const handlePrint = () => {
    window.open(
      `http://localhost:5000/api/properties/${property._id}/receipt`,
      "_blank"
    );
  };

  /* ---------------- PAY NOW ---------------- */
  const handlePayNow = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const token = getAuthToken();

      const res = await fetch(
        `http://localhost:5000/api/pay-tax/pay/${property._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      // Update UI instantly
      setProperty((prev) => ({
        ...prev,
        paymentStatus: "paid",
        paymentDate: data.paidOn,
        receiptId: data.receiptId,
      }));
      alert("Payment successful!");
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
        <Loader />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1220] pt-24">
        <EmptyState
          title="Unable to load property"
          description={error}
          actionLabel="Back to Properties"
          onAction={() => navigate("/properties")}
        />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
        >
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium group transition-colors"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-200 transition-all">
              <ArrowLeft size={16} />
            </div>
            Back to Portfolio
          </Link>

          {/* ACTIONS CONTAINER */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 relative" ref={shareRef}>
              <button
                onClick={() => setShowShare((s) => !s)}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="Share Property"
              >
                <Share2 size={20} />
              </button>

              <AnimatePresence>
                {showShare && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 min-w-[180px]"
                  >
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <MessageSquare size={16} className="text-emerald-500" /> WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare("email")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Mail size={16} className="text-blue-500" /> Email
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Copy size={16} className="text-slate-500" /> Copy Link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handlePrint}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="Print Receipt"
              >
                <Printer size={20} />
              </button>
            </div>

            <Link
              to={`/properties/${property._id}/edit`}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Edit size={18} />
              <span>Edit Property</span>
            </Link>
          </div>
        </motion.div>

        {/* CONTENT GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">

            {/* HEADER CARD */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800">
                    <Building2 size={12} /> {property.propertyType}
                  </div>

                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {property.address.split(",")[0]}
                  </h1>

                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg flex items-center gap-2 leading-relaxed">
                    <MapPin size={18} className="shrink-0 text-slate-400" /> {property.address}
                  </p>
                </div>
                
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/30 shrink-0">
                  {property.ownerName?.charAt(0)}
                </div>
              </div>
            </motion.div>

            {/* OWNER + SPECS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* OWNER CARD */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Owner Details</h3>
                </div>
                
                <div className="space-y-6">
                  <InfoItem label="Full Name" value={property.ownerName} icon={<User size={14} />} />
                  <InfoItem label="Email" value={property.ownerEmail || "Not provided"} icon={<Mail size={14} />} />
                  <InfoItem label="Phone" value={property.ownerPhone || "Not provided"} icon={<Phone size={14} />} />
                </div>
              </motion.div>

              {/* SPECS CARD */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <FileText size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Specifications</h3>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <InfoItem label="Area" value={`${property.builtUpArea} sq ft`} icon={<Layers size={14} />} />
                  <InfoItem label="Zone" value={`Zone ${property.zone}`} icon={<MapPin size={14} />} />
                  <InfoItem label="Usage" value={property.usageType} icon={<Building2 size={14} />} />
                  <InfoItem label="Year" value={property.constructionYear || "N/A"} icon={<Calendar size={14} />} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: TAX SUMMARY */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <motion.div 
              variants={itemVariants} 
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/40 border border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase tracking-widest text-xs">
                  <Calculator size={14} /> Financial Summary
                </div>

                <div className="text-center mb-8">
                  <span className="text-slate-400 text-sm font-medium">Estimated Annual Tax</span>
                  <div className="text-5xl font-bold mt-2 font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
                    ₹{property.finalTaxAmount?.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="space-y-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      property.paymentStatus === "paid" 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${property.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      {property.paymentStatus.charAt(0).toUpperCase() + property.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Billing Cycle</span>
                    <span className="text-slate-200 font-medium">2024 - 2025</span>
                  </div>
                </div>

                <button 
                  onClick={property.paymentStatus === 'paid' ? handlePrint : handlePayNow}
                  disabled={paying}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : property.paymentStatus === "paid" ? (
                    <>
                      <Printer size={18} />
                      Download Receipt
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay Now
                    </>
                  )}
                </button>
                
                {property.paymentStatus === 'paid' && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    Payment successfully processed on {new Date(property.paymentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Helper Help Card */}
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[250px] mx-auto">
                Need to dispute this valuation? Contact your local municipal office with property ID: <span className="font-mono text-blue-500">#{property._id.slice(-6).toUpperCase()}</span>
              </p>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

/* ---------- HELPER COMPONENT ---------- */
function InfoItem({ label, value, icon }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <span className="opacity-70">{icon}</span> {label}
      </div>
      <div className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug break-words">
        {value}
      </div>
    </div>
  );
}
