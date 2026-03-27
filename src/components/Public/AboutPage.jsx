import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import bgImg from "../../Images/aboutimage.png";

export default function AboutPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#000] text-white">
      {/* LEFT: Content */}
      <motion.div
        className="md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-[.18em] mb-6"
          style={{ letterSpacing: ".12em" }}
        >
          Elevate your
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5c68ff] to-[#b965fc]">
            experience
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-light max-w-xl mb-8 leading-snug">
          Where <AnimatedWord word="community" color="#5c68ff" /> meets{" "}
          <AnimatedWord word="performance" color="#b965fc" />
        </p>
        <div className="space-y-4 mb-10 max-w-md">
          {[
            "Custom plans & real-time tracking",
            "Premium group training, no-ego culture",
            "Elite recovery: cryo, sauna, meditation",
            "All levels welcome, zero judgment",
          ].map((text, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
            >
              <span className="font-bold text-xl text-[#5c68ff]">{i + 1}.</span>
              <span className="font-medium">{text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex space-x-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <NavLink to="/invest" className="group">
            <button className="px-8 py-3 bg-gradient-to-r from-[#5c68ff] to-[#b965fc] rounded-full text-white font-semibold tracking-wide uppercase transition-transform group-hover:scale-105 shadow-lg">
              Invest
            </button>
          </NavLink>
          <NavLink to="/register" className="group">
            <button className="px-8 py-3 border-2 border-white rounded-full text-white font-semibold tracking-wide uppercase transition-transform group-hover:scale-105">
              Visit
            </button>
          </NavLink>
        </motion.div>
      </motion.div>

      {/* RIGHT: Image */}
      <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
        <motion.img
          src={bgImg}
          alt="Gym background"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
  );
}

// Pulsing accent words
function AnimatedWord({ word, color }) {
  return (
    <motion.span
      style={{ color }}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className="font-bold"
    >
      {word}
    </motion.span>
  );
}
