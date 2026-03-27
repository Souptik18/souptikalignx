import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase/config";

const VERIFY_LATER_KEY = "allowUnverifiedAccess";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [canSkipVerification, setCanSkipVerification] = useState(
    sessionStorage.getItem(VERIFY_LATER_KEY) === "true"
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed: ", u);
      setUser(u);

      // Sync bypass flag from sessionStorage
      const allowBypass =
        sessionStorage.getItem(VERIFY_LATER_KEY) === "true" || false;
      setCanSkipVerification(allowBypass);

      // If email is now verified, clear any bypass from previous sessions
      if (u?.emailVerified && sessionStorage.getItem(VERIFY_LATER_KEY)) {
        sessionStorage.removeItem(VERIFY_LATER_KEY);
        setCanSkipVerification(false);
      }

      // If user logged out, clear bypass for safety
      if (!u && sessionStorage.getItem(VERIFY_LATER_KEY)) {
        sessionStorage.removeItem(VERIFY_LATER_KEY);
        setCanSkipVerification(false);
      }

      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    // Optionally return a spinner or null while checking auth state
    return null;
  }

  if (!user) {
    // Not signed in → redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified && !canSkipVerification) {
    // Signed in but email not verified → redirect to verify-email
    return <Navigate to="/verify-email" replace />;
  }

  // Signed in and verified (or allowed to bypass) → render children
  return children;
}
