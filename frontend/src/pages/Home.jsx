import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAuthToken } from "../utils/auth";
import { Navigate } from "react-router-dom";

import {
  Building2,
  Calculator,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Lock,
  Zap,
  Menu
} from "lucide-react";
import heroImg from "../assets/hero.svg";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const pathDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" },
      opacity: { duration: 0.5 }
    }
  }
};

const navbarVariant = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: "circOut" }
  }
};
const token = getAuthToken();

export default function Home() {
   const token = getAuthToken();

  // 🔐 If user already logged in → go to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      {/* ================= NAVBAR ================= */}
      <motion.nav 
        variants={navbarVariant}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                <Building2 className="text-blue-500" size={24} />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
              LandTax
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <a 
                key={item} 
                href="#"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group py-2"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] px-4 py-2 rounded-lg"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className="group relative px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative">Get Started</span>
            </Link>
            <button className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-48 px-6 overflow-hidden">
        
        {/* Ambient Background Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* LEFT: TEXT CONTENT */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Next Gen Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-slate-500">
              Online Property Records <br />
              and <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Land Tax Management</span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Navigate the complexities of property taxes with an intelligent, 
              automated system designed for the modern era. Secure, fast, and completely digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link
                to="/login"
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </span>
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
              </Link>
              
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-lg backdrop-blur-md transition-all flex items-center justify-center hover:text-white"
              >
                View Live Demo
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: HERO VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 w-full max-w-lg mx-auto bg-slate-900/80 border border-slate-700 p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
              <img
                src={heroImg}
                alt="Dashboard UI"
                className="w-full rounded-xl shadow-inner bg-slate-950/50"
              />
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3"
              >
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Security Level</p>
                  <p className="font-bold text-white">Bank Grade</p>
                </div>
              </motion.div>
            </div>
            
            {/* Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 blur-[100px] -z-10"></div>
          </motion.div>
        </div>
      </section>


      {/* ================= SNAKE SCROLL SECTION ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative">
          
          <div className="text-center mb-32">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              How the System <span className="text-blue-500">Works</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Follow the digital path to simplify your land tax management journey.
            </p>
          </div>

          {/* --- STEP 1: LEFT --- */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-0 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
              className="order-2 md:order-1 relative z-10"
            >
              <FeatureCard 
                number="01" 
                title="Account Creation" 
                desc="Register securely using your email. We verify every user to ensure the integrity of the land record system."
                icon={<Lock size={32} />}
              />
            </motion.div>
            <div className="order-1 md:order-2 hidden md:flex justify-center items-center">
              <div className="w-64 h-64 bg-blue-900/20 rounded-full blur-3xl absolute"></div>
            </div>
          </div>

          {/* CONNECTOR 1 (Left to Right) */}
          <div className="hidden md:block h-32 w-full relative -my-4 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path 
                d="M 25% 0 C 25% 50, 75% 50, 75% 100" 
                fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 8"
                variants={pathDraw} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
              />
            </svg>
          </div>

          {/* --- STEP 2: RIGHT --- */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-0 items-center">
            <div className="hidden md:flex justify-center items-center relative">
               <div className="w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl absolute"></div>
            </div>
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
              className="relative z-10"
            >
              <FeatureCard 
                number="02" 
                title="Property Integration" 
                desc="Add your land details. Our system integrates with geolocation data to visualize your plots instantly."
                icon={<Globe size={32} />}
                align="right"
              />
            </motion.div>
          </div>

          {/* CONNECTOR 2 (Right to Left) */}
          <div className="hidden md:block h-32 w-full relative -my-4 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path 
                d="M 75% 0 C 75% 50, 25% 50, 25% 100" 
                fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 8"
                variants={pathDraw} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
              />
            </svg>
          </div>

          {/* --- STEP 3: LEFT --- */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-0 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
              className="order-2 md:order-1 relative z-10"
            >
              <FeatureCard 
                number="03" 
                title="AI Tax Calculation" 
                desc="Our algorithms automatically calculate your tax liability based on zoning, area, and current market rates."
                icon={<Calculator size={32} />}
              />
            </motion.div>
            <div className="order-1 md:order-2"></div>
          </div>

          {/* CONNECTOR 3 (Left to Right) */}
          <div className="hidden md:block h-32 w-full relative -my-4 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path 
                d="M 25% 0 C 25% 50, 75% 50, 75% 100" 
                fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 8"
                variants={pathDraw} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
              />
            </svg>
          </div>

           {/* --- STEP 4: RIGHT --- */}
           <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-0 items-center">
            <div className="hidden md:flex justify-center items-center relative"></div>
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
              className="relative z-10"
            >
              <FeatureCard 
                number="04" 
                title="Secure Payment" 
                desc="Pay directly through the portal using encrypted gateways. We support all major cards and net banking."
                icon={<Zap size={32} />}
                align="right"
              />
            </motion.div>
          </div>

          {/* CONNECTOR 4 (Right to Left) */}
          <div className="hidden md:block h-32 w-full relative -my-4 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path 
                d="M 75% 0 C 75% 50, 25% 50, 25% 100" 
                fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 8"
                variants={pathDraw} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
              />
            </svg>
          </div>

           {/* --- STEP 5: LEFT --- */}
           <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-0 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
              className="order-2 md:order-1 relative z-10"
            >
              <FeatureCard 
                number="05" 
                title="Digital Records" 
                desc="Instantly receive a digitally signed receipt. Your payment history is stored permanently on the cloud."
                icon={<Database size={32} />}
              />
            </motion.div>
            <div className="order-1 md:order-2"></div>
          </div>

          {/* Final Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none"></div>

        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-12 rounded-3xl shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Digitalize?</h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join thousands of property owners who have switched to the smart way of managing land tax.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Create Free Account <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#020617] border-t border-slate-800 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Building2 size={20} />
            </div>
            <span className="font-bold text-lg text-white">LandTax</span>
          </div>
          
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LandTax System. All rights reserved.
          </p>

          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-blue-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENT: FEATURE CARD ================= */
function FeatureCard({ number, title, desc, icon, align = "left" }) {
  const isRight = align === "right";
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl ${isRight ? 'ml-auto' : 'mr-auto'} max-w-lg`}
    >
      {/* Glowing Number */}
      <div className={`absolute -top-6 ${isRight ? '-right-6' : '-left-6'} w-14 h-14 bg-slate-950 rounded-2xl border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
        <span className="font-mono font-bold text-blue-400 text-xl">{number}</span>
      </div>

      <div className="flex items-start gap-5">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 border border-blue-500/20">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            {desc}
          </p>
        </div>
      </div>
      
      {/* Card Decoration */}
      <div className="absolute bottom-0 right-0 p-6 opacity-5 pointer-events-none">
        {icon}
      </div>
    </motion.div>
  );
}
