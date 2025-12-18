
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Eye, EyeOff, Building2, CheckCircle2, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { token } = useParams();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Redirecting...");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        toast.error(data.error || "Reset failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
      `}</style>

      {/* Consistent Split Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[1100px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px] border border-white/20 dark:border-slate-800"
      >
        
        {/* LEFT SIDE: Info/Branding Panel (Shared visual identity) */}
        <div className="w-full lg:w-5/12 bg-slate-900 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-float"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float-delayed"></div>
          
          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-blue-400 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <Building2 size={24} />
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">Security Node</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 drop-shadow-sm">
              Secure Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-extrabold">
                Digital Identity
              </span>
            </h1>
          </div>

          {/* Core Messaging / Security Points */}
          <div className="relative z-10 space-y-6">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed opacity-90">
              Update your password to regain full access to your property records and tax management dashboard. We recommend using a unique and strong combination.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Strong Encryption", desc: "Military grade data protection", icon: <ShieldCheck size={18} /> },
                { title: "Identity Verified", desc: "Token-based secure authentication", icon: <CheckCircle2 size={18} /> }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="text-blue-500 mt-1 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="relative z-10 pt-8 mt-auto">
            <p className="text-xs text-slate-500 font-medium">© 2024 Land Tax Management System</p>
          </div>
        </div>

        {/* RIGHT SIDE: Reset Password Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header Content */}
            <div className="mb-10 text-center lg:text-left">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mx-auto lg:mx-0 shadow-sm border border-blue-100 dark:border-blue-800">
                <Lock size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Reset Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Create a new, strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* NEW PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <input
                    type={show ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      transition-all duration-300 ease-in-out outline-none
                      focus:scale-[1.01] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                      focus:border-blue-500 dark:focus:border-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      transition-all duration-300 ease-in-out outline-none
                      focus:scale-[1.01] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                      focus:border-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg mt-4
                  ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed shadow-none"
                      : "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-xl"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Set New Password <ArrowRight size={18} />
                  </span>
                )}
              </motion.button>
            </form>

            {/* SECURITY NOTICE */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <ShieldCheck className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" size={16} />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Avoid using passwords from other accounts. A strong password should be a unique mix of letters, numbers, and special symbols.
                </p>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
