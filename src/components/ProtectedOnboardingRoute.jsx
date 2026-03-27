import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/config";

export default function ProtectedOnboardingRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in → redirect to login
        setAllow(false);
        setChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists() && userDoc.data().onboardingDone) {
          // ✅ already onboarded → redirect to home
          setAllow(false);
        } else {
          // 🚀 not onboarded → allow access
          setAllow(true);
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
        setAllow(false);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Checking profile...
      </div>
    );
  }

  // ❌ Already onboarded → redirect
  if (!allow) return <Navigate to="/home" replace />;

  // ✅ Allowed to onboard
  return children;
}
