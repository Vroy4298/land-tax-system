
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Building2, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Zap
} from "lucide-react";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const cardRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    setForm({ ...form, [ev.target.name]: ev.target.value });
    setErrors({ ...errors, [ev.target.name]: undefined });
  };

  const shakeCard = () => {
    if (!cardRef.current) return;
    cardRef.current.classList.add("shake-animation");
    setTimeout(() => cardRef.current.classList.remove("shake-animation"), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) {
      shakeCard();
      setMsg({ text: "Please fix the highlighted fields", type: "error" });
      return;
    }

    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        shakeCard();
        if (data.error?.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: data.error }));
        }
        setMsg({ text: data.error || "Registration failed", type: "error" });
        return;
      }

      setMsg({ text: "Registration successful! Redirecting...", type: "success" });
      setForm({ name: "", email: "", password: "" });
      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch {
      setMsg({ text: "Network error — please try again", type: "error" });
    } finally {
      setLoading(false);
    }
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
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Property Owners</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium opacity-80 leading-relaxed max-w-md">
              Join the official digital registry and manage your land taxes with absolute transparency.
            </p>
          </motion.div>

          <div className="relative z-10 space-y-6">
            {[
              { icon: <Zap className="text-blue-400" />, title: "Instant Access", desc: "Access records immediately." },
              { icon: <ShieldCheck className="text-emerald-400" />, title: "Verified Identity", desc: "Bank-grade registration." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">{item.icon}</div>
                <div><h4 className="font-semibold text-slate-100">{item.title}</h4><p className="text-xs text-slate-500 font-normal">{item.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
            © 2025 Digital Land Registry Services
          </div>
        </div>

        {/* RIGHT SIDE: REGISTER FORM */}
        <div className="flex-1 flex flex-col justify-center bg-white dark:bg-[#020617] p-8 sm:p-16 lg:p-24 transition-colors relative">
          <motion.div ref={cardRef} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto z-10">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Create Account</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Register for seamless tax management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none font-medium
                      ${errors.name 
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                      } text-slate-900 dark:text-white`}
                  />
                </div>
                {errors.name && <span className="text-xs font-semibold text-red-500 ml-1">{errors.name}</span>}
              </div>

              <div className="space-y-1">
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

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs font-semibold text-red-500 ml-1">{errors.password}</span>}
              </div>

              <AnimatePresence>
                {msg.text && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl text-xs font-bold text-center border ${msg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400" : "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400"}`}>
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading} type="submit"
                className={`w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'}`}
              >
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
              </motion.button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4 transition-all">Sign In</Link></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;
