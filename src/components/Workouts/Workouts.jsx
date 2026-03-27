import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaYoutube } from "react-icons/fa";
import workoutBg from "../../Images/workout2.png";

const fade = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4 } },
};

// Equipment master list
const EQUIPMENTS = [
  "Bands",
  "Barbell",
  "Body Only",
  "Bodyweight",
  "Cable",
  "Dumbbell",
  "E-Z Curl Bar",
  "Exercise Ball",
  "Foam Roll",
  "Kettlebells",
  "Machine",
  "Medicine Ball",
  "Other",
];

const Workouts = () => {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [allowedOptions, setAllowedOptions] = useState({
    workout_types: [],
    difficulties: [],
    body_parts: [],
  });
  const [form, setForm] = useState({
    difficulty_level: "",
    workout_type: "",
    body_part: "",
    equipment: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Firestore profileData saved from onboarding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data.profileData?.profile_summary);
          setAllowedOptions(
            data.profileData?.allowed_options || {
              workout_types: [],
              difficulties: [],
              body_parts: [],
            }
          );
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleGetRecommendations = async () => {
    if (
      !form.difficulty_level ||
      !form.workout_type ||
      !form.body_part ||
      !form.equipment
    ) {
      setError("Please select all options before continuing.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // ✅ Ensure all numeric fields are actual numbers
      const payload = {
        sex: profile.Sex,
        age: Number(profile.Age),
        height_cm: Number(profile.Height),
        weight_kg: Number(profile.Weight),
        hypertension: profile.Hypertension,
        diabetes: profile.Diabetes,
        difficulty_level: form.difficulty_level,
        workout_type: form.workout_type,
        body_part: form.body_part,
        equipment: form.equipment,
      };

      console.log("Sending workout request:", payload);

      const res = await axios.post(
        "https://workout-cz6z.onrender.com/api/workouts/recommendations",
        payload
      );
      setRecommendations(res.data.recommended_workouts || []);
    } catch (err) {
      console.error("Workout recommendation error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.detail ||
          "⚠️ AI model not responding. Check backend console."
      );
    } finally {
      setLoading(false);
    }
  };

  const openYouTubeSearch = (title) => {
    const query = encodeURIComponent(title + " exercise");
    window.open(
      `https://www.youtube.com/results?search_query=${query}`,
      "_blank"
    );
  };

  return (
    <div
      className="relative w-full min-h-screen bg-[#0a0a0d] text-white px-6 py-24 flex flex-col items-center justify-start"
      style={{
        backgroundImage: `url(${workoutBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-0"></div>

      <motion.h1
        className="relative z-10 text-5xl md:text-6xl font-extrabold mb-10 text-center bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-300 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Get Your Workout Recommendations
      </motion.h1>

      <AnimatePresence mode="wait">
        {profileLoading ? (
          <motion.div
            key="loading"
            {...fade}
            className="relative z-10 text-center text-gray-400 text-xl"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
              <p>Loading your profile...</p>
            </div>
          </motion.div>
        ) : !profile ? (
          <motion.div
            key="no-profile"
            {...fade}
            className="relative z-10 text-center text-red-400 text-xl bg-red-500/10 p-8 rounded-2xl border border-red-500/30"
          >
            <p className="mb-4">❌ No profile found.</p>
            <p className="text-sm text-gray-400">
              Please complete onboarding first to access workout
              recommendations.
            </p>
          </motion.div>
        ) : !recommendations.length ? (
          // 🧠 Form Section
          <motion.div
            key="form"
            {...fade}
            className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10"
          >
            <p className="text-gray-400 text-center mb-8 text-lg">
              Select difficulty to unlock options progressively.
            </p>

            {error && (
              <div className="text-red-300 text-center mb-6 bg-red-500/10 p-3 rounded-xl border border-red-500/30">
                {error}
              </div>
            )}

            {/* Dropdowns */}
            <div className="space-y-6">
              {/* 1️⃣ Difficulty */}
              <motion.div {...fade}>
                <label className="block text-sm text-orange-400 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty_level"
                  value={form.difficulty_level}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl bg-[#1e1e22]/80 border border-white/10 text-white focus:ring-2 focus:ring-orange-400/40 outline-none text-lg"
                >
                  <option value="">Select Difficulty</option>
                  {allowedOptions.difficulties.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>

              {/* 2️⃣ Workout Type */}
              <motion.div {...fade}>
                <label className="block text-sm text-orange-400 mb-2">
                  Workout Type
                </label>
                <select
                  name="workout_type"
                  value={form.workout_type}
                  onChange={handleChange}
                  disabled={!form.difficulty_level}
                  className={`w-full px-4 py-4 rounded-xl border border-white/10 text-lg outline-none transition-all ${
                    !form.difficulty_level
                      ? "opacity-40 cursor-not-allowed bg-[#1e1e22]/40"
                      : "bg-[#1e1e22]/80 text-white focus:ring-2 focus:ring-orange-400/40"
                  }`}
                >
                  <option value="">Select Workout Type</option>
                  {allowedOptions.workout_types.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>

              {/* 3️⃣ Body Part */}
              <motion.div {...fade}>
                <label className="block text-sm text-orange-400 mb-2">
                  Target Body Part
                </label>
                <select
                  name="body_part"
                  value={form.body_part}
                  onChange={handleChange}
                  disabled={!form.workout_type}
                  className={`w-full px-4 py-4 rounded-xl border border-white/10 text-lg outline-none transition-all ${
                    !form.workout_type
                      ? "opacity-40 cursor-not-allowed bg-[#1e1e22]/40"
                      : "bg-[#1e1e22]/80 text-white focus:ring-2 focus:ring-orange-400/40"
                  }`}
                >
                  <option value="">Select Body Part</option>
                  {allowedOptions.body_parts.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>

              {/* 4️⃣ Equipment */}
              <motion.div {...fade}>
                <label className="block text-sm text-orange-400 mb-2">
                  Equipment
                </label>
                <select
                  name="equipment"
                  value={form.equipment}
                  onChange={handleChange}
                  disabled={!form.body_part}
                  className={`w-full px-4 py-4 rounded-xl border border-white/10 text-lg outline-none transition-all ${
                    !form.body_part
                      ? "opacity-40 cursor-not-allowed bg-[#1e1e22]/40"
                      : "bg-[#1e1e22]/80 text-white focus:ring-2 focus:ring-orange-400/40"
                  }`}
                >
                  <option value="">Select Equipment</option>
                  {EQUIPMENTS.map((eq) => (
                    <option key={eq}>{eq}</option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Submit */}
            <div className="mt-10 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetRecommendations}
                disabled={loading}
                className="px-12 py-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 text-[#0a0a0e] shadow-lg hover:shadow-orange-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#0a0a0e]/30 border-t-[#0a0a0e] rounded-full animate-spin"></div>
                    Fetching AI Recommendations...
                  </span>
                ) : (
                  "Get My Plan →"
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // 🏋️‍♂️ Recommendations View
          <motion.div
            key="results"
            {...fade}
            className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10"
          >
            {/* Back Button */}
            <button
              onClick={() => {
                setRecommendations([]);
                setError("");
              }}
              className="absolute top-6 left-6 text-gray-400 hover:text-cyan-400 transition text-sm"
            >
              ← Back to Customize
            </button>

            <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Your AI-Optimized Workout Plan 💪
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((ex, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 bg-[#141418]/80 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-all relative"
                >
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{ex.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs mb-6">
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30">
                      {ex.type}
                    </span>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/30">
                      {ex.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/30">
                      {ex.body_part}
                    </span>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/30">
                      {ex.equipment}
                    </span>
                  </div>

                  {/* YouTube Button */}
                  <button
                    onClick={() => openYouTubeSearch(ex.title)}
                    className="absolute bottom-6 right-6 flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition"
                  >
                    <FaYoutube size={20} />
                    Watch
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workouts;
