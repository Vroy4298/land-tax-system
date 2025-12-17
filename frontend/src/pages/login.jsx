import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";


function Login() {
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const cardRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("token") || sessionStorage.getItem("token")) {
      window.location.href = "/dashboard";
    }
  }, []);

  const validateFields = () => {
    const errs = {};

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Invalid email format";

    if (!form.password.trim()) errs.password = "Password is required";

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
      toast.error("Please correct the highlighted fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

        if (form.remember) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("expiry", expiresAt);
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("expiry", expiresAt);
        }

        toast.success("Login successful! Redirecting...");
        setTimeout(() => (window.location.href = "/dashboard"), 1000);
      } else {
        if (data.error?.includes("Invalid")) {
          setErrors({
            email: "Invalid email or password",
            password: "Invalid email or password",
          });
          shakeCard();
        }
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const shakeCard = () => {
    if (!cardRef.current) return;
    cardRef.current.classList.add("shake");
    setTimeout(() => cardRef.current.classList.remove("shake"), 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans">
      {/* Main Split Card Container */}
      <div 
        ref={cardRef}
        className="w-full max-w-[1100px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px] border border-white/20 dark:border-slate-800"
      >
        
        {/* LEFT SIDE: Info/Branding Panel */}
        <div className="w-full lg:w-5/12 bg-slate-900 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 to-transparent pointer-events-none"></div>

          {/* Header / Logo Area */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-blue-400 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                <Building2 size={24} />
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">Official Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Land Tax <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Management System
              </span>
            </h1>
          </div>

          {/* Description Content */}
          <div className="relative z-10 space-y-6">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed opacity-90">
              The Land Tax Management System is a modern web application designed to help users manage property records and land tax payments efficiently.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Manage property records & payments",
                "Automated tax calculations",
                "Secure digital tax receipts"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Copyright */}
          <div className="relative z-10 pt-8 mt-auto">
            <p className="text-xs text-slate-500">© 2024 Land Tax Management. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back!
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Please enter your details below to sign in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 
                    text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                    transition-all duration-300 ease-in-out outline-none
                    focus:scale-[1.01] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                    ${
                      errors.email
                        ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
                    }`}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>

                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 
                      text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                      transition-all duration-300 ease-in-out outline-none
                      focus:scale-[1.01] focus:shadow-lg focus:bg-white dark:focus:bg-slate-950
                      ${
                        errors.password
                          ? "border-red-500 ring-2 ring-red-500/10 focus:border-red-500"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
                      }`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                    onClick={() => setShowPassword((s) => !s)}
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

              {/* REMEMBER ME */}
              <div className="flex items-center gap-3 ml-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={form.remember}
                    onChange={(e) =>
                      setForm({ ...form, remember: e.target.checked })
                    }
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-blue-600 checked:bg-blue-600 transition-all"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 ease-in-out shadow-lg transform active:scale-[0.99]
                  ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed shadow-none"
                      : "bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 shadow-slate-900/20 dark:shadow-blue-600/20"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="font-bold text-slate-900 dark:text-blue-400 hover:underline decoration-2 underline-offset-4"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
