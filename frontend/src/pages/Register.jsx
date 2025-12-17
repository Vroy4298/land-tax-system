import { useState } from "react";
import { Eye, EyeOff, Building2, CheckCircle2 } from "lucide-react";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------
  // CLIENT SIDE VALIDATION
  // ---------------------------
  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Please enter a valid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    setForm({ ...form, [ev.target.name]: ev.target.value });
    setErrors({ ...errors, [ev.target.name]: undefined });
  };

  // ---------------------------
  // SUBMIT
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // ⛔ Validate before submit
    if (!validate()) {
      setMsg({ text: "Please fix the highlighted fields", type: "error" });
      return;
    }

    setLoading(true);
    setMsg({ text: "Registering...", type: "" });

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // SERVER ERRORS → map to field
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: data.error }));
        }

        setMsg({ text: data.error || "Registration failed", type: "error" });
        return;
      }

      // SUCCESS
      setMsg({
        text: "🎉 Registration successful! Redirecting to login...",
        type: "success",
      });

      setForm({ name: "", email: "", password: "" });

      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch {
      setMsg({ text: "Network error — please try again", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(20px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-fade-in { opacity: 0; animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Main Split Card Container */}
      <div className="w-full max-w-[1100px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px] border border-white/20 dark:border-slate-800 animate-fade-in">
        
        {/* LEFT SIDE: Info/Branding Panel (Consistent with Login) */}
        <div className="w-full lg:w-5/12 bg-slate-900 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
          {/* Abstract Background Shapes - Animated */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-float"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 to-transparent pointer-events-none"></div>

          {/* Header / Logo Area */}
          <div className="relative z-10 animate-fade-in delay-100">
            <div className="flex items-center gap-3 text-blue-400 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <Building2 size={24} />
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">Official Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 drop-shadow-sm">
              Land Tax <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Management System
              </span>
            </h1>
          </div>

          {/* Description Content */}
          <div className="relative z-10 space-y-6 animate-fade-in delay-200">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed opacity-90">
              Join thousands of property owners managing their land tax records efficiently and securely.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Instant account creation",
                "Secure digital records",
                "24/7 Access to payments"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-slate-400 group">
                  <CheckCircle2 size={16} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-slate-300 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Copyright */}
          <div className="relative z-10 pt-8 mt-auto animate-fade-in delay-300">
            <p className="text-xs text-slate-500">© 2024 Land Tax Management. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center lg:text-left animate-fade-in delay-200">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Account
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your details to get started with the portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* NAME */}
              <div className="space-y-1.5 animate-fade-in delay-300">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 
                    text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                    transition-all duration-300 ease-in-out outline-none
                    focus:scale-[1.02] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                    ${
                      errors.name
                        ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5 animate-fade-in delay-400">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 
                    text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                    transition-all duration-300 ease-in-out outline-none
                    focus:scale-[1.02] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                    ${
                      errors.email
                        ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5 animate-fade-in delay-500">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password (min 6 chars)"
                    className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      transition-all duration-300 ease-in-out outline-none
                      focus:scale-[1.02] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                      ${
                        errors.password
                          ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform hover:scale-110 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* GLOBAL MESSAGE */}
              {msg.text && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 ${
                  msg.type === "success" 
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" 
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}>
                  {msg.text}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="animate-fade-in delay-500">
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 ease-in-out shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
                    ${
                      loading
                        ? "bg-slate-400 cursor-not-allowed shadow-none"
                        : "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-xl"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

            </form>

            {/* LOGIN LINK */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center animate-fade-in delay-500">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-bold text-slate-900 dark:text-blue-400 hover:underline decoration-2 underline-offset-4 transition-colors hover:text-blue-600"
                >
                  Sign In
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;
