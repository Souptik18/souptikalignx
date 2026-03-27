// src/components/Navbar.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { homeContext } from "../Layout/Layout";

/* ---------- helpers & defaults ---------- */
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

const defaultFactsItems = [
  { name: "Your Progress ", to: "/home/facts/members-transformation" },
  { name: "Nutritional Advice", to: "/home/facts/nutrition" },
];

const defaultLinks = [
  { name: "Facts", to: "/home/facts", hasDropdown: true },
  { name: "Calculators", to: "/home/fitnessCalculators" },
  { name: "Nutrition", to: "/home/nutrition" },
  { name: "Fitness Data", to: "/home/fitnessData" },
  { name: "Trainings", to: "/home/trainings" },
  { name: "Workouts", to: "/home/workouts" },
  { name: "Mentorship", to: "/home/mentorship" },
];

const sidebarVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "tween", duration: 0.22 } },
  exit: { x: "100%", transition: { type: "tween", duration: 0.18 } },
};

/* map path -> top tab */
const routeToTop = (p) => {
  if (p.startsWith("/home/facts")) return "/home/facts";
  if (p.startsWith("/home/fitnessCalculators"))
    return "/home/fitnessCalculators";
  if (p.startsWith("/home/nutrition")) return "/home/nutrition";
  if (p.startsWith("/home/fitnessData")) return "/home/fitnessData";
  if (p.startsWith("/home/trainings")) return "/home/trainings";
  if (p.startsWith("/home/workouts")) return "/home/workouts";
  if (p.startsWith("/home/mentorship")) return "/home/mentorship";
  return "/home";
};

/* ---------------- Tab Item ---------------- */
const TabItem = ({
  to,
  label,
  withCaret = false,
  isActive = false,
  onClick = undefined,
  onMouseEnter = undefined,
  onMouseLeave = undefined,
  dropdownOpen = false,
  isDropdownOnly = false,
}) => {
  const content = (
    <div
      className="relative rounded-xl px-3 py-2 text-sm font-semibold text-white/75 hover:text-white transition-colors select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10"
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 35,
            mass: 0.6,
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1">
        {label}
        {withCaret && (
          <span
            className={`text-[10px] transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        )}
      </span>
    </div>
  );

  // If it's dropdown only (like Facts), don't use NavLink
  if (isDropdownOnly) {
    return (
      <button onClick={onClick} className="relative">
        {content}
      </button>
    );
  }

  // Regular NavLink for other tabs
  return (
    <NavLink to={to} onClick={onClick} className="relative">
      {content}
    </NavLink>
  );
};

TabItem.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  withCaret: PropTypes.bool,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  dropdownOpen: PropTypes.bool,
  isDropdownOnly: PropTypes.bool,
};

/* ---------------- Navbar ---------------- */
export default function Navbar({
  navLinks = defaultLinks,
  factsItems = defaultFactsItems,
}) {
  const { toast, Bounce, userName, userPhotoURL, userEmail } =
    useContext(homeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [factsDropdownOpen, setFactsDropdownOpen] = useState(false);
  const [mobileFactsOpen, setMobileFactsOpen] = useState(false);

  const [activePill, setActivePill] = useState(routeToTop(location.pathname));

  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const closeTimer = useRef(null);

  const avatarSrc = useMemo(
    () => (!imgError && userPhotoURL ? userPhotoURL : ""),
    [imgError, userPhotoURL]
  );

  // sync pill + close menus on route change
  useEffect(() => {
    setActivePill(routeToTop(location.pathname));
    setMobileOpen(false);
    setMobileFactsOpen(false);
    setFactsDropdownOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // hide on scroll down, show on up
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 60)
        setShowNavbar(false);
      else setShowNavbar(true);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setFactsDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openDropdown = () => {
    clearTimeout(closeTimer.current);
    setFactsDropdownOpen(true);
  };
  const startCloseTimer = () => {
    closeTimer.current = setTimeout(() => setFactsDropdownOpen(false), 140);
  };
  const cancelCloseTimer = () => clearTimeout(closeTimer.current);
  const closeDropdownImmediately = () => {
    clearTimeout(closeTimer.current);
    setFactsDropdownOpen(false);
  };

  // click outside dropdown
  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFactsDropdownOpen(false);
        clearTimeout(closeTimer.current);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast?.success?.("Logged out", {
        position: "top-right",
        autoClose: 1500,
        theme: "dark",
        transition: Bounce,
      });
      setTimeout(() => navigate("/"));
    } catch (e) {
      toast?.error?.("Logout failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  const handleGoToSettings = () => {
    setProfileMenuOpen(false);
    navigate("/home/settings");
  };

  const handleGoToVerifyEmail = () => {
    setProfileMenuOpen(false);
    navigate("/verify-email");
  };

  const Avatar = () => (
    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20 bg-white/10">
      {!imgLoaded && !avatarSrc && (
        <div className="h-full w-full animate-pulse bg-white/10" />
      )}
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={userName || "User avatar"}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/80">
          {getInitials(userName)}
        </div>
      )}
    </div>
  );

  const onTabClick = (e, to) => {
    const currentTop = routeToTop(location.pathname);
    if (location.pathname === to || currentTop === to) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Handle Facts button click - prevent navigation, just toggle dropdown
  const handleFactsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFactsDropdownOpen(!factsDropdownOpen);
  };

  return (
    <>
      {/* Sticky navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-[2000] transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="h-16 bg-neutral-950/60 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Brand */}
            <NavLink
              to="/home"
              onClick={(e) => onTabClick(e, "/home")}
              className="flex items-center space-x-2"
            >
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                ALIGN X
              </span>
            </NavLink>

            {/* Desktop Tabs */}
            <div className="hidden lg:block">
              <div className="relative rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
                <div className="flex items-center gap-1">
                  {/* Facts with dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <TabItem
                      to="/home/facts"
                      label="Facts"
                      withCaret
                      isActive={activePill === "/home/facts"}
                      onClick={handleFactsClick}
                      onMouseEnter={openDropdown}
                      onMouseLeave={startCloseTimer}
                      dropdownOpen={factsDropdownOpen}
                      isDropdownOnly={true}
                    />
                    <AnimatePresence>
                      {factsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.16 }}
                          onMouseEnter={cancelCloseTimer}
                          onMouseLeave={startCloseTimer}
                          className="absolute left-0 mt-2 w-64 rounded-xl bg-neutral-950/90 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl overflow-hidden z-[2100]"
                        >
                          {factsItems.map((item, idx) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              onClick={() => closeDropdownImmediately()}
                              className={({ isActive }) =>
                                `block px-4 py-3 text-sm transition-colors ${
                                  isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/75 hover:bg-white/5 hover:text-white"
                                } ${idx === 0 ? "rounded-t-xl" : ""} ${
                                  idx === factsItems.length - 1
                                    ? "rounded-b-xl"
                                    : ""
                                }`
                              }
                            >
                              {item.name}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Other tabs */}
                  {navLinks
                    .filter((l) => l.name !== "Facts")
                    .map((l) => (
                      <TabItem
                        key={l.to}
                        to={l.to}
                        label={l.name}
                        isActive={activePill === l.to}
                        onClick={(e) => onTabClick(e, l.to)}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-left hover:bg-white/10 transition-colors"
                >
                  <Avatar />
                  <span className="text-sm font-semibold text-white/80 max-w-[160px] truncate">
                    {userName || ""}
                  </span>
                  <span
                    className={`text-xs text-white/60 transition-transform ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  >
                    v
                  </span>
                </button>
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-3 w-64 rounded-xl bg-neutral-950/95 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl overflow-hidden z-[2200]"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">
                          {userName || "User"}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {userEmail || auth?.currentUser?.email || ""}
                        </p>
                      </div>
                      <button
                        onClick={handleGoToSettings}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleGoToVerifyEmail}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                      >
                        Verify Email
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-500/10 transition-colors"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 text-white/90 hover:text-white lg:hidden transition-colors"
            >
              <FaBars size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[1900] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 z-[2001] h-full w-4/5 max-w-xs bg-neutral-950/95 text-white shadow-2xl ring-1 ring-white/10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sidebarVariants}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">
                      {userName || "User"}
                    </span>
                    <span className="text-xs text-white/60">
                      Signed in with Google
                    </span>
                  </div>
                </div>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <ul className="space-y-2">
                  {/* Facts collapsible */}
                  <li>
                    <button
                      onClick={() => setMobileFactsOpen(!mobileFactsOpen)}
                      className="flex items-center justify-between w-full px-3 py-2 text-base font-semibold rounded-lg hover:bg-white/5"
                    >
                      Facts
                      <span
                        className={`text-xs transition-transform ${
                          mobileFactsOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    <AnimatePresence>
                      {mobileFactsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-2 mt-2 space-y-1">
                            {factsItems.map((item) => (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => {
                                  setMobileOpen(false);
                                  setMobileFactsOpen(false);
                                }}
                                className={({ isActive }) =>
                                  `block px-3 py-2 text-sm rounded-md ${
                                    isActive
                                      ? "bg-white/10"
                                      : "hover:bg-white/5"
                                  }`
                                }
                              >
                                {item.name}
                              </NavLink>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Other links */}
                  {navLinks
                    .filter((l) => l.name !== "Facts")
                    .map((l) => (
                      <li key={l.to}>
                        <NavLink
                          to={l.to}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-md px-3 py-2 text-base font-semibold ${
                              isActive ? "bg-white/10" : "hover:bg-white/5"
                            }`
                          }
                        >
                          {l.name}
                        </NavLink>
                      </li>
                    ))}
                  <li>
                    <NavLink
                      to="/home/settings"
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-3 py-2 text-base font-semibold ${
                          isActive ? "bg-white/10" : "hover:bg-white/5"
                        }`
                      }
                    >
                      Settings
                    </NavLink>
                  </li>
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-lg bg-red-500 py-2 text-center font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

Navbar.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hasDropdown: PropTypes.bool,
    })
  ),
  factsItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })
  ),
};
