import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
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

  /* ---------------- REDIRECT IF LOGGED IN ---------------- */
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const expiry =
      localStorage.getItem("expiry") || sessionStorage.getItem("expiry");

    if (token && expiry && Date.now() < Number(expiry)) {
      window.location.href = "/dashboard";
    }
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateFields = () => {
    const errs = {};

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Invalid email format";

    if (!form.password.trim()) errs.password = "Password is required";

    if (!cfToken)
      errs.turnstile = "Please complete the security verification";

    setErrors(errs);
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  /* ---------------- SUBMIT ---------------- */
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  if (!cfToken) {
    toast.error("Please complete the security verification");
    shakeCard();
    return;
  }

  const fieldErrors = validateFields();
  if (Object.keys(fieldErrors).length > 0) {
    shakeCard();
    toast.error("Please correct the highlighted fields");
    return;
  }

  setLoading(true);

  // try {
  //   const response = await fetch("http://localhost:5000/api/users/login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       ...form,
  //       turnstileToken: cfToken, // ✅ correct
  //     }),
  //   });
    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...form,
    turnstileToken: cfToken,
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

      toast.success("Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } else {
      setErrors({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
      shakeCard();
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans">
      <div
        ref={cardRef}
        className="w-full max-w-[1100px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[680px] border border-white/20 dark:border-slate-800"
      >
        {/* LEFT PANEL */}
        <div className="w-full lg:w-5/12 bg-slate-900 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-blue-400 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Building2 size={24} />
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">
                Secure Portal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Land Tax <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Management System
              </span>
            </h1>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={18} className="text-blue-500" />
                Encrypted & Verified Access
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <CheckCircle2 size={18} className="text-blue-500" />
                Government-grade Security
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              Member Login
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Enter your credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-5 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
  >
    Forgot password?
  </Link>
</div>


              {/* TURNSTILE */}
              <Turnstile
  siteKey="0x4AAAAAACHasW3p9gffkrPj"
  onSuccess={(token) => {
    setCfToken(token);
    setErrors((prev) => ({ ...prev, turnstile: undefined }));
  }}
  onError={() => setCfToken(null)}
  options={{ theme: "auto" }}
/>


              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-slate-500 dark:text-slate-400">
              New user?{" "}
              <Link to="/register" className="font-bold text-blue-500">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
