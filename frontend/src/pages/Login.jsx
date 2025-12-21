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

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const expiry =
      localStorage.getItem("expiry") || sessionStorage.getItem("expiry");

    if (token && expiry && Date.now() < Number(expiry)) {
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
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errs = validateFields();
    if (Object.keys(errs).length > 0) {
      shakeCard();
      toast.error("Please fix highlighted fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
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
    /* 🔒 UI REMAINS EXACTLY SAME AS YOUR VERSION 🔒 */
    <div>{/* your existing JSX unchanged */}</div>
  );
}

export default Login;
