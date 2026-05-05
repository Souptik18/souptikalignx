import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { API_ENDPOINTS } from "../../config/api";

const fade = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
};

const calcBMI = (w, h) =>
  w && h ? (Number(w) / (Number(h) / 100) ** 2).toFixed(2) : "";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [form, setForm] = useState({
    sex: "",
    age: "",
    height: "",
    weight: "",
    hypertension: false,
    diabetes: false,
  });
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  // ============================================================
  // ✅ Submit form → Call backend + Save profile data to Firestore
  // ✅ FIXED: Do NOT set onboardingDone here
  // ============================================================
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.sex || !form.age || !form.height || !form.weight) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);

    try {
      // 1️⃣ Send data to FastAPI backend
      const res = await axios.post(
        API_ENDPOINTS.onboarding,
        {
          sex: form.sex,
          age: parseFloat(form.age),
          height_cm: parseFloat(form.height),
          weight_kg: parseFloat(form.weight),
          hypertension: form.hypertension ? "Yes" : "No",
          diabetes: form.diabetes ? "Yes" : "No",
        }
      );

      // 2️⃣ Save backend response to Firestore WITHOUT setting onboardingDone
      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            // ❌ REMOVED: onboardingDone: true (don't set it here!)
            profileData: res.data, // full backend response
          },
          { merge: true }
        );
        console.log(
          "✅ Profile data saved (onboarding NOT marked complete yet)"
        );
      }

      // 3️⃣ Continue to Step 3 (Profile Summary)
      setBackendData(res.data.profile_summary);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Backend is temporarily unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      setThinking(true);
      const timer = setTimeout(() => setThinking(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ============================================================
  // ✅ FIXED: Mark onboarding complete ONLY when user finishes
  // ============================================================
  const finishOnboarding = async (redirect = "/home") => {
    const user = auth.currentUser;
    if (user) {
      try {
        // ✅ Mark onboarding as complete NOW (when user clicks final button)
        await setDoc(
          doc(db, "users", user.uid),
          {
            onboardingDone: true,
          },
          { merge: true }
        );
        console.log("✅ Onboarding marked complete");
      } catch (err) {
        console.error("Error marking onboarding complete:", err);
      }
    }
    navigate(redirect, { replace: true });
  };

  const getBackground = () => {
    switch (step) {
      case 1:
        return "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600";
      case 2:
        return "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=1600";
      case 3:
        return "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600";
      case 4:
        return "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1600";
      default:
        return "";
    }
  };
  const bg = getBackground();

  return (
    <div className="w-screen h-screen relative overflow-hidden text-white font-[Segoe_UI_Variable_Display]">
      {/* Background */}
      <motion.img
        key={bg}
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#050506]/90 via-[#0a0a0d]/80 to-[#050506]/90" />

      <div className="relative z-10 flex items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 - Hero */}
          {step === 1 && (
            <motion.div
              key="welcome"
              {...fade}
              className="text-center max-w-3xl px-12 py-16 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
            >
              <h1 className="text-7xl font-extrabold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-300 bg-clip-text text-transparent mb-6 leading-tight">
                Unleash <br /> Your AI-Driven Fitness
              </h1>
              <p className="text-gray-300 text-xl mb-10">
                Welcome to{" "}
                <span className="text-orange-400 font-semibold">Align X</span> —
                where algorithms meet adrenaline. Personalized workouts,
                nutrition & goals—tailored by intelligence.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setStep(2)}
                className="px-16 py-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 text-[#0a0a0e] shadow-lg hover:shadow-orange-400/50 transition-all"
              >
                Let's Go →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 - Form */}
          {step === 2 && (
            <motion.form
              key="form"
              {...fade}
              onSubmit={handleFormSubmit}
              className="w-full max-w-4xl p-12 rounded-3xl bg-[#0a0a0d]/80 border border-white/10 backdrop-blur-2xl shadow-2xl"
            >
              <motion.button
                type="button"
                onClick={() => setStep(1)}
                className="absolute top-8 left-10 text-gray-300 hover:text-orange-400 transition"
              >
                ← Back
              </motion.button>

              <h2 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Let's Shape Your Future Self
              </h2>
              <p className="text-gray-400 text-center mb-10 text-lg">
                Tell us a bit about you so AlignX can personalize your AI
                fitness plan.
              </p>

              {error && (
                <div className="mb-6 text-red-300 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/30">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 relative">
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    className="w-full px-6 py-5 text-white bg-[#1e1e22]/90 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none text-lg"
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
                    ▼
                  </span>
                </div>

                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={form.age}
                  onChange={handleChange}
                  className="p-5 text-lg rounded-xl bg-[#1e1e22]/90 border border-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none placeholder-gray-500"
                />
                <input
                  name="height"
                  type="number"
                  placeholder="Height (cm)"
                  value={form.height}
                  onChange={handleChange}
                  className="p-5 text-lg rounded-xl bg-[#1e1e22]/90 border border-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none placeholder-gray-500"
                />
                <input
                  name="weight"
                  type="number"
                  placeholder="Weight (kg)"
                  value={form.weight}
                  onChange={handleChange}
                  className="p-5 text-lg rounded-xl bg-[#1e1e22]/90 border border-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none placeholder-gray-500"
                />

                <div className="col-span-2 flex justify-center gap-16 mt-4">
                  <label className="flex items-center gap-3 text-lg text-gray-300">
                    <input
                      type="checkbox"
                      name="hypertension"
                      checked={form.hypertension}
                      onChange={handleChange}
                      className="accent-orange-400 w-6 h-6"
                    />
                    Hypertension
                  </label>
                  <label className="flex items-center gap-3 text-lg text-gray-300">
                    <input
                      type="checkbox"
                      name="diabetes"
                      checked={form.diabetes}
                      onChange={handleChange}
                      className="accent-orange-400 w-6 h-6"
                    />
                    Diabetes
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-10 py-5 text-lg font-bold rounded-2xl text-[#0a0a0e] bg-gradient-to-r from-orange-400 to-yellow-400 shadow-lg hover:scale-[1.03] transition-all"
              >
                {loading ? "Analyzing..." : "Continue →"}
              </button>
            </motion.form>
          )}

          {/* STEP 3 - Profile Summary */}
          {step === 3 && backendData && (
            <motion.div
              key="summary"
              {...fade}
              className="w-full max-w-3xl p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
            >
              <motion.button
                type="button"
                onClick={() => setStep(2)}
                className="absolute top-8 left-10 text-gray-300 hover:text-cyan-400 transition"
              >
                ← Back
              </motion.button>

              <h2 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Analyzing Your Metrics ⚡
              </h2>

              <div className="grid grid-cols-2 gap-10 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 border border-cyan-400/20 rounded-2xl p-10 shadow-inner">
                <div>
                  <p className="text-gray-400 text-sm">Sex</p>
                  <p className="text-xl font-semibold">{form.sex}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Age</p>
                  <p className="text-xl font-semibold">{form.age} yrs</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-xl font-semibold">{form.height} cm</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-xl font-semibold">{form.weight} kg</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-gray-400 text-sm">BMI</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {backendData.BMI} ({backendData.BMI_Level})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full mt-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 text-[#0a0a0e] font-bold text-lg hover:scale-[1.03] transition-all"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* STEP 4 - AI Reveal */}
          {step === 4 && backendData && (
            <motion.div
              key="goal"
              {...fade}
              className="relative w-full max-w-3xl p-12 rounded-3xl bg-[#0a0a0d]/80 border-4 border-transparent text-center shadow-[0_0_40px_rgba(0,255,255,0.2)]"
              style={{
                backgroundImage:
                  "linear-gradient(#0a0a0d,#0a0a0d), linear-gradient(120deg, #06b6d4, #3b82f6, #f59e0b, #ec4899)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              >
                {thinking ? (
                  <div className="text-3xl font-semibold text-gray-300 flex items-center justify-center gap-3">
                    🤖 Thinking<span className="animate-pulse">...</span>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-10">
                      Your Recommended Goal
                    </h2>

                    <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-12 mb-10 shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden">
                      <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-transparent"
                        style={{
                          backgroundImage:
                            "linear-gradient(120deg, rgba(6,182,212,0.6), rgba(59,130,246,0.6), rgba(236,72,153,0.6))",
                          backgroundSize: "400% 400%",
                          animation: "moveGradient 6s ease infinite",
                        }}
                      />
                      <style>
                        {`
                        @keyframes moveGradient {
                          0% { background-position: 0% 50%; }
                          50% { background-position: 100% 50%; }
                          100% { background-position: 0% 50%; }
                        }
                        `}
                      </style>

                      <div className="relative">
                        <p className="text-gray-300 text-lg mb-3">🎯 Goal</p>
                        <p className="text-3xl font-bold text-cyan-400 mb-6">
                          {backendData.Fitness_Goal}
                        </p>

                        <p className="text-gray-300 text-lg mb-3">
                          💪 Training Type
                        </p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {backendData.Fitness_Type}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-10">
                      💡 You can change your profile preferences anytime under{" "}
                      <span className="text-cyan-400 font-semibold">
                        Fitness Data
                      </span>
                      .
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => finishOnboarding("/home")}
                        className="flex-1 py-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-[#0a0a0e] shadow-lg hover:shadow-cyan-400/50 transition-all"
                      >
                        Go to Dashboard
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => finishOnboarding("/home/workouts")}
                        className="flex-1 py-5 text-lg font-bold rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-[1.03] transition-all"
                      >
                        See Workouts
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
