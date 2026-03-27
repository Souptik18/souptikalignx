import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { FiChevronDown, FiDownload, FiX, FiCheckCircle } from "react-icons/fi";
import Hero from "./Hero";

/* fade helper */
const fadeIn = (d = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.6, ease: "easeOut" },
  },
});

/* ---------------- Modal ---------------- */
function InstallModal({
  open = false,
  onClose = () => {},
  onInstall = () => {},
  supportsPrompt = false,
  alreadyInstalled = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />

          {/* dialog */}
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 bg-neutral-900 text-white shadow-2xl p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute right-3 top-3 p-2 rounded-full hover:bg-white/10 focus:ring-2 focus:ring-white/30"
              onClick={onClose}
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <FiDownload className="text-green-400 w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-semibold">AlignX App</h3>
            </div>
            <p className="text-white/70 mb-4">
              Faster, full-screen, one-tap access.
            </p>

            {["Offline support", "Home-screen icon", "Smooth transitions"].map(
              (t) => (
                <div key={t} className="flex items-center gap-2 text-sm mb-1">
                  <FiCheckCircle className="text-green-400 w-4 h-4" />
                  <span>{t}</span>
                </div>
              )
            )}

            {/* footer */}
            <div className="mt-5 flex gap-2 items-stretch">
              {/* Install only when prompt available AND not already installed */}
              {supportsPrompt && !alreadyInstalled && (
                <button
                  onClick={onInstall}
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-full bg-green-600 hover:bg-green-700 font-semibold"
                >
                  <FiDownload /> Install App
                </button>
              )}

              {/* Already installed badge */}
              {alreadyInstalled && (
                <div className="flex-1 px-4 py-2.5 rounded-full border border-green-500/30 text-green-400 bg-green-500/10 text-center font-semibold">
                  ✅ Already installed
                </div>
              )}

              {/* Not now only when NOT installed */}
              {!alreadyInstalled && (
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Not now
                </button>
              )}
            </div>

            {/* Manual block when NO prompt OR when ALREADY installed */}
            {(!supportsPrompt || alreadyInstalled) && (
              <div className="mt-4 text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="font-medium mb-1">Manual open / install:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Android Chrome:</strong> If not installed → Menu →{" "}
                    <em>Install app</em>. If installed → open from launcher.
                  </li>
                  <li>
                    <strong>iOS Safari:</strong> Share →{" "}
                    <em>Add to Home Screen</em>.
                  </li>
                  <li>
                    <strong>Desktop Chrome:</strong> Omnibox “Install” icon or
                    chrome://apps.
                  </li>
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

InstallModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onInstall: (props, propName, componentName) => {
    // require onInstall only when supportsPrompt is true
    if (props.supportsPrompt && typeof props[propName] !== "function") {
      return new Error(
        `${componentName}: prop "${propName}" is required when "supportsPrompt" is true`
      );
    }
    if (props[propName] && typeof props[propName] !== "function") {
      return new Error(
        `${componentName}: prop "${propName}" must be a function`
      );
    }
    return null;
  },
  supportsPrompt: PropTypes.bool,
  alreadyInstalled: PropTypes.bool,
};

/* ---------------- Page ---------------- */
export default function HeroPage() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, threshold: 0.1 });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const isPWAMode = () =>
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://");

  const refreshInstallState = async () => {
    const pwa = isPWAMode();
    setIsPWA(pwa);

    // FAB: visible on browser (installed or not), hidden inside PWA window
    setShowFab(!pwa);

    // detect installed (best-effort)
    if (navigator.getInstalledRelatedApps) {
      try {
        const apps = await navigator.getInstalledRelatedApps();
        setIsInstalled(apps.length > 0);
      } catch {
        setIsInstalled(false);
      }
    } else {
      // iOS/others: cannot reliably detect -> treat as not installed for prompt logic
      setIsInstalled(false);
    }
  };

  useEffect(() => {
    refreshInstallState();

    const onBIP = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // ensure FAB visible in browser when installable
      setShowFab(!isPWAMode());
    };

    const onInstalledEvt = () => {
      setDeferredPrompt(null);
      setDialogOpen(false);
      refreshInstallState();
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalledEvt);

    // keep state fresh on focus / visibility / display-mode changes
    const onFocusOrVis = () => refreshInstallState();
    const dm = window.matchMedia?.("(display-mode: standalone)");
    window.addEventListener("focus", onFocusOrVis);
    document.addEventListener("visibilitychange", onFocusOrVis);
    dm?.addEventListener?.("change", onFocusOrVis);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalledEvt);
      window.removeEventListener("focus", onFocusOrVis);
      document.removeEventListener("visibilitychange", onFocusOrVis);
      dm?.removeEventListener?.("change", onFocusOrVis);
    };
  }, []);

  const confirmInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") refreshInstallState();
  };

  const openDialog = async () => {
    await refreshInstallState();
    setDialogOpen(true);
  };

  return (
    <>
      {/* HERO */}
      <div ref={heroRef} className="relative h-screen overflow-hidden -mt-16">
        <video
          src="https://res.cloudinary.com/de7nhss6l/video/upload/v1750259071/hero_e7nrr4.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/50" />
        <section className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white"
            variants={fadeIn(0.2)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <span className="text-green-500">ALIGN&nbsp;X</span>
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200"
            variants={fadeIn(0.5)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            Transform your fitness journey with expert guidance&nbsp;and premium
            facilities.
          </motion.p>
          <Link to="/register">
            <button className="mt-8 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-lg">
              Start&nbsp;Today
            </button>
          </Link>
          <motion.div
            className="absolute bottom-8 cursor-pointer"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiChevronDown className="text-white text-3xl" />
          </motion.div>
        </section>
      </div>

      <Hero />

      {/* FAB: visible on browser (installed or not), hidden in PWA */}
      <AnimatePresence>
        {showFab && !isPWA && (
          <motion.button
            key="fab"
            onClick={openDialog}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-900 text-white border border-white/10 shadow-xl"
            initial={{ opacity: 0, scale: 0.9, x: 60, y: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 60, y: 30 }}
            aria-label="Install AlignX App"
            title="Install AlignX App"
          >
            <FiDownload className="text-xl" />
            <span className="font-semibold">Install App</span>
          </motion.button>
        )}
      </AnimatePresence>

      <InstallModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onInstall={confirmInstall}
        supportsPrompt={!!deferredPrompt}
        alreadyInstalled={isInstalled}
      />
    </>
  );
}
