import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Replace with your actual images/descriptions
const eliteItems = [
  {
    title: "Our Coaches",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop",
    desc: "Meet our expert team, each dedicated to personalized results and continuous improvement.",
  },
  {
    title: "Engineered Results",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    desc: "Trained, educated, and backed by our Health Advisory Board, our coaches are certified to develop programs for total body conditioning, specialized needs, and advanced health optimization.",
  },
  {
    title: "The EQX OS",
    image:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=1594&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "A holistic system for managing your training and progress with intelligent adjustments at every stage.",
  },
  {
    title: "The Equifit",
    image:
      "https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Equifit is the first step in understanding and maximizing your potential. Our coaches use this protocol to develop performance plans tailored to individual needs, wants, and goals. Assessments can be done every six months to track improvement and tailor programs during the lifelong fitness journey.",
  },
];

export default function EliteDifference() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const ease = [0.42, 0, 0.58, 1]; // ease-in-out cubic-bezier

  const descVariants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.6, ease } },
  };

  const imgVariants = {
    initial: { opacity: 0, scale: 1.04 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.8, ease } },
  };

  // Auto-advance every 5s
  useEffect(() => {
    startAuto();
    return () => clearInterval(intervalRef.current);
  }, []);

  // Restart auto-advance when active changes
  useEffect(() => {
    // clear & restart so that click resets timer
    clearInterval(intervalRef.current);
    startAuto();
  }, [active]);

  const startAuto = () => {
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % eliteItems.length);
    }, 5000);
  };

  const handleClick = (idx) => {
    setActive(idx);
    // auto-advance will restart via the useEffect above
  };

  return (
    <section
      className="w-full h-screen flex bg-black overflow-hidden"
      style={{ fontFamily: "Inter, Arial, sans-serif" }}
    >
      {/* Left: Titles & Descriptions */}
      <div
        className="w-full max-w-[430px] flex flex-col px-8 justify-center"
        style={{
          minWidth: 300,
          height: "100%",
        }}
      >
        <h2
          className="text-[2.1rem] sm:text-4xl md:text-5xl font-black text-white mb-7 leading-tight mt-2"
          style={{
            letterSpacing: -2,
            lineHeight: 1.1,
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          WE ARE <br />
          <span className="text-sky-500"> ALIGNX </span>.
        </h2>
        <div className="flex flex-col gap-0">
          {eliteItems.map((item, idx) => (
            <motion.div
              key={item.title}
              layout // ← smooth height / position tween
              transition={{ layout: { duration: 0.4 } }}
              className={`py-5 border-b border-neutral-700 cursor-pointer group ${
                active === idx ? "bg-white/5" : ""
              }`}
              onClick={() => setActive(idx)}
            >
              <span
                className={`block text-lg md:text-xl lg:text-2xl ${
                  active === idx
                    ? "text-white"
                    : "text-neutral-400 group-hover:text-white"
                }`}
              >
                {item.title}
              </span>

              <AnimatePresence initial={false}>
                {active === idx && (
                  <motion.p
                    key="desc"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-2 text-sm md:text-base text-neutral-300 leading-relaxed pr-2"
                  >
                    {item.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Image */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={eliteItems[active].image}
            src={eliteItems[active].image}
            alt={eliteItems[active].title}
            variants={imgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              active === 0
                ? "linear-gradient(90deg, rgba(1,52,139,0.32) 0%, rgba(0,0,0,0.22) 100%)"
                : active === 1
                ? "linear-gradient(90deg, rgba(204,37,0,0.26) 0%, rgba(0,0,0,0.18) 100%)"
                : "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      </div>
    </section>
  );
}
