import React from "react";
import { motion } from "framer-motion";

export default function GymLoader() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-6">
      <motion.div
        className="relative w-32 h-32 rounded-full border-8 border-t-transparent border-b-transparent border-purple-500 animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.95, 1.1, 0.95],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <span className="text-white text-xl font-bold tracking-widest">
            GRIND
          </span>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-purple-300 text-sm font-mono tracking-wider uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        Loading ...
      </motion.p>
    </div>
  );
}
