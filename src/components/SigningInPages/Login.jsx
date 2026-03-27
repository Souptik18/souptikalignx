// src/components/Public/Login.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase/config";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import heropic2 from "../../Images/heropic2.png";

// 🎯 Background Images
const backgroundImages = [
  heropic2,
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2070&q=80",
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [bgIndex, setBgIndex] = useState(0);

  const navigate = useNavigate();

  // 🔄 Sync background & indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const mapError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const handleSignIn = useCallback(async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/home");
    } catch (err) {
      setErrorMsg(mapError(err.code));
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const handleGoogleSignIn = useCallback(async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      if (
        [
          "auth/popup-blocked",
          "auth/operation-not-supported-in-this-environment",
          "auth/cancelled-popup-request",
        ].includes(err.code)
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirErr) {
          setErrorMsg(mapError(redirErr.code));
        }
      } else {
        setErrorMsg(mapError(err.code));
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) navigate("/home");
      })
      .catch((err) => setErrorMsg(mapError(err.code)))
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!window.google || auth.currentUser || window._oneTapInitialized) return;
    window._oneTapInitialized = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setLoading(true);
        try {
          const { signInWithCredential, GoogleAuthProvider } = await import(
            "firebase/auth"
          );
          const credential = GoogleAuthProvider.credential(response.credential);
          await signInWithCredential(auth, credential);
          navigate("/home");
        } catch {
          setErrorMsg("Google One Tap failed. Try again.");
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password)
      return setErrorMsg("Email and password are required.");
    handleSignIn();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 🔁 Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImages[bgIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9)",
          }}
        ></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImages[bgIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.9)",
            }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* ✅ Background Indicators */}
      <div className="absolute bottom-8 left-8 z-20 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 rounded-full transition-all duration-500 ${
              index === bgIndex ? "bg-white w-8" : "bg-white/30 w-4"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: index === bgIndex ? 1 : 0.8 }}
          />
        ))}
      </div>

      {/* ✅ Logo */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-8 left-8 z-20"
      >
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          ALIGN <span className="text-green-400">X</span>
        </h1>
      </motion.div>

      {/* ✅ Login Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-center min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* ✅ Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block text-white space-y-6"
          >
            <h2 className="text-5xl font-bold leading-tight">
              Transform Your
              <br />
              <span className="text-green-400">Fitness Journey</span>
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of fitness enthusiasts on their path to a
              healthier, stronger lifestyle.
            </p>
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Personalized Workouts
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Nutrition Tracking
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Progress Analytics
              </span>
            </div>
          </motion.div>

          {/* ✅ Right - Form (No Transition) */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h3>
                <p className="text-gray-300">
                  Don't have an account?{" "}
                  <NavLink
                    to="/register"
                    className="text-green-400 font-semibold hover:text-green-300"
                  >
                    Sign Up
                  </NavLink>
                </p>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center"
                >
                  {errorMsg}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="text-white text-sm font-medium"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 mt-1 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="text-white text-sm font-medium"
                    >
                      Password
                    </label>
                    <NavLink
                      to="/forgot-password"
                      className="text-sm text-green-400 hover:text-green-300"
                    >
                      Forgot Password?
                    </NavLink>
                  </div>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      required
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={loading}
                    >
                      {showPwd ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95"
                  } shadow-lg`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-white/20" />
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full flex items-center justify-center bg-white text-gray-900 py-3 rounded-xl font-semibold transition-all ${
                  loading
                    ? "opacity-50 cursor-not-allowed scale-95"
                    : "hover:scale-105 active:scale-95"
                } shadow-lg`}
              >
                <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                {loading ? "Please wait..." : "Continue with Google"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
