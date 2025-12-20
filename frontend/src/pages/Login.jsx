
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Lock,
  Mail
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useToast } from "../context/ToastContext";

function Login() {
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [cfToken, setCfToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const cardRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("token") || sessionStorage.getItem("token")) {
      window.location.href = "/dashboard";
    }
  }, []);

  const validateFields = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email format";

    if (!form.password.trim()) errs.password = "Password is required";
    
    if (!cfToken) errs.turnstile = "Please complete security verification";

    setErrors(errs);
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      shakeCard();
      if (fieldErrors.turnstile) {
        toast.error(fieldErrors.turnstile);
      } else {
        toast.error("Please fill in all required fields");
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          cfToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const expiresAt = Date.now() + 2 * 60 * 60 * 1000;

        if (form.remember) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("expiry", expiresAt);
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("expiry", expiresAt);
        }

        toast.success("Welcome back! Redirecting...");
        setTimeout(() => (window.location.href = "/dashboard"), 1000);
      } else {
        shakeCard();
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shakeCard = () => {
    if (!cardRef.current) return;
    cardRef.current.classList.add("shake-animation");
    setTimeout(() => cardRef.current.classList.remove("shake-animation"), 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#020617] p-0 transition-colors duration-500 overflow-hidden font-sans selection:bg-blue-500/30">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>

      {/* Main Container: Split View */}
      <div className="w-full h-screen flex flex-col lg:flex-row shadow-2xl overflow-hidden relative">
        
        {/* ================= LEFT SIDE: BRANDING & VISION ================= */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] dark:bg-slate-950 relative flex-col justify-between p-16 text-white overflow-hidden">
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Building2 size={28} className="text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                LandTax <span className="text-blue-500">System</span>
              </span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Modernizing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Digital Land Records
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Access the next generation of property tax management. Secure, efficient, and built for transparency.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 grid grid-cols-1 gap-6"
          >
            {[
              { icon: <ShieldCheck className="text-blue-400" />, title: "Enterprise Security", desc: "Bank-grade encryption for all your records." },
              { icon: <CheckCircle2 className="text-emerald-400" />, title: "Automated Valuation", desc: "AI-driven tax assessment based on current zoning." },
              { icon: <CheckCircle2 className="text-emerald-400" />, title: "Instant Receipts", desc: "Download verified digital receipts immediately." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10 transition-colors group-hover:bg-white/10">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium tracking-widest uppercase">
            <span>Official Government Portal</span>
            <span>v3.4.0</span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTH FORM ================= */}
        <div className="flex-1 flex flex-col justify-center bg-white dark:bg-[#020617] p-8 sm:p-16 lg:p-24 transition-colors relative">
          
          {/* Subtle decoration for mobile/light mode */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[120px] pointer-events-none lg:hidden"></div>

          <motion.div 
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-auto relative z-10"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Member Login
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Enter your secure credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@agency.gov"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 outline-none
                      ${errors.email 
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5'
                      } text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium`}
                  />
                </div>
                {errors.email && <span className="text-xs font-bold text-red-500 ml-1">{errors.email}</span>}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border transition-all duration-300 outline-none
                      ${errors.password 
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5'
                      } text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs font-bold text-red-500 ml-1">{errors.password}</span>}
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center gap-3 py-1 ml-1">
                <label className="relative flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
                  <span className="ml-3 text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    Stay logged in
                  </span>
                </label>
              </div>

              {/* Security Verification */}
              <div className="flex justify-center lg:justify-start pt-2">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                  <Turnstile
                    siteKey="0x4AAAAAACHZnqi3De6KSsC2"
                    onSuccess={(token) => {
                      setCfToken(token);
                      setErrors((prev) => ({ ...prev, turnstile: undefined }));
                    }}
                    onError={() => setCfToken(null)}
                    options={{ theme: "auto" }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="submit"
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                  ${loading 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 active:shadow-inner'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                New to the system?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
          
          {/* Mobile Footer Branding */}
          <div className="mt-auto pt-10 text-center lg:hidden">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Secured by Digital Land Registry Services
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
