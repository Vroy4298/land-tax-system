
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Building2, CheckCircle2, KeyRound } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // always success toast
    toast.success(
      "If this email is registered, a password reset link has been sent."
    );

      setEmail("");
    } catch (err) {
      toast.error("Network error. Please try again.");
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

      {/* Main Split Card Container - Consistent with Login/Register */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[1100px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-white/20 dark:border-slate-800"
      >
        
        {/* LEFT SIDE: Info/Branding Panel (Shared visual identity) */}
        <div className="w-full lg:w-5/12 bg-slate-900 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-float"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float-delayed"></div>
          
          {/* Header / Logo Area */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-blue-400 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                <Building2 size={24} />
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">Secure Reset</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Recover Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Portal Access
              </span>
            </h1>
          </div>

          {/* Context Content - Reassurance for the user */}
          <div className="relative z-10 space-y-6">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed opacity-90">
              For security reasons, we use a verification link to confirm your identity. Please ensure you use the email associated with your account.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Encrypted reset process",
                "24-hour link validity",
                "Strict identity verification"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="relative z-10 pt-8 mt-auto">
            <p className="text-xs text-slate-500 font-medium">Verified Security Standards</p>
          </div>
        </div>

        {/* RIGHT SIDE: Reset Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="mb-10 text-center lg:text-left">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mx-auto lg:mx-0">
                <KeyRound size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Forgot Password?
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                No worries, it happens! Enter your email and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* EMAIL INPUT */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      transition-all duration-300 ease-in-out outline-none
                      focus:scale-[1.01] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                      focus:border-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                  ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed shadow-none"
                      : "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-xl"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Sending Request...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </form>

            {/* NAVIGATION LINKS */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
