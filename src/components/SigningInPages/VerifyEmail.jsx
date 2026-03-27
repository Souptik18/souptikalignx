import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { motion } from "framer-motion";

import { auth } from "../../firebase/config";
import { homeContext } from "../Layout/Layout";

const VERIFY_LATER_KEY = "allowUnverifiedAccess";

const VerifyEmail = () => {
  const { toast } = useContext(homeContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect logic on mount and when user changes
  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    // If already verified, go to home
    if (auth.currentUser.emailVerified) {
      navigate("/home");
      return;
    }
    // Listen for auth state changes (e.g., if user signs out)
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handler: reload & check verification
  const handleCheckVerified = useCallback(async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Clear any bypass flag once email is confirmed
        if (sessionStorage.getItem(VERIFY_LATER_KEY)) {
          sessionStorage.removeItem(VERIFY_LATER_KEY);
        }
        toast.success("Email verified! Redirecting...", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        // Redirect to home/dashboard
        setTimeout(() => navigate("/home"), 2000);
      } else {
        toast.info("Email not verified yet. Please check your inbox.", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } catch (err) {
      console.error("Error checking verification:", err);
      toast.error("Could not verify status. Try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  // Handler: resend verification email
  const handleResend = useCallback(async () => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email resent. Check your inbox.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } catch (err) {
      console.error("Resend verification error:", err);
      toast.error("Failed to resend. Try again later.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setResendLoading(false);
    }
  }, [navigate, toast]);

  const handleVerifyLater = useCallback(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    sessionStorage.setItem(VERIFY_LATER_KEY, "true");
    toast.info("You can verify later. Redirecting to dashboard...", {
      position: "top-right",
      autoClose: 2000,
      theme: "light",
    });
    navigate("/home");
  }, [navigate, toast]);

  const handleSignOut = useCallback(async () => {
    sessionStorage.removeItem(VERIFY_LATER_KEY);
    await auth.signOut();
    navigate("/login");
  }, [navigate]);

  return (
    <section className="relative min-h-screen bg-gray-900 flex items-center justify-center">
      {/* Optional background image or styling */}
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          Verify Your Email
        </h2>
        <p className="text-white mb-4">
          A verification link was sent to{" "}
          <span className="font-semibold">{user?.email}</span>. <br />
          Please check your inbox and click the link to verify your email.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleCheckVerified}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Checking..." : "I've Verified, Check Status"}
          </button>
          <button
            onClick={handleVerifyLater}
            disabled={loading || resendLoading}
            className="w-full py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Verify Later
          </button>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              resendLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {resendLoading ? "Resending..." : "Resend Verification Email"}
          </button>
          <button
            onClick={handleSignOut}
            disabled={loading || resendLoading}
            className="w-full py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
          >
            Cancel / Sign Out
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default VerifyEmail;
