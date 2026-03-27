import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { motion } from "framer-motion";

import { auth } from "../../firebase/config";
import { homeContext } from "../Layout/Layout";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

export default function Settings() {
  const { toast, userName, userEmail, userPhotoURL } = useContext(homeContext);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  const status = currentUser?.emailVerified ? "Verified" : "Unverified";
  const badgeClass = currentUser?.emailVerified
    ? "bg-emerald-500/10 text-emerald-200 border border-emerald-400/40"
    : "bg-amber-500/10 text-amber-200 border border-amber-400/40";

  const avatar = useMemo(
    () =>
      userPhotoURL ? (
        <img
          src={userPhotoURL}
          alt={userName || "User avatar"}
          referrerPolicy="no-referrer"
          className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10 shadow-lg"
        />
      ) : (
        <div className="h-20 w-20 rounded-2xl bg-white/10 ring-2 ring-white/10 shadow-lg flex items-center justify-center text-2xl font-semibold text-white">
          {getInitials(userName)}
        </div>
      ),
    [userName, userPhotoURL]
  );

  const handleRefresh = useCallback(async () => {
    if (!auth.currentUser) return;
    setRefreshing(true);
    try {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      toast?.success?.("Status refreshed", { autoClose: 1600, theme: "dark" });
    } catch (err) {
      console.error("Refresh status error:", err);
      toast?.error?.("Could not refresh right now.", {
        autoClose: 2000,
        theme: "dark",
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  const handleSendVerification = useCallback(async () => {
    if (!auth.currentUser) return;
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast?.success?.("Verification email sent.", {
        autoClose: 2000,
        theme: "light",
      });
    } catch (err) {
      console.error("Send verification from settings:", err);
      toast?.error?.("Unable to send right now.", {
        autoClose: 2000,
        theme: "dark",
      });
    } finally {
      setSending(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white px-4 sm:px-8 lg:px-12 py-10 pt-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/50">
              Account
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {avatar}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {userName || "User"}
                </h2>
                <p className="text-white/70 text-sm">{userEmail}</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      currentUser?.emailVerified ? "bg-emerald-400" : "bg-amber-300"
                    }`}
                  />
                  {status}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <p className="text-sm text-white/60 mb-2">Email</p>
                <p className="text-lg font-semibold">{userEmail}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <p className="text-sm text-white/60 mb-2">Display name</p>
                <p className="text-lg font-semibold">
                  {userName || "Not set"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Email verification</p>
                <h3 className="text-lg font-semibold">{status}</h3>
              </div>
              {!currentUser?.emailVerified && (
                <span className="text-xs font-semibold text-amber-200 bg-amber-500/10 border border-amber-400/40 px-2 py-1 rounded-full">
                  Action needed
                </span>
              )}
            </div>

            <p className="text-sm text-white/70">
              Keep your account secure by verifying your email. You can resend
              the verification email or open the verification page.
            </p>

            <div className="space-y-3">
              {!currentUser?.emailVerified && (
                <button
                  onClick={() => navigate("/verify-email")}
                  className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold transition-colors"
                >
                  Go to Verify Email
                </button>
              )}
              <button
                onClick={handleSendVerification}
                disabled={sending}
                className="w-full rounded-lg border border-white/15 px-4 py-2 font-semibold hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Verification Email"}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {refreshing ? "Refreshing..." : "Refresh Status"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
