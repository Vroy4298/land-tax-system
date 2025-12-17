import { useState } from "react";
import { Link } from "react-router-dom";
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
      const res = await fetch(
        "http://localhost:5000/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      // ⚠️ Do NOT expose whether email exists
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center dark:text-white mb-2">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 
              bg-gray-50 dark:bg-slate-800 dark:text-white 
              focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
