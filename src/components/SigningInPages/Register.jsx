// src/components/Public/Register.jsx
import React, { useContext, useState, useCallback, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase/config";
import { homeContext } from "../Layout/Layout";
import { Bounce } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
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

const Register = () => {
  const { toast } = useContext(homeContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [bgIndex, setBgIndex] = useState(0);

  // 🔄 Sync background & indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Map Firebase error codes to friendly messages
  const mapError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/popup-blocked":
      case "auth/cancelled-popup-request":
      case "auth/operation-not-supported-in-this-environment":
        return "Google sign-in blocked. Please try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/operation-not-allowed":
        return "Operation not allowed. Contact support.";
      default:
        return "Unexpected error. Please try again.";
    }
  };

  // Clear error on input change
  const onUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMsg) setErrorMsg("");
  };
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (errorMsg) setErrorMsg("");
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg("");
  };

  // Email/password registration
  const handleRegister = useCallback(async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (username.trim()) {
        await updateProfile(userCredential.user, {
          displayName: username.trim(),
        });
      }
      // Send verification email
      await sendEmailVerification(userCredential.user);
      toast.success(
        "Account created! Verification email sent. Check your inbox.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        }
      );
      navigate("/verify-email");
    } catch (error) {
      const msg = mapError(error.code);
      setErrorMsg(msg);
      console.error("Register error:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  }, [email, password, username, navigate, toast]);

  // Google Sign-up / Sign-in handler
  const handleGoogleSignUp = useCallback(async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user.displayName && username.trim()) {
        await updateProfile(user, { displayName: username.trim() });
      }
      navigate("/onboarding");
    } catch (err) {
      console.error("Google signup error:", err.code, err.message);
      const friendly = mapError(err.code);
      if (
        [
          "auth/popup-blocked",
          "auth/cancelled-popup-request",
          "auth/operation-not-supported-in-this-environment",
        ].includes(err.code)
      ) {
        // Fallback to redirect
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirErr) {
          console.error(
            "Redirect fallback error:",
            redirErr.code,
            redirErr.message
          );
          const msg2 = mapError(redirErr.code);
          setErrorMsg(msg2);
          setLoading(false);
        }
      } else {
        setErrorMsg(friendly);
        setLoading(false);
      }
    }
  }, [navigate, username]);

  // Handle Google redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          navigate("/onboarding");
        }
      })
      .catch((err) => {
        console.error("Redirect result error:", err.code, err.message);
        const msg = mapError(err.code);
        setErrorMsg(msg);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // One Tap initialization
  useEffect(() => {
    if (!window.google || auth.currentUser || window._oneTapInitialized) return;
    window._oneTapInitialized = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setErrorMsg("");
        setLoading(true);
        try {
          const { signInWithCredential, GoogleAuthProvider } = await import(
            "firebase/auth"
          );
          const credential = GoogleAuthProvider.credential(response.credential);
          const res = await signInWithCredential(auth, credential);
          if (!res.user.displayName && username.trim()) {
            await updateProfile(res.user, { displayName: username.trim() });
          }
          navigate("/onboarding");
        } catch (err) {
          console.error("One Tap Error:", err);
          const msg = mapError(err.code);
          setErrorMsg(msg || "Google One Tap failed. Try again.");
        } finally {
          setLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });
    window.google.accounts.id.prompt((notification) => {
      const moment = notification.getMomentType();
      if (moment === "skipped" || moment === "dismissed") {
        console.log("One Tap suppressed:", notification.getDismissedReason?.());
      }
    });
  }, [navigate, username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg("All fields are required.");
      return;
    }
    handleRegister();
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

      {/* ✅ Register Section */}
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
              Start Your
              <br />
              <span className="text-green-400">Fitness Adventure</span>
            </h2>
            <p className="text-xl text-gray-300">
              Create your account and join our community of fitness enthusiasts
              committed to achieving their goals.
            </p>
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Custom Workout Plans
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Goal Tracking
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Community Support
              </span>
            </div>
          </motion.div>

          {/* ✅ Right - Form (No Transition) */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">
                  Create Account
                </h3>
                <p className="text-gray-300">
                  Already have an account?{" "}
                  <NavLink
                    to="/login"
                    className="text-green-400 font-semibold hover:text-green-300"
                  >
                    Sign In
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="text-white text-sm font-medium"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    disabled={loading}
                    value={username}
                    onChange={onUsernameChange}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

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
                    onChange={onEmailChange}
                    className="w-full px-4 py-2.5 mt-1 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-white text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      required
                      disabled={loading}
                      value={password}
                      onChange={onPasswordChange}
                      className="w-full px-4 py-2.5 pr-12 rounded-xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPwd((v) => !v);
                        if (errorMsg) setErrorMsg("");
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPwd ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 rounded-xl font-semibold text-white transition-all ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95"
                  } shadow-lg`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-white/20" />
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className={`w-full flex items-center justify-center bg-white text-gray-900 py-2.5 rounded-xl font-semibold transition-all ${
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
};

export default Register;
