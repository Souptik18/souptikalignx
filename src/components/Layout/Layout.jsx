import React, { createContext, useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Loader from "./Loader";
import ContentLoader from "./ContentLoader";

export const homeContext = createContext({
  toast,
  ToastContainer,
  Bounce,
  Loader,
  ContentLoader,
  userEmail: null,
  userName: null,
  userPhotoURL: null,
  setUserName: () => {},
});

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [checking, setChecking] = useState(true);
  const hasCheckedOnboarding = useRef(false); // Track if we've already checked onboarding

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserName(user.displayName || user.email.split("@")[0]);
        setUserPhotoURL(user.photoURL || null);

        // Skip onboarding check if:
        // 1. We're already on the onboarding page
        // 2. We've already checked onboarding for this session
        if (location.pathname.startsWith("/onboarding")) {
          setChecking(false);
          return;
        }

        // Only check onboarding once per session
        if (!hasCheckedOnboarding.current) {
          try {
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists() || !snap.data().onboardingDone) {
              hasCheckedOnboarding.current = true; // Mark as checked
              navigate("/onboarding", { replace: true });
              setChecking(false);
              return;
            }

            hasCheckedOnboarding.current = true; // Mark as checked
          } catch (e) {
            console.error("Error checking onboarding:", e);
            toast.error("Couldn't verify onboarding. Please try again.", {
              position: "top-right",
              autoClose: 2000,
            });
            hasCheckedOnboarding.current = true; // Mark as checked even on error
          }
        }

        setChecking(false);
      } else {
        setUserEmail(null);
        setUserName(null);
        setUserPhotoURL(null);
        setChecking(false);
        hasCheckedOnboarding.current = false; // Reset on logout
        navigate("/login");
      }
    });

    return () => unsub();
  }, []); // Remove location.pathname from dependencies

  if (checking) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Loader />
      </div>
    );
  }

  // Don't render Navbar on onboarding page
  const hideNav = location.pathname.startsWith("/onboarding");

  return (
    <homeContext.Provider
      value={{
        toast,
        ToastContainer,
        Bounce,
        Loader,
        ContentLoader,
        userEmail,
        userName,
        userPhotoURL,
        setUserName,
      }}
    >
      <ToastContainer />
      {!hideNav && <Navbar />}
      <main>
        <Outlet />
      </main>
    </homeContext.Provider>
  );
}

export default Layout;
