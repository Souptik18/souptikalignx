// HeroNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const HOME_THRESHOLD = 500;
const OTHER_THRESHOLD = 100;

/* OFFERINGS DATA */
const offeringsMenu = [
  {
    label: "HIIT Blast",
    to: "/offerings/hiit",
    img: "https://placehold.co/350x350/ef4444/ffffff?text=HIIT",
    desc: "Crush calories in 30 minutes and feel unstoppable energy all day.",
  },
  {
    label: "Zumba Fusion",
    to: "/offerings/zumba",
    img: "https://placehold.co/350x350/f97316/ffffff?text=Zumba",
    desc: "Burn fat the fun way—follow the beat, torch 600 cal, leave smiling.",
  },
  {
    label: "Personal Training",
    to: "/offerings/personal-training",
    img: "https://placehold.co/350x350/6366f1/ffffff?text=PT",
    desc: "1-on-1 coaching, custom plans, measurable results—your goals, our roadmap.",
  },
  {
    label: "Group Energy",
    to: "/offerings/group",
    img: "https://placehold.co/350x350/10b981/ffffff?text=Group",
    desc: "Electrifying team spirit that pushes you harder than you thought possible.",
  },
  {
    label: "Functional Fit",
    to: "/offerings/functional",
    img: "https://placehold.co/350x350/14b8a6/ffffff?text=Func",
    desc: "Bullet-proof your body for everyday life with mobility & power moves.",
  },
  {
    label: "Cardio Endurance",
    to: "/offerings/cardio-endurance",
    img: "https://placehold.co/350x350/0ea5e9/ffffff?text=Cardio",
    desc: "Level-up heart health and outrun yesterday's you.",
  },
  {
    label: "Stamina Boost",
    to: "/offerings/stamina",
    img: "https://placehold.co/350x350/a855f7/ffffff?text=Stamina",
    desc: "Long-haul sessions that keep you going when others quit.",
  },
  {
    label: "Performance Plus",
    to: "/offerings/performance",
    img: "https://placehold.co/350x350/ec4899/ffffff?text=Perf",
    desc: "Athlete-grade programming to smash PRs and podium finishes.",
  },
  {
    label: "Beginners Journey",
    to: "/offerings/beginners",
    img: "https://placehold.co/350x350/f59e0b/ffffff?text=Begin",
    desc: "Zero intimidation—learn fundamentals & build confidence from day one.",
  },
  {
    label: "Core Upgrade",
    to: "/offerings/core-upgrade",
    img: "https://placehold.co/350x350/22d3ee/ffffff?text=Core",
    desc: "Carve a rock-solid mid-section that powers every move you make.",
  },
];

/* MEMBERSHIPS DATA */
const membershipsMenu = [
  {
    label: "New Member Plan",
    to: "/memberships/new-member",
    img: "https://placehold.co/350x350/4f46e5/ffffff?text=New+Member",
    desc: "Perfect starter package with full gym access, basic classes, and orientation sessions to kickstart your fitness journey.",
  },
  {
    label: "Warrior Plan",
    to: "/memberships/corporate",
    img: "https://placehold.co/350x350/059669/ffffff?text=Corporate",
    desc: "Team-focused membership solution for businesses wanting to invest in employee wellness and productivity.",
  },
  {
    label: "Personal Plan",
    to: "/memberships/personal-warrior",
    img: "https://placehold.co/350x350/dc2626/ffffff?text=Warrior",
    desc: "Elite training program with dedicated personal trainer, custom nutrition plans, and warrior-level intensity sessions.",
  },
  {
    label: "Royalty Plan",
    to: "/memberships/royalty",
    img: "https://placehold.co/350x350/7c3aed/ffffff?text=Royalty",
    desc: "Premium all-access membership with exclusive perks, priority booking, and VIP treatment fit for fitness royalty.",
  },
];

export default function HeroNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideTimer = useRef(null);

  const [user, setUser] = useState(null);
  const [mob, setMob] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'offerings' | 'memberships' | null
  const [idx, setIdx] = useState(0);
  const [sty, setSty] = useState({});
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Scroll listener: determine threshold based on route
  useEffect(() => {
    const handleScroll = () => {
      const isHome = location.pathname === "/";
      const threshold = isHome ? HOME_THRESHOLD : OTHER_THRESHOLD;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    // trigger once on mount / route change
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMob(false);
    setMobileExpandedSection(null);
  }, [location.pathname]);

  // Dropdown positioning logic
  useEffect(() => {
    if (!openDropdown) return;
    const calc = () => {
      const pad = 24;
      const W = Math.min(1040, window.innerWidth - pad * 2);
      setSty({
        width: W,
        left: Math.max(pad, (window.innerWidth - W) / 2),
        top: document.querySelector("nav")?.offsetHeight || 64,
      });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mob]);

  // Nav links
  const navLinks = [
    { to: "/equipments", label: "Equipments" },
    { to: "/invest", label: "For Investors" },
    { to: "/about", label: "About AlignX" },
  ];

  // Determine background style based on route and scroll position
  const isHome = location.pathname === "/";
  const getNavbarBg = () => {
    if (isHome) {
      // Home page: transparent initially, blurred bg after threshold
      return scrolled
        ? "bg-black/30 backdrop-blur-md shadow-md"
        : "bg-transparent";
    } else {
      // Other pages: solid black bg initially, blurred bg after threshold
      return scrolled ? "bg-black/30 backdrop-blur-md shadow-md" : "bg-black";
    }
  };

  // NavLink class
  const linkCls = ({ isActive }) =>
    `uppercase tracking-wide px-3 py-1 text-[15px] transition font-semibold ${
      isActive ? "text-sky-400" : "text-white/90 hover:text-sky-300"
    }`;

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const showDropdown = (type) => {
    clearTimeout(hideTimer.current);
    setOpenDropdown(type);
    setIdx(0);
  };

  const hideDropdown = () => {
    hideTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  };

  const currentDropdownData =
    openDropdown === "offerings" ? offeringsMenu : membershipsMenu;

  const toggleMobileSection = (section) => {
    setMobileExpandedSection(
      mobileExpandedSection === section ? null : section
    );
  };

  const handleMemberArea = () => {
    setMob(false);
    navigate("/home");
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full duration-300 transition ${getNavbarBg()}`}
        style={{ fontFamily: "Montserrat, Inter, sans-serif" }}
      >
        {/* NAVBAR BAR */}
        <div className="max-w-[1320px] mx-auto flex items-center justify-between p-2.5">
          {/* LOGO */}
          <NavLink to="/" className="flex items-center group select-none">
            <span
              className="font-extrabold text-2xl tracking-tight text-white leading-none group-hover:text-sky-300 transition-all uppercase"
              style={{ letterSpacing: ".04em" }}
            >
              ALIGN<span className="font-black text-sky-400">X</span>
            </span>
          </NavLink>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-3">
            {/* Memberships Dropdown Trigger */}
            <div
              onMouseEnter={() => showDropdown("memberships")}
              onMouseLeave={hideDropdown}
              className="relative"
            >
              <span
                className={linkCls({
                  isActive: location.pathname.startsWith("/memberships"),
                })}
              >
                Memberships
              </span>
            </div>
            {/* Offerings Dropdown Trigger */}
            <div
              onMouseEnter={() => showDropdown("offerings")}
              onMouseLeave={hideDropdown}
              className="relative"
            >
              <span
                className={linkCls({
                  isActive: location.pathname.startsWith("/offerings"),
                })}
              >
                Offerings
              </span>
            </div>

            {/* Other links */}
            {navLinks.map((n) => (
              <NavLink to={n.to} key={n.to} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
          </div>

          {/* AUTH + BURGER */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <NavLink to="/home" className={linkCls({ isActive: false })}>
                    Member Area
                  </NavLink>
                  <button
                    onClick={logout}
                    className="px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-wide transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="px-4 py-1.5 rounded text-white text-xs font-bold uppercase tracking-wider transition hover:bg-white/10"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-1.5 border border-white rounded text-white text-xs font-bold uppercase tracking-wider transition hover:bg-white/10"
                  >
                    Join
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Member Area Button (only when logged in) */}
            {user && (
              <NavLink
                to="/home"
                className="md:hidden px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg mr-1"
              >
                Member Area
              </NavLink>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMob(!mob)}
              className="md:hidden p-2 rounded hover:bg-white/10 transition relative z-[60]"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: mob ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mob ? (
                  <FiX size={25} className="text-white" />
                ) : (
                  <FiMenu size={25} className="text-white" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        {/* DESKTOP DROPDOWN */}
        <AnimatePresence>
          {openDropdown && (
            <motion.div
              key="mega"
              style={sty}
              onMouseEnter={() => showDropdown(openDropdown)}
              onMouseLeave={hideDropdown}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.17 } }}
              exit={{ opacity: 0, y: -18, transition: { duration: 0.13 } }}
              className="fixed flex w-[90vw] max-w-[1040px] left-0 right-0 mx-auto
                 rounded-2xl overflow-hidden z-[9999] shadow-2xl bg-[#151726] border border-[#23243a]
                 max-h-[480px] min-h-[340px]"
            >
              {/* LEFT PANEL */}
              <div
                className={
                  openDropdown === "offerings"
                    ? "w-2/5 bg-[#191c2b] overflow-y-auto max-h-[480px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    : "w-2/5 bg-[#191c2b]"
                }
              >
                {currentDropdownData.map((o, i) => (
                  <NavLink
                    key={o.to}
                    to={o.to}
                    onClick={() => setOpenDropdown(null)}
                    onMouseEnter={() => setIdx(i)}
                    className={`flex items-center gap-3 px-7 py-5 group transition ${
                      idx === i ? "bg-[#23243a]" : "hover:bg-[#202337]"
                    }`}
                  >
                    <img
                      src={o.img}
                      alt={o.label}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-[#262b4a] group-hover:border-sky-400 transition"
                    />
                    <span className="font-semibold text-lg text-white">
                      {o.label}
                    </span>
                  </NavLink>
                ))}
              </div>

              {/* RIGHT PREVIEW PANEL */}
              <div
                className="w-3/5 flex flex-col items-center justify-center gap-7 px-14 py-12
               bg-gradient-to-br from-[#23243a] via-[#23243a]/60 to-[#121427] text-white min-h-[340px]"
              >
                <img
                  src={currentDropdownData[idx].img}
                  alt={currentDropdownData[idx].label}
                  className="w-[16rem] h-[16rem] rounded-xl object-cover border-2 border-[#2a2e4c] shadow-xl"
                />
                <h3 className="text-3xl font-bold tracking-tight text-sky-300 uppercase">
                  {currentDropdownData[idx].label}
                </h3>
                <p className="text-base font-medium text-white/80 max-w-xl text-center">
                  {currentDropdownData[idx].desc}
                </p>
                <NavLink
                  to={currentDropdownData[idx].to}
                  className={`inline-block px-8 py-3 rounded-full font-bold text-base uppercase tracking-wider text-white
                shadow-lg hover:shadow-xl transition-all ${
                  openDropdown === "memberships"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:to-pink-700"
                    : "bg-gradient-to-r from-sky-600 to-blue-900 hover:to-blue-700"
                }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {openDropdown === "memberships" ? "Choose Plan" : "Explore"}{" "}
                  {currentDropdownData[idx].label}
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {mob && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] md:hidden"
              onClick={() => setMob(false)}
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4,
              }}
              className="fixed right-0 top-0 h-full w-[85vw] max-w-[380px] bg-gradient-to-br from-[#0f1118] via-[#151726] to-[#1a1d2e] z-[52] md:hidden shadow-2xl border-l border-[#23243a]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#23243a]">
                <span className="font-extrabold text-xl text-white tracking-tight uppercase">
                  ALIGN<span className="text-sky-400">X</span>
                </span>
                <button
                  onClick={() => setMob(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX size={24} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                  {/* Auth Section - For logged out users or member area + logout for logged in */}
                  {user ? (
                    <div className="flex gap-3 bg-[#1a1d2e] rounded-xl p-4 mb-6 border border-[#23243a]">
                      <button
                        onClick={handleMemberArea}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-lg text-white text-sm font-bold uppercase tracking-wide transition-all"
                      >
                        <FiUser size={14} />
                        Member Area
                      </button>
                      <button
                        onClick={() => {
                          setMob(false);
                          logout();
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-bold uppercase tracking-wide transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 mb-6">
                      <NavLink
                        to="/login"
                        onClick={() => setMob(false)}
                        className="flex-1 text-center px-4 py-3 bg-[#1a1d2e] hover:bg-[#23243a] border border-[#23243a] rounded-xl text-white text-sm font-bold uppercase tracking-wider transition-colors"
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        onClick={() => setMob(false)}
                        className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-xl text-white text-sm font-bold uppercase tracking-wider transition-all shadow-lg"
                      >
                        Join
                      </NavLink>
                    </div>
                  )}

                  {/* Navigation Sections */}

                  {/* Memberships Section */}
                  <div className="border-b border-[#23243a]/50 pb-4 mb-4">
                    <button
                      onClick={() => toggleMobileSection("memberships")}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#1a1d2e] transition-colors group"
                    >
                      <span className="text-white font-semibold text-base uppercase tracking-wide group-hover:text-sky-300 transition-colors">
                        Memberships
                      </span>
                      <motion.div
                        animate={{
                          rotate:
                            mobileExpandedSection === "memberships" ? 90 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight
                          size={20}
                          className="text-white/70 group-hover:text-sky-300"
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {mobileExpandedSection === "memberships" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pl-2 mt-2 space-y-2"
                        >
                          {membershipsMenu.map((m) => (
                            <NavLink
                              key={m.to}
                              to={m.to}
                              onClick={() => setMob(false)}
                              className="flex items-center gap-3 py-3 px-4 rounded-lg text-white/80 hover:text-white hover:bg-[#23243a] transition-all group"
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={m.img}
                                  alt={m.label}
                                  className="w-10 h-10 rounded-lg object-cover border-2 border-[#262b4a] group-hover:border-purple-400 transition-colors"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                  {m.label}
                                </div>
                                <div className="text-xs text-white/60 truncate mt-0.5">
                                  {m.desc.split(" ").slice(0, 8).join(" ")}...
                                </div>
                              </div>
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Offerings Section */}
                  <div className="border-b border-[#23243a]/50 pb-4 mb-4">
                    <button
                      onClick={() => toggleMobileSection("offerings")}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#1a1d2e] transition-colors group"
                    >
                      <span className="text-white font-semibold text-base uppercase tracking-wide group-hover:text-sky-300 transition-colors">
                        Offerings
                      </span>
                      <motion.div
                        animate={{
                          rotate:
                            mobileExpandedSection === "offerings" ? 90 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight
                          size={20}
                          className="text-white/70 group-hover:text-sky-300"
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {mobileExpandedSection === "offerings" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pl-2 mt-2 space-y-2 max-h-80 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#23243a_transparent]"
                        >
                          {offeringsMenu.map((o) => (
                            <NavLink
                              key={o.to}
                              to={o.to}
                              onClick={() => setMob(false)}
                              className="flex items-center gap-3 py-3 px-4 rounded-lg text-white/80 hover:text-white hover:bg-[#23243a] transition-all group"
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={o.img}
                                  alt={o.label}
                                  className="w-10 h-10 rounded-lg object-cover border-2 border-[#262b4a] group-hover:border-sky-400 transition-colors"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                                  {o.label}
                                </div>
                                <div className="text-xs text-white/60 truncate mt-0.5">
                                  {o.desc.split(" ").slice(0, 8).join(" ")}...
                                </div>
                              </div>
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Other Navigation Links */}
                  <div className="space-y-1">
                    {navLinks.map((n) => (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        onClick={() => setMob(false)}
                        className={({ isActive }) =>
                          `block py-3 px-4 rounded-xl transition-all font-semibold text-base uppercase tracking-wide ${
                            isActive
                              ? "bg-sky-600 text-white"
                              : "text-white/80 hover:text-white hover:bg-[#1a1d2e]"
                          }`
                        }
                      >
                        {n.label}
                      </NavLink>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#23243a]">
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-medium">
                      © 2024 ALIGNX FITNESS
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Transform Your Life
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
