
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  FileText, 
  Calendar, 
  CreditCard, 
  User, 
  MapPin, 
  Receipt,
  CheckCircle2
} from "lucide-react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08 } 
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setPayments([]);
        return;
      }

      // Filter only properties that are marked as paid
      const paid = data.filter((p) => p.paymentStatus === "paid");
      setPayments(paid);
    } catch (err) {
      console.error("Network error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (propertyId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `http://localhost:5000/api/properties/${propertyId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Failed to download receipt.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${propertyId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download error:", err);
      alert("Error downloading receipt.");
    }
  };

  const formatINR = (num) =>
    "₹" + Number(num || 0).toLocaleString("en-IN");

  /* =======================
     LOADING STATE
  ======================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
        <Loader />
      </div>
    );
  }

  /* =======================
     EMPTY STATE
  ======================= */
  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-20">
        <EmptyState
          title="No payments yet"
          description="Your paid receipts will appear here once you complete a tax transaction."
        />
      </div>
    );
  }

  /* =======================
     DATA STATE
  ======================= */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] font-sans transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs mb-3">
            <Receipt size={14} /> Financial Records
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Payment History
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            A secure record of all your completed land tax transactions and digital receipts.
          </p>
        </motion.div>

        {/* Financial Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/30">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Property Owner
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-8">
                    Transaction Date
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>

              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800"
              >
                {payments.map((p) => (
                  <motion.tr 
                    key={p._id} 
                    variants={rowVariants}
                    className="group hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors duration-200"
                  >
                    {/* Owner */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <User size={16} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {p.ownerName}
                        </span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                        <MapPin size={14} className="shrink-0 text-slate-400" />
                        <span className="truncate" title={p.address}>{p.address}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm">
                        {formatINR(p.finalTaxAmount)}
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 whitespace-nowrap pl-8">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(p.paymentDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => downloadReceipt(p._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white transition-all font-medium text-sm group/btn shadow-sm hover:shadow-md"
                      >
                        <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />
                        <span>PDF</span>
                        <Download size={14} className="opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
               <CreditCard size={14} />
               <span>Secured by Digital Land Registry</span>
             </div>
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
               Total Records: {payments.length}
             </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
