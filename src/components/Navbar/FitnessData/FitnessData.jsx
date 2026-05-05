import React, { useState, useEffect } from "react";
import workout from "../../../Images/workout2.png";
import { db, auth } from "../../../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { API_ENDPOINTS } from "../../../config/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FitnessData() {
  const [activeTab, setActiveTab] = useState("update");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [summary, setSummary] = useState(null);
  const [genderLocked, setGenderLocked] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Confirmation states for inline warnings
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [profile, setProfile] = useState({
    Sex: "",
    Age: "",
    Height: "",
    Weight: "",
    Hypertension: "",
    Diabetes: "",
  });

  /**
   * FIREBASE DATA STRUCTURE:
   * users/{userId}/profileData:
   * {
   *   profile_summary: { Sex, Age, Height, Weight, BMI, BMI_Level, Fitness_Goal, etc. },
   *   general_recommendation: "string",
   *   bmi_history: [22.5, 23.1, 22.8, ...],  // Array of BMI values over time
   *   weight_history: [70, 72, 71, ...],     // Array of weight values over time
   * }
   *
   * Each time user updates their profile:
   * 1. New BMI and Weight are calculated by backend
   * 2. We append these to the history arrays
   * 3. This creates a timeline of progress (Week 1, Week 2, etc.)
   */

  // ✅ Fetch user data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setInitialLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setInitialLoading(false);
          return;
        }

        // Get user document from Firestore
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data()?.profileData || {};

          // Lock gender field if already set (prevent changing biological sex)
          if (data.profile_summary?.Sex) setGenderLocked(true);

          // Load profile form data
          setProfile(data.profile_summary || {});

          // Load summary with history arrays
          setSummary({
            ...data,
            bmi_history: data.bmi_history || [],
            weight_history: data.weight_history || [],
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setErrorMsg("Failed to load user data.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserProfile();
  }, []); // Empty array = run once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg("User not authenticated.");
        return;
      }

      // Validate required fields
      if (!profile.Sex || !profile.Age || !profile.Height || !profile.Weight) {
        setErrorMsg("Please fill in all required fields.");
        return;
      }

      console.log("Sending profile data:", profile);

      /**
       * STEP 1: Send data to backend
       * Backend calculates BMI, fitness goals, recommendations
       */
      const res = await fetch(
        API_ENDPOINTS.onboarding,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }
      );

      if (!res.ok) {
        let errorText;
        try {
          const errorData = await res.json();
          errorText =
            errorData.message ||
            errorData.error ||
            `Server error: ${res.status}`;
        } catch {
          errorText = await res.text();
        }
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("Backend response:", data);

      /**
       * STEP 2: Extract new BMI and Weight from backend response
       * These will be appended to our history arrays
       */
      const newBMI = data?.profile_summary?.BMI || 0;
      const newWeight = data?.profile_summary?.Weight || 0;

      /**
       * STEP 3: Fetch existing user data from Firestore
       * We need the old history arrays to append new values
       */
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const oldData = snap.exists() ? snap.data()?.profileData || {} : {};

      /**
       * STEP 4: Append new values to history arrays
       * This creates the week-by-week progression
       * Week 1 = first entry, Week 2 = second entry, etc.
       */
      const bmiHistory = [...(oldData.bmi_history || []), newBMI];
      const weightHistory = [...(oldData.weight_history || []), newWeight];

      /**
       * STEP 5: Write updated data back to Firestore
       * merge: true ensures we don't overwrite other user data
       */
      await setDoc(
        userRef,
        {
          profileData: {
            ...data,
            bmi_history: bmiHistory,
            weight_history: weightHistory,
          },
        },
        { merge: true }
      );

      /**
       * STEP 6: Update local state to reflect changes
       * This updates the UI without requiring a page reload
       */
      setProfile(data.profile_summary || profile);

      setSummary({
        ...data,
        bmi_history: bmiHistory,
        weight_history: weightHistory,
      });

      setSuccessMsg("✅ Profile updated successfully!");
      setGenderLocked(true);

      // Auto-switch to view tab after 1.5 seconds
      setTimeout(() => {
        setActiveTab("view");
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error("Error during submit:", err);
      setErrorMsg(`❌ Failed to update: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * DELETE LAST RECORD
   * Removes the most recent entry from both BMI and Weight history
   * Useful if user made a mistake or wants to undo their last update
   */
  const handleDeleteLastRecord = async () => {
    if (!summary?.bmi_history?.length) {
      setErrorMsg("No records to delete.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    try {
      setDeleteLoading(true);
      setSuccessMsg("");
      setErrorMsg("");

      const user = auth.currentUser;
      if (!user) {
        setErrorMsg("User not authenticated");
        return;
      }

      /**
       * DELETION LOGIC:
       * 1. Clone the existing history arrays
       * 2. Remove the last element from each using slice()
       * 3. Update Firestore with the shortened arrays
       * 4. Update local state
       */
      const newBmiHistory = summary.bmi_history.slice(0, -1);
      const newWeightHistory = summary.weight_history.slice(0, -1);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "profileData.bmi_history": newBmiHistory,
        "profileData.weight_history": newWeightHistory,
      });

      // Update local state
      setSummary((prev) => ({
        ...prev,
        bmi_history: newBmiHistory,
        weight_history: newWeightHistory,
      }));

      setSuccessMsg("🗑️ Last record deleted successfully!");
      setShowDeleteConfirm(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error deleting last record:", err);
      setErrorMsg("Failed to delete last record.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * RESET ALL HISTORY
   * Completely clears all BMI and Weight history
   * Keeps the current profile data but removes progress tracking
   */
  const handleReset = async () => {
    try {
      setResetLoading(true);
      setSuccessMsg("");
      setErrorMsg("");

      const user = auth.currentUser;
      if (!user) {
        setErrorMsg("User not authenticated");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "profileData.bmi_history": [],
        "profileData.weight_history": [],
      });

      setSummary((prev) => ({
        ...prev,
        bmi_history: [],
        weight_history: [],
      }));

      setSuccessMsg("🧹 Progress history reset successfully!");
      setShowResetConfirm(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error resetting history:", err);
      setErrorMsg("Failed to reset progress history.");
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading spinner during initial data fetch
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${workout})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl z-0"></div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-12">
          Progress tracked is progress earned
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-10 gap-4 flex-wrap">
          {["update", "view"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSuccessMsg("");
                setErrorMsg("");
                setShowDeleteConfirm(false);
                setShowResetConfirm(false);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-400 to-lime-400 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab === "update" ? "Update Info" : "View Summary"}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {(successMsg || errorMsg) && (
          <div
            className={`text-center mb-8 px-6 py-3 rounded-lg font-medium ${
              successMsg
                ? "bg-green-500/20 text-green-300 border border-green-400/40"
                : "bg-red-500/20 text-red-300 border border-red-400/40"
            }`}
          >
            {successMsg || errorMsg}
          </div>
        )}

        {/* UPDATE TAB */}
        {activeTab === "update" && (
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-center text-3xl font-bold text-green-400 mb-10">
              Update Your Details
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {[
                {
                  label: "Sex",
                  name: "Sex",
                  type: "select",
                  options: ["Male", "Female", "Other"],
                  disabled: genderLocked,
                },
                { label: "Age", name: "Age", type: "number" },
                { label: "Height (cm)", name: "Height", type: "number" },
                { label: "Weight (kg)", name: "Weight", type: "number" },
                {
                  label: "Hypertension",
                  name: "Hypertension",
                  type: "select",
                  options: ["Yes", "No"],
                },
                {
                  label: "Diabetes",
                  name: "Diabetes",
                  type: "select",
                  options: ["Yes", "No"],
                },
              ].map(({ label, name, type, options, disabled }) => (
                <div key={name}>
                  <label className="block text-green-400 font-medium mb-2">
                    {label}
                    {disabled && (
                      <span className="text-yellow-400 text-sm ml-2">
                        (Locked)
                      </span>
                    )}
                  </label>
                  {type === "select" ? (
                    <select
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                      disabled={disabled}
                      required
                      className={`w-full p-3 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none ${
                        disabled ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">Select</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={profile[name]}
                      onChange={handleChange}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      required
                      className="w-full p-3 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  )}
                </div>
              ))}

              <div className="md:col-span-2 text-center mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-12 py-3 rounded-md text-lg font-semibold transition-all ${
                    loading
                      ? "bg-gray-600 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-lime-400 text-black hover:shadow-lg hover:shadow-green-400/40"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save & Generate Summary"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === "view" && summary && (
          <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl text-white">
            <h2 className="text-3xl font-bold text-center text-green-400 mb-10">
              Your Insights
            </h2>

            {/* Highlighted Goal / Type */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-5 py-2 bg-green-500/20 border border-green-400/50 text-green-300 font-semibold rounded-full">
                🧠 Fitness Goal:{" "}
                {summary.profile_summary?.Fitness_Goal || "N/A"}
              </span>
              <span className="px-5 py-2 bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 font-semibold rounded-full">
                💪 Type: {summary.profile_summary?.Fitness_Type || "N/A"}
              </span>
            </div>

            {/* General Recommendation + Profile Summary */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <h3 className="text-yellow-400 font-bold text-xl mb-2">
                  General Recommendation 💡
                </h3>
                <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {summary.general_recommendation}
                </p>
              </div>

              <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6">
                <h3 className="text-yellow-400 font-bold text-xl mb-2">
                  Profile Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                  {Object.entries(summary.profile_summary || {}).map(
                    ([key, val]) => (
                      <p key={key} className="text-gray-200">
                        <strong className="text-green-400">{key}:</strong> {val}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* CHARTS: Show Week 1, Week 2, etc. */}
            {summary.bmi_history?.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* BMI Chart */}
                <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-cyan-400 font-bold text-xl mb-4">
                    BMI Progress 📊
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={summary.bmi_history.map((bmi, i) => ({
                        name: `Week ${i + 1}`,
                        BMI: bmi,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="BMI"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-center text-gray-300 mt-3">
                    Current BMI:{" "}
                    <span className="text-green-400 font-semibold">
                      {summary.profile_summary?.BMI || "N/A"}
                    </span>{" "}
                    (
                    <span className="text-yellow-400">
                      {summary.profile_summary?.BMI_Level || "N/A"}
                    </span>
                    )
                  </p>
                </div>

                {/* Weight Chart */}
                <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-orange-400 font-bold text-xl mb-4">
                    Weight Progress ⚖️
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={summary.weight_history.map((w, i) => ({
                        name: `Week ${i + 1}`,
                        Weight: w,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="Weight"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-center text-gray-300 mt-3">
                    Current Weight:{" "}
                    <span className="text-orange-400 font-semibold">
                      {summary.profile_summary?.Weight || "N/A"} kg
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-12 flex-wrap">
              <button
                onClick={() => setActiveTab("update")}
                className="px-6 py-3 bg-green-500 text-black rounded-md hover:bg-green-600 font-medium transition-all"
              >
                📝 Edit Info
              </button>

              {/* Delete Last Record Button */}
              {summary.bmi_history?.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  disabled={deleteLoading}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    showDeleteConfirm
                      ? "bg-orange-600 text-white"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {deleteLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                      Deleting...
                    </span>
                  ) : (
                    "🗑️ Delete Last Record"
                  )}
                </button>
              )}

              <button
                onClick={() => setShowResetConfirm(!showResetConfirm)}
                disabled={resetLoading}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  showResetConfirm
                    ? "bg-red-600 text-white"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {resetLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                    Resetting...
                  </span>
                ) : (
                  "🧹 Reset All History"
                )}
              </button>
            </div>

            {/* Inline Confirmation for Delete Last Record */}
            {showDeleteConfirm && (
              <div className="mt-6 bg-orange-500/20 border-2 border-orange-400 rounded-lg p-6 animate-pulse">
                <p className="text-orange-300 text-center font-semibold mb-4">
                  ⚠️ Are you sure you want to delete the last record (Week{" "}
                  {summary.bmi_history.length})?
                </p>
                <p className="text-orange-200 text-center text-sm mb-4">
                  This will permanently remove your most recent BMI and Weight
                  entry. This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDeleteLastRecord}
                    disabled={deleteLoading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                  >
                    Yes, Delete It
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Inline Confirmation for Reset All */}
            {showResetConfirm && (
              <div className="mt-6 bg-red-500/20 border-2 border-red-400 rounded-lg p-6 animate-pulse">
                <p className="text-red-300 text-center font-semibold mb-4">
                  🚨 Are you sure you want to reset ALL progress history?
                </p>
                <p className="text-red-200 text-center text-sm mb-4">
                  This will permanently delete all {summary.bmi_history.length}{" "}
                  week(s) of tracking data. Your current profile will be kept,
                  but all historical progress will be lost. This action cannot
                  be undone.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Info Banner */}
            {summary.bmi_history?.length > 0 &&
              !showDeleteConfirm &&
              !showResetConfirm && (
                <div className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-300 text-center text-sm">
                    💡 <strong>Tip:</strong> Each time you update your profile,
                    a new week is added to your progress tracking. You currently
                    have <strong>{summary.bmi_history.length} week(s)</strong>{" "}
                    of data recorded.
                  </p>
                </div>
              )}
          </div>
        )}
        {/* Show message if no summary available */}
        {activeTab === "view" && !summary && (
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-2xl text-center">
            <p className="text-gray-300 text-lg mb-6">
              No profile data available yet. Please update your information
              first.
            </p>
            <button
              onClick={() => setActiveTab("update")}
              className="px-8 py-3 bg-gradient-to-r from-green-400 to-lime-400 text-black rounded-md hover:shadow-lg hover:shadow-green-400/40 font-medium"
            >
              Update Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
