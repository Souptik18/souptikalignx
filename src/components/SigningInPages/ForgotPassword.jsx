import React, { useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/config";
import { homeContext } from "../Layout/Layout";
import { Bounce } from "react-toastify";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion";
import heropic2 from "../../Images/heropic2.png";
const ForgotPassword = () => {
  const { toast } = useContext(homeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Map common Firebase errors to friendly messages
  const mapError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/too-many-requests":
        return "Too many requests. Try again later.";
      default:
        return "Unable to send reset email. Please try again.";
    }
  };

  const handleReset = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        toast.error("Email is required.", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          transition: Bounce,
        });
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        toast.success("Reset link sent. Check your email.", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        const msg = mapError(error.code);
        toast.error(msg, {
          position: "top-right",
          autoClose: 4000,
          theme: "dark",
          transition: Bounce,
        });
        console.log("Reset password error:", error.code, error.message);
      } finally {
        setLoading(false);
      }
    },
    [email, navigate, toast]
  );

  return (
    <section
      style={{
        backgroundImage: `url(${heropic2})`,
      }}
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg"
      >
        <h2 className="text-center text-2xl font-bold text-white mb-4">
          Reset Password
        </h2>
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-white mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-transparent border border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <p className="mt-4 text-center text-white text-sm">
          <button
            onClick={() => navigate("/login")}
            className="underline hover:text-green-300"
            disabled={loading}
          >
            Back to Sign In
          </button>
        </p>
      </motion.div>
    </section>
  );
};

export default ForgotPassword;
