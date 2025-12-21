
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
import { useToast } from "../context/ToastContext";

function Login() {
  const toast = useToast();
  const cardRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------------- AUTO REDIRECT ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const expiry = localStorage.getItem("expiry") || sessionStorage.getItem("expiry");
    if (token && expiry && Date.now() < Number(expiry)) {
      window.location.href = "/dashboard";
    }
  }, []);

  const validateFields = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password.trim()) errs.password = "Password is required";
    setErrors(errs);
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      shakeCard();
      toast.error("Please correct the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        shakeCard();
        toast.error(data.error || "Login failed");
        return;
      }

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
    } catch {
      toast.error("Network error. Try again later.");
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
        .shake-animation { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      <div className="w-full h-screen flex flex-col lg:flex-row shadow-2xl overflow-hidden relative">
        {/* LEFT SIDE: BRANDING */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] dark:bg-slate-950 relative flex-col justify-between p-16 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight">LandTax <span className="text-blue-500 font-bold">Portal</span></span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Modernizing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Digital Land Records</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium opacity-80 leading-relaxed max-w-md">
              Secure, efficient, and transparent tax management built for the digital age.
            </p>
          </motion.div>

          <div className="relative z-10 space-y-6">
            {[
              { icon: <ShieldCheck className="text-blue-400" />, title: "Secure Access", desc: "Encryption for all records." },
              { icon: <CheckCircle2 className="text-emerald-400" />, title: "Instant Verification", desc: "Real-time municipal checks." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">{item.icon}</div>
                <div><h4 className="font-semibold text-slate-100">{item.title}</h4><p className="text-xs text-slate-500 font-normal">{item.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex justify-between text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
            <span>Official Government Node</span>
            <span>v3.4.0</span>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex-1 flex flex-col justify-center bg-white dark:bg-[#020617] p-8 sm:p-16 lg:p-24 transition-colors">
          <motion.div ref={cardRef} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Member Login</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your secure credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@agency.gov"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none font-medium
                      ${errors.email 
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      } text-slate-900 dark:text-white`}
                  />
                </div>
                {errors.email && <span className="text-xs font-semibold text-red-500 ml-1">{errors.email}</span>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border transition-all duration-300 outline-none font-medium
                      ${errors.password 
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      } text-slate-900 dark:text-white`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs font-semibold text-red-500 ml-1">{errors.password}</span>}
              </div>

              <div className="flex items-center gap-3 py-1 ml-1">
                <label className="relative flex items-center cursor-pointer group">
                  <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="sr-only peer" />
                  <div className="w-5 h-5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Stay logged in</span>
                </label>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading} type="submit"
                className={`w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'}`}
              >
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
              </motion.button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">New to the system? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4 transition-all">Create an account</Link></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
