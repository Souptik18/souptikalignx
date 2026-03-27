// src/pages/Trainings.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Skeleton } from "@mui/material";

/* ---------- DATA (single entry per category) ---------- */
const CLASSES = [
  {
    id: "hiit",
    title: "HIIT Blast",
    tag: "HIIT",
    color: "from-rose-500 via-red-500 to-orange-500",
    intensity: "High",
    duration: "30–40 min",
    desc: "Intervals for fat burn + conditioning: sprints, bodyweight flows.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "zumba",
    title: "Zumba Fusion",
    tag: "Zumba",
    color: "from-amber-400 via-orange-500 to-rose-500",
    intensity: "Moderate",
    duration: "50–60 min",
    desc: "Dance cardio party. Simple moves, big sweat, happy vibes.",
    image:
      "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "group",
    title: "Group Energy",
    tag: "Group",
    color: "from-emerald-400 via-green-500 to-teal-500",
    intensity: "All Levels",
    duration: "45–60 min",
    desc: "Coach-led group sessions for accountability and fun.",
    image:
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "functional",
    title: "Functional Fit",
    tag: "Func",
    color: "from-teal-400 via-cyan-400 to-sky-500",
    intensity: "Moderate",
    duration: "45 min",
    desc: "Kettlebells, carries, core—move better for everyday life.",
    image:
      "https://images.unsplash.com/photo-1554344728-77cf90d9ed26?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "cardio",
    title: "Cardio Endurance",
    tag: "Cardio",
    color: "from-sky-400 via-blue-500 to-indigo-500",
    intensity: "Moderate",
    duration: "40–60 min",
    desc: "Engine work—steady state, intervals, recovery pacing.",
    image:
      "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "stamina",
    title: "Stamina Boost",
    tag: "Stamina",
    color: "from-fuchsia-500 via-pink-500 to-rose-500",
    intensity: "High",
    duration: "35–45 min",
    desc: "Repeatable sets to push threshold and recovery.",
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "perf",
    title: "Performance Plus",
    tag: "Perf",
    color: "from-pink-500 via-rose-500 to-orange-500",
    intensity: "Athlete",
    duration: "60 min",
    desc: "Speed, agility, plyometrics & strength for sport performance.",
    image:
      "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "begin",
    title: "Beginners Journey",
    tag: "Begin",
    color: "from-amber-400 via-yellow-500 to-orange-500",
    intensity: "Beginner",
    duration: "45 min",
    desc: "Form-first, coach-guided path to get started safely.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "core",
    title: "Core Upgrade",
    tag: "Core",
    color: "from-cyan-500 via-sky-500 to-indigo-500",
    intensity: "All Levels",
    duration: "30–40 min",
    desc: "Anti-rotation, carries, breathing to bulletproof your core.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    availability: { online: true, onsite: true },
  },
  {
    id: "pt",
    title: "Personal Training",
    tag: "PT",
    color: "from-indigo-500 via-violet-500 to-fuchsia-500",
    intensity: "Custom",
    duration: "45–60 min",
    desc: "1-on-1 coaching tailored to your goals and schedule.",
    image:
      "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=1600&auto=format&fit=crop",
    availability: { online: false, onsite: true }, // Online not available
  },
];

/* ---------- CHIP ---------- */
const Chip = ({ label, className = "" }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
      className
    }
  >
    {label}
  </span>
);
Chip.propTypes = {
  label: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/* ---------- BACKDROP (grid + glows) ---------- */
function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="80"
              height="80"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute -top-32 -left-16 h-80 w-80 rounded-3xl bg-gradient-to-br from-cyan-500/25 via-sky-400/20 to-transparent blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-3xl bg-gradient-to-bl from-fuchsia-500/25 via-pink-500/20 to-transparent blur-3xl" />
      <div className="absolute bottom-[-6rem] left-1/4 h-80 w-80 rounded-3xl bg-gradient-to-tr from-emerald-400/25 via-teal-400/20 to-transparent blur-3xl" />
    </div>
  );
}

/* ---------- PAGE (no tabs, tags on each card) ---------- */
export default function Trainings() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Sort Online-available first (then title), so users see online-friendly classes sooner
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const sorted = [...CLASSES].sort((a, b) => {
        const aFirst = a.availability.online ? -1 : 0;
        const bFirst = b.availability.online ? -1 : 0;
        return aFirst - bFirst || a.title.localeCompare(b.title);
      });
      setItems(sorted);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const data = useMemo(() => items, [items]);

  return (
    <div className="pt-8 relative min-h-screen w-full bg-gradient-to-b from-[#070b1a] via-[#0b1020] to-[#0e1630] text-white">
      <Backdrop />

      {/* Header */}
      <header className="relative mx-auto max-w-7xl px-4 pt-12 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Trainings & Classes
        </h1>
        <p className="text-white/70 mt-1">
          All categories at a glance. Each card shows{" "}
          <span className="text-cyan-300">Online</span> /{" "}
          <span className="text-white">On-site</span> tags.
        </p>
      </header>

      {/* Grid */}
      <main className="relative mx-auto max-w-7xl px-4 pb-16">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 [grid-auto-rows:1fr]">
            {data.map((c) => (
              <GradientCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- CARD ---------- */
function GradientCard({ c }) {
  const { online, onsite } = c.availability;
  return (
    <div
      className={`p-[1.5px] rounded-3xl bg-gradient-to-br ${c.color} shadow-xl`}
    >
      <div className="group relative h-full overflow-hidden rounded-[calc(theme(borderRadius.3xl)-2px)] bg-[#0b1020]/90 ring-1 ring-white/10">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={c.image}
            alt={c.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-black/10 to-transparent opacity-80" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Chip
              label={c.tag}
              className={`bg-gradient-to-r ${c.color} text-white/95`}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
          <p className="mt-1 text-sm text-white/70 leading-relaxed">{c.desc}</p>

          {/* Availability row */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {/* Online chip */}
            <Chip
              label={
                <span className="flex items-center gap-1">
                  <span className="text-[12px]">{online ? "✓" : "✕"}</span>{" "}
                  Online
                </span>
              }
              className={
                "px-2 py-1 " +
                (online
                  ? "bg-cyan-600/90 text-white"
                  : "bg-white/10 text-white/50 line-through")
              }
            />
            {/* On-site chip */}
            <Chip
              label={
                <span className="flex items-center gap-1">
                  <span className="text-[12px]">{onsite ? "✓" : "✕"}</span>{" "}
                  On-site
                </span>
              }
              className={
                "px-2 py-1 " +
                (onsite
                  ? "bg-white/15 text-white"
                  : "bg-white/10 text-white/50 line-through")
              }
            />

            {/* Meta */}
            <div className="ml-auto flex flex-wrap items-center gap-2 text-white/80">
              <div className="rounded-lg bg-white/10 px-2 py-1">
                {c.duration}
              </div>
              <div className="rounded-lg bg-white/10 px-2 py-1">
                Intensity: {c.intensity}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between">
            <button className="rounded-xl bg-white text-[#0b1020] px-3 py-2 text-sm font-semibold hover:opacity-90">
              Book Trial
            </button>
            <button className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
GradientCard.propTypes = {
  c: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    intensity: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    availability: PropTypes.shape({
      online: PropTypes.bool.isRequired,
      onsite: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

/* ---------- LIGHTER SKELETON GRID ---------- */
function SkeletonGrid() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="p-[1.5px] rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-400"
        >
          <div className="overflow-hidden rounded-[calc(theme(borderRadius.3xl)-2px)] bg-[#0b1020]/50 ring-1 ring-white/10">
            <Skeleton
              variant="rectangular"
              height={198}
              animation="wave"
              sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
            />
            <div className="p-5">
              <Skeleton
                variant="text"
                height={24}
                width="60%"
                animation="wave"
                sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
              />
              <Skeleton
                variant="text"
                height={18}
                width="95%"
                animation="wave"
                sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
              />
              <Skeleton
                variant="text"
                height={18}
                width="85%"
                animation="wave"
                sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
              />
              <div className="mt-3 flex gap-2">
                <Skeleton
                  variant="rounded"
                  height={28}
                  width={90}
                  animation="wave"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                />
                <Skeleton
                  variant="rounded"
                  height={28}
                  width={120}
                  animation="wave"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <Skeleton
                  variant="rounded"
                  height={36}
                  width={100}
                  animation="wave"
                  sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
                />
                <Skeleton
                  variant="rounded"
                  height={36}
                  width={110}
                  animation="wave"
                  sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
