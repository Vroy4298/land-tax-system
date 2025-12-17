import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Printer
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

export default function PropertyDetails() {
  const { id } = useParams();          // ✅ MUST exist
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/properties/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Property not found");
        }

        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError("Invalid property ID");
      setLoading(false);
    }
  }, [id, navigate]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <Loader />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-20">
        <EmptyState
          title="Unable to load property"
          description={error}
          actionLabel="Back to Properties"
          onAction={() => navigate("/properties")}
        />
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      {/* Wrapper with top padding to clear fixed navbar */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">
        
        {/* Breadcrumb & Actions Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <Link 
            to="/properties" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group font-medium"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors shadow-sm">
              <ArrowLeft size={16} />
            </div>
            Back to Portfolio
          </Link>

          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Printer size={20} />
            </button>
            <Link
              to={`/properties/${property._id}/edit`}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Edit size={16} />
              Edit Property
            </Link>
          </div>
        </motion.div>

        {/* Content Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          
          {/* LEFT COLUMN: Main Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Card */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800">
                    <Building2 size={12} /> {property.propertyType}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {property.address.split(',')[0]} {/* Assuming first part is roughly a title */}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg flex items-center gap-2">
                    <MapPin size={18} className="shrink-0 text-slate-400" />
                    {property.address}
                  </p>
                </div>
                <div className="hidden sm:block h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                  {property.ownerName.charAt(0)}
                </div>
              </div>
            </motion.div>

            {/* Owner & Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Owner Info */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Owner Details</h3>
                </div>
                
                <div className="space-y-4">
                   <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">{property.ownerName}</p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                     <div>
                       <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                       <p className="text-base text-slate-700 dark:text-slate-300 break-all">{property.ownerEmail || "Not provided"}</p>
                     </div>
                     <div>
                       <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</span>
                       <p className="text-base text-slate-700 dark:text-slate-300 font-mono">{property.ownerPhone || "Not provided"}</p>
                     </div>
                   </div>
                </div>
              </motion.div>

              {/* Property Specs */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Specifications</h3>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <InfoItem label="Built-up Area" value={`${property.builtUpArea ?? "—"} sq ft`} icon={<Layers size={14} />} />
                  <InfoItem label="Zone" value={`Zone ${property.zone}`} icon={<MapPin size={14} />} />
                  <InfoItem label="Usage" value={property.usageType} icon={<Building2 size={14} />} />
                  <InfoItem label="Year" value={property.constructionYear || "N/A"} icon={<Calendar size={14} />} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: Financial Summary (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <motion.div 
              variants={itemVariants}
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase tracking-widest text-xs">
                  <Calculator size={14} /> Financial Summary
                </div>

                <div className="mb-8 text-center">
                  <span className="text-slate-400 text-sm font-medium">Estimated Annual Tax</span>
                  <div className="text-5xl font-bold mt-2 font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
                    ₹{property.finalTaxAmount?.toLocaleString("en-IN") ?? 0}
                  </div>
                </div>

                <div className="space-y-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-bold ${property.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                      {property.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Due Date</span>
                    <span className="text-slate-200">Mar 31, 2024</span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  {property.paymentStatus === 'paid' ? 'Download Receipt' : 'Pay Now'}
                </button>
              </div>
            </motion.div>

            {/* Helper Text */}
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated on {new Date().toLocaleDateString()}
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
    <div>
      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
        {icon} {label}
      </div>
      <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
        {value}
      </div>
    </div>
  );
}
