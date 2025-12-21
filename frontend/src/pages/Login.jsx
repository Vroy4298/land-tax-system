import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const cardRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------------- AUTO REDIRECT ---------------- */
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
    if (!turnstileToken) errs.turnstile = "Complete security verification";

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

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      shakeCard();
      toast.error(fieldErrors.turnstile || "Please fix highlighted fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            turnstileToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        shakeCard();
        toast.error(data.error || "Login failed");
        setTurnstileToken(null);
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#020617] overflow-hidden font-sans">
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          25%{transform:translateX(-5px)}
          75%{transform:translateX(5px)}
        }
        .shake-animation{animation:shake .2s ease-in-out 0s 2}
      `}</style>

      <div className="w-full h-screen flex flex-col lg:flex-row shadow-2xl">
        {/* LEFT SIDE — unchanged */}
        {/* ... YOUR LEFT PANEL CODE REMAINS EXACTLY SAME ... */}

        {/* RIGHT SIDE */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-16">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* EMAIL */}
              <div>
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* TURNSTILE (VISIBLE, SAFE) */}
              <Turnstile
                siteKey="0x4AAAAAACHZnqi3De6KSsC2"
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: "auto" }}
              />

              <button disabled={loading} type="submit">
                {loading ? "Verifying..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/register">Create an account</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
