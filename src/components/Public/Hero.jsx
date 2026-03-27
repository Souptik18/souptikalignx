import React from "react";
import { motion } from "framer-motion";
import EliteDifference from "./EliteDifference";
import cardiopic from "../../Images/cardiopic.png";
import workoutpic from "../../Images/workout1.png";
import pic from "../../Images/pic.png";
import pic1 from "../../Images/pic1.png";
import { Link } from "react-router-dom";
// Sample images/data
const heropic =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop";
const stats = [
  { number: "1K+", label: "Lives Transformed" },
  { number: "99%", label: "Success Stories" },
  { number: "10+", label: "Years of Experience" },
  { number: "5+", label: " Certified Trainers" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const slideIn = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Hero() {
  return (
    <div className="w-full min-h-screen bg-black snap-y snap-mandatory scroll-pt-16">
      {/* HERO SECTION */}
      <section className="overflow-hidden snap-start relative w-full h-screen flex items-center justify-center">
        {/* BG with slow zoom in-out */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${workoutpic})` }}
          initial={{ scale: 1 }}
          animate={{ scale: [0.99, 1.08, 1] }}
          transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-4xl">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider leading-tight mb-6"
              variants={fadeUp}
            >
              <span className="inline-block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Revealing
              </span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
                // No animate or transition here
              >
                Excellence
              </span>
            </motion.h1>

            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8 text-white/90"
              variants={fadeUp}
            >
              Highlighting Character
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-3xl"
              variants={fadeUp}
            >
              Join the movement transforming fitness and mindset—where
              high-achievers converge to push boundaries and redefine success.
            </motion.p>
            <Link to="/equipments">
              {" "}
              <motion.button
                className="group relative inline-flex items-center px-12 py-4 bg-transparent border-2 border-white rounded-full uppercase tracking-widest font-bold text-white text-lg overflow-hidden"
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-green-500">
                  Check Equipements
                </span>

                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
      {/* ELITE DIFFERENCE (fills parent) */}
      <section className="snap-start w-full h-screen relative">
        <EliteDifference />
      </section>
      {/* STATS SECTION */}
      <section className="snap-start relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* BG photo + dark veil */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pic})` }}
        />
        <div className="absolute inset-0 bg-black/70" />

        {/* Stats grid */}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center group"
                variants={fadeUp}
                whileHover={{ scale: 1.1, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.span
                  className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4 group-hover:from-white group-hover:to-gray-300 transition-all duration-300"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {s.number}
                </motion.span>
                <span className="text-lg md:text-xl text-white/80 font-medium uppercase tracking-wider text-center group-hover:text-white transition-colors duration-300">
                  {s.label}
                </span>
                <motion.div className="w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 mt-2 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="snap-start relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* BG picture with gentle zoom */}
        <motion.img
          src={pic1}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/70 to-pink-900/30"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          {/* IMAGE CARD */}
          <motion.div
            className="lg:w-1/2 w-full h-96 lg:h-[600px] relative overflow-hidden rounded-2xl group"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.img
              src={cardiopic}
              alt="Personal Training"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 group-hover:from-black/40 transition-all duration-500" />
            <motion.div
              className="absolute top-8 left-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Live
            </motion.div>
          </motion.div>

          {/* TEXT SIDE */}
          <motion.div
            className="lg:w-1/2 w-full space-y-8"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-wider leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Personal
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Training
              </span>
            </h3>

            {[
              "1:1 Online Coaching",
              "In-Person Sessions",
              "6-Week Challenge",
              "Nutrition & Recovery Guidance",
            ].map((t, i) => (
              <div key={t} className="flex items-center space-x-4 group">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.div>
                <span className="text-xl lg:text-2xl text-white/90 group-hover:text-white transition-colors duration-300">
                  {t}
                </span>
              </div>
            ))}

            <Link to="/register">
              <motion.button
                className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold uppercase tracking-widest rounded-full text-lg overflow-hidden shadow-2xl"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(168,85,247,.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {" "}
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
