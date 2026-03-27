import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import equip from "../../Images/equip.png"; // for CTA slide
import { Link } from "react-router-dom";
const ZONES = [
  {
    title: "CARDIO BEAST",
    subtitle: "BURN • SWEAT • CONQUER",
    gradient: "from-[#202343] via-[#353869] to-[#567fff]",
    items: [
      "High-Tech Treadmills with VR Integration",
      "Combat-Grade Ellipticals",
      "Racing Bikes with Live Competition",
      "Rowing Machines for Champions",
    ],
  },
  {
    title: "STRENGTH GYM",
    subtitle: "LIFT • GROW • DOMINATE",
    gradient: "from-[#3c1e61] via-[#6327a5] to-[#8f5cff]",
    items: [
      "Olympic Barbell Arsenal",
      "Monster Cable Systems",
      "Free-Weight Fortress",
      "Power Rack Kingdom",
    ],
  },
  {
    title: "FUNCTIONAL WAR",
    subtitle: "MOVE • ADAPT • SURVIVE",
    gradient: "from-[#11384b] via-[#18578a] to-[#23a4fa]",
    items: [
      "Battle Rope Arena",
      "TRX Suspension Combat",
      "Kettlebell Battlefield",
      "Plyometric Launch Pads",
    ],
  },
  {
    title: "RECOVERY ZONE",
    subtitle: "HEAL • RESTORE • RISE",
    gradient: "from-[#272843] via-[#2d4a6e] to-[#96a6be]",
    items: [
      "Cryotherapy Chambers",
      "Infrared Sauna Pods",
      "Massage Therapy Stations",
      "Meditation Sanctuary",
    ],
  },
];
/* Framer Motion Variants */
const slideVar = {
  hidden: { opacity: 0, y: 80 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const listWrap = {
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};
const listItem = {
  hidden: { opacity: 0, scale: 1.24, rotate: -7 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 220, damping: 15 },
  },
};

export default function EquipmentsPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  const { scrollY } = useScroll();

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;}
      `}</style>
      <main
        className="no-scrollbar relative snap-y snap-mandatory scroll-smooth text-white
                   overflow-y-scroll overflow-x-hidden bg-[#10121d]"
        style={{ height: "100vh" }}
      >
        {/* Faint grid overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), " +
              "linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Premium, blurred blobs (blue/violet, not green) */}
        <ParallaxBlob
          gradient="bg-gradient-to-br from-[#5c68ff] to-[#9d7aff]"
          size={420}
          left="-15vw"
          yFactor={0.14}
          scrollY={scrollY}
        />
        <ParallaxBlob
          gradient="bg-gradient-to-br from-[#5dfdcb] to-[#2176ff]"
          size={480}
          left="60vw"
          yFactor={0.28}
          scrollY={scrollY}
        />

        {/* Slides */}
        {ZONES.map((z, i) => (
          <ZoneSlide key={i} data={z} />
        ))}

        {/* CTA */}
        <CTASlide />
      </main>
    </>
  );
}

/* ──────────── COMPONENTS ──────────── */
function ZoneSlide({ data }) {
  const ref = useRef(null);
  const rotX = useSpring(0, { stiffness: 140, damping: 18 });
  const rotY = useSpring(0, { stiffness: 140, damping: 18 });

  return (
    <section className="snap-start h-screen flex items-center justify-center px-4">
      <motion.div
        ref={ref}
        onMouseMove={(e) => {
          const { left, top, width, height } =
            ref.current.getBoundingClientRect();
          const px = (e.clientX - left) / width - 0.5;
          const py = (e.clientY - top) / height - 0.5;
          rotX.set(py * 12);
          rotY.set(-px * 12);
        }}
        onMouseLeave={() => {
          rotX.set(0);
          rotY.set(0);
        }}
        style={{ rotateX: rotX, rotateY: rotY, perspective: 1600 }}
        variants={slideVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.32 }}
        className="group relative w-full max-w-5xl md:w-4/6 p-8 md:p-16
                   bg-white/10 backdrop-blur-[7px] rounded-3xl
                   shadow-[0_30px_70px_-18px_rgba(27,28,58,0.86)] border border-white/10
                   transition-all"
      >
        {/* Premium gradient border glow */}
        <motion.div
          animate={{ opacity: [0.34, 0.7, 0.34] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -inset-[3px] rounded-3xl pointer-events-none z-0
                      bg-gradient-to-br ${data.gradient} blur-[3px]`}
        />

        {/* Hover overlay */}
        <motion.div
          whileHover={{ opacity: 0.14, scale: 1.02 }}
          className="absolute inset-0 rounded-3xl bg-white/10 opacity-0
                     transition-all duration-300 pointer-events-none z-10"
        />

        <div className="relative z-20">
          <header className="text-center mb-10 md:mb-14">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-[.20em] uppercase drop-shadow text-white">
              {data.title}
            </h2>
            <p className="text-xl md:text-2xl font-semibold tracking-[.22em] text-[#b3bbef] mt-1">
              {data.subtitle}
            </p>
          </header>
          <motion.ul
            variants={listWrap}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6 text-lg md:text-xl font-semibold"
          >
            {data.items.map((item, i) => (
              <motion.li
                key={i}
                variants={listItem}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgba(92,104,255,0.12)",
                }}
                whileTap={{ scale: 0.96 }}
                className="flex gap-4 px-5 py-3 rounded-xl bg-white/8 backdrop-blur-[2px] transition-all"
              >
                <span className="text-2xl font-extrabold text-[#5c68ff]">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span className="text-gray-100">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}

function ParallaxBlob({ gradient, size, left, yFactor, scrollY }) {
  const y = useTransform(scrollY, (v) => v * yFactor);
  return (
    <motion.div
      style={{ y, left, width: size, height: size }}
      className={`fixed top-0 pointer-events-none opacity-25 blur-3xl
                  ${gradient} rounded-full z-10`}
    />
  );
}

function CTASlide() {
  const fx = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="snap-start" style={ctaStyles.section}>
      <motion.img
        src={equip}
        alt="Unleash the Beast"
        style={ctaStyles.poster}
        initial={{ scale: 1.13, opacity: 0.86 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <div style={ctaStyles.overlay} />
      <motion.div
        variants={fx}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={ctaStyles.content}
      >
        <h2 style={ctaStyles.headline}>UNLEASH&nbsp;THE&nbsp;BEAST</h2>
        <Link to="/register">
          <motion.button
            whileHover={{ scale: 1.14, rotate: -2 }}
            whileTap={{ scale: 0.96, rotate: 0 }}
            style={{
              ...ctaStyles.button,
              background: "linear-gradient(90deg,#5c68ff 20%,#b965fc 100%)",
              boxShadow: "0 10px 22px rgba(92,104,255,0.38)",
            }}
          >
            JOIN&nbsp;NOW
          </motion.button>
        </Link>
        <p style={ctaStyles.subcopy}>NO LIMITS • NO EXCUSES • NO MERCY</p>
      </motion.div>
    </section>
  );
}

// CTA styles
const ctaStyles = {
  section: {
    position: "relative",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "#151726",
  },
  poster: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.85,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom,rgba(21,23,38,0.96)0%,rgba(21,23,38,0.18)50%,rgba(21,23,38,0.97)100%)",
    mixBlendMode: "multiply",
  },
  content: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    padding: "0 1.5rem",
  },
  headline: {
    margin: 0,
    color: "#5c68ff",
    fontSize: "clamp(2.75rem,6vw,4.5rem)",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textShadow: "0 3px 8px rgba(0,0,0,0.85)",
    textTransform: "uppercase",
  },
  button: {
    padding: "1.2rem 3rem",
    border: 0,
    borderRadius: "9999px",
    color: "#fff",
    fontSize: "1.45rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    cursor: "pointer",
    outline: "none",
    borderStyle: "none",
  },
  subcopy: {
    margin: 0,
    color: "#e6e8f7",
    fontSize: "1.08rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
};
