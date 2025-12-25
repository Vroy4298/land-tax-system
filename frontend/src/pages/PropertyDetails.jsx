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
  Share2,
  Printer,
  Mail,
  Phone,
  Copy,
  MessageSquare,
  CreditCard,
} from "lucide-react";

import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAuthToken } from "../utils/auth";
import { apiFetch } from "../utils/api";

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

  /* Share dropdown */
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef(null);

  /* ---------------- FETCH PROPERTY ---------------- */
  useEffect(() => {
    const fetchProperty = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await apiFetch(`/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Property not found");
        }

        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  /* Close share dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShowShare(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- SHARE ---------------- */
  const handleShare = (type) => {
    if (!property) return;
    const url = window.location.href;

    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Property Details:\n${url}`
        )}`,
        "_blank"
      );
    }

    if (type === "email") {
      window.location.href = `mailto:?subject=Property Details&body=${encodeURIComponent(
        `Check out this property:\n${url}`
      )}`;
    }

    if (type === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }

    setShowShare(false);
  };

  /* ---------------- PRINT ---------------- */
  const handlePrint = () => {
    if (!property?._id) return;

    window.open(
      `${import.meta.env.VITE_API_URL}/api/properties/${property._id}/receipt`,
      "_blank"
    );
  };

  /* ---------------- PAY NOW ---------------- */
  const handlePayNow = async () => {
    if (paying || !property?._id) return;

    setPaying(true);
    try {
      const token = getAuthToken();

      const res = await apiFetch(
        `/api/pay-tax/pay/${property._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Payment failed");
        return;
      }

      setProperty((prev) => ({
        ...prev,
        paymentStatus: "paid",
        paymentDate: data.paidOn,
        receiptId: data.receiptId,
      }));

      alert("Payment successful!");
    } catch (err) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between gap-6 mb-8"
        >
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>

          <div className="flex items-center gap-4" ref={shareRef}>
            <button onClick={() => setShowShare((s) => !s)}>
              <Share2 />
            </button>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bg-white p-2 rounded-xl shadow-xl"
                >
                  <button onClick={() => handleShare("whatsapp")}>
                    WhatsApp
                  </button>
                  <button onClick={() => handleShare("email")}>
                    Email
                  </button>
                  <button onClick={() => handleShare("copy")}>
                    Copy Link
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handlePrint}>
              <Printer />
            </button>

            <Link
              to={`/properties/${property._id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              <Edit size={16} /> Edit
            </Link>
          </div>
        </motion.div>

        {/* MAIN CONTENT */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8 space-y-6">
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl">
              <h1 className="text-3xl font-bold">
                {property.address?.split(",")[0] || "Property"}
              </h1>
              <p className="text-slate-500">{property.address}</p>
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <motion.div variants={itemVariants} className="bg-slate-900 text-white p-6 rounded-3xl">
              <p className="text-4xl font-bold">
                ₹{property.finalTaxAmount?.toLocaleString("en-IN")}
              </p>

              <button
                onClick={
                  property.paymentStatus === "paid"
                    ? handlePrint
                    : handlePayNow
                }
                disabled={paying}
                className="mt-6 w-full bg-blue-600 py-3 rounded-xl"
              >
                {property.paymentStatus === "paid"
                  ? "Download Receipt"
                  : "Pay Now"}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- HELPER ---------- */
function InfoItem({ label, value, icon }) {
  return (
    <div>
      <div className="text-xs text-slate-400 flex gap-1">
        {icon} {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
