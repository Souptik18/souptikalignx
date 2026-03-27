import React from "react";
import { motion } from "framer-motion";
import bgImage from "../../Images/heropic2.png"; // Ensure this path is correct

export default function InvestPage() {
  // Bullet points data
  const bullets = [
    "The fitness-tech sector is booming as consumers seek personalized, flexible solutions.",
    "Real-time workout & recovery adjustments boost engagement and retention.",
    "Subscriptions, premium features, and B2B partnerships create stable, scalable cash flow.",
    "Experts in AI, UX, and fitness operations with proprietary algorithms and polished UX.",
    "Seamless hardware integration, community features, and analytics place us ahead.",
    "Phased rollout: core personalization engine → equipment partnerships → enterprise dashboards.",
  ];

  // Framer Motion variants
  const textVariant = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const listItemVariant = (i) => ({
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.4 + i * 0.1, duration: 0.5, ease: "easeOut" },
    },
  });

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden bg-black text-white">
      {/* LEFT PANEL: Text Content */}
      <motion.div
        className="relative z-10 md:w-1/2 flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-20 h-1/2 md:h-full"
        variants={textVariant}
        initial="hidden"
        animate="show"
      >
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-wider mb-6 leading-tight">
          Invest in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5c68ff] to-[#b965fc]">
            AlignX
          </span>
        </h1>

        {/* Intro paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
          AlignX is redefining fitness technology with a calm, data-driven
          philosophy—personalizing workouts, recovery, and community experiences
          so users thrive without overload. Join us as a visionary partner.
        </p>

        {/* Bullets: numeric, no boxes */}
        <ul className="space-y-4 mb-10">
          {bullets.map((text, i) => (
            <motion.li
              key={i}
              variants={listItemVariant(i)}
              initial="hidden"
              animate="show"
              className="flex items-start"
            >
              <span className="flex-shrink-0 font-bold text-[#5c68ff] mr-3">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span className="text-white/80">{text}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <motion.a
          href="mailto:invest@alignx.com"
          className="inline-block px-8 py-3 bg-gradient-to-r from-[#5c68ff] to-[#b965fc]
                     text-white font-semibold uppercase tracking-wide rounded-full shadow-lg
                     transition-transform hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { delay: 1.0, duration: 0.5 },
          }}
        >
          Contact to Invest
        </motion.a>
      </motion.div>

      {/* RIGHT PANEL: Full-bleed Background with Slower Zoom */}
      <div className="md:w-1/2 relative h-1/2 md:h-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
          animate={{ scale: [1, 1.04, 1] }} // slightly reduced max scale for subtlety
          transition={{
            duration: 25,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1, // brief pause at peak
            times: [0, 0.5, 1], // symmetric in/out
          }}
        />
        {/* Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  );
}
