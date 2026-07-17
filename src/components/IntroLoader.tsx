import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Droplets, Brush, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

interface IntroLoaderProps {
  onComplete: () => void;
  key?: React.Key;
}

export function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "complete">("loading");

  // Word letters for "NAMMAPRO"
  const letters = [
    { char: "N", color: "text-yellow-500" },
    { char: "A", color: "text-yellow-500" },
    { char: "M", color: "text-yellow-500" },
    { char: "M", color: "text-yellow-500" },
    { char: "A", color: "text-yellow-500" },
    { char: "P", color: "text-red-500" },
    { char: "R", color: "text-red-500" },
    { char: "O", color: "text-red-500" },
  ];

  // Pictures of Plumber, Electrician, Cleaner
  const serviceCards = [
    {
      id: "plumber",
      title: "Master Plumber",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=80",
      icon: <Droplets className="w-4 h-4 text-blue-400" />,
      colorClass: "border-blue-500/30 shadow-blue-500/10",
      badge: "Water & Piping Expert",
      rotation: -8,
      delay: 1.0,
      xOffset: -120,
    },
    {
      id: "electrician",
      title: "Certified Electrician",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      colorClass: "border-yellow-500/30 shadow-yellow-500/10",
      badge: "High-Voltage Specialist",
      rotation: 8,
      delay: 1.3,
      xOffset: 120,
    },
    {
      id: "cleaner",
      title: "Premium Home Cleaner",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80",
      icon: <Brush className="w-4 h-4 text-emerald-400" />,
      colorClass: "border-emerald-500/30 shadow-emerald-500/10",
      badge: "Deep-Sanitization Pro",
      rotation: -3,
      delay: 1.6,
      xOffset: 0,
    }
  ];

  useEffect(() => {
    // Increment loading progress smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("complete");
          // Smooth auto enter after a small delay once loading completes
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        const diff = Math.random() * 12 + 6;
        return Math.min(prev + diff, 100);
      });
    }, 220);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 text-white z-50 flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Cinematic Ambient Glowing Background rings */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-yellow-500/10 to-transparent blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-red-600/10 to-transparent blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(2,6,23,1)_100%)] pointer-events-none" />

      {/* Grid Pattern overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center space-y-12">
        
        {/* TOP STATUS BAR */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-400 font-semibold uppercase tracking-widest shadow-lg"
        >
          <ShieldCheck className="w-4 h-4 text-yellow-500 animate-spin" style={{ animationDuration: "3s" }} />
          <span>NammaPro Core Engine Initializing</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
        </motion.div>

        {/* 1. DROP-DOWN ALPHABETS OF "NAMMAPRO" WITH 3D CAST SHADOW EFFECT */}
        <div className="flex items-center gap-1.5 sm:gap-3.5 select-none" id="intro-letters-container">
          {letters.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -350, rotateX: 90, scale: 0.4 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                rotateX: 0, 
                scale: 1,
                textShadow: "0 8px 16px rgba(0, 0, 0, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)" 
              }}
              transition={{
                type: "spring",
                stiffness: 110,
                damping: 12,
                delay: i * 0.1,
              }}
              className={`text-3xl min-[360px]:text-4xl sm:text-7xl md:text-8xl font-black tracking-tight sm:tracking-tighter ${l.color} select-none transform transition-transform cursor-default`}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.15, rotateY: 15, z: 20 }}
            >
              {l.char}
            </motion.div>
          ))}
        </div>

        {/* 2. DROP-DOWN 3D PICTURE CARDS (PLUMBER, ELECTRICIAN, CLEANER) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-3xl pt-4 pb-2 relative">
          <AnimatePresence>
            {serviceCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: -400, rotate: card.rotation * 2, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  rotate: card.rotation,
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 14,
                  delay: card.delay,
                }}
                whileHover={{ 
                  scale: 1.06, 
                  rotate: 0, 
                  zIndex: 20,
                  boxShadow: "0 25px 50px -12px rgba(234, 179, 8, 0.25)"
                }}
                className={`relative bg-slate-900/90 border ${card.colorClass} rounded-2xl p-2 sm:p-3 shadow-2xl flex flex-col gap-1.5 sm:gap-2.5 overflow-hidden group select-none backdrop-blur-md`}
                style={{
                  perspective: "800px",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Unsplash Image Container */}
                <div className="relative w-full h-14 sm:h-28 rounded-xl overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category icon badge */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-slate-950/80 border border-white/10 p-0.5 sm:p-1.5 rounded-md sm:rounded-lg z-20 shadow-md scale-75 sm:scale-100">
                    {card.icon}
                  </div>
                </div>

                {/* Card description details */}
                <div className="text-left space-y-0.5 sm:space-y-1">
                  <span className="text-[7px] sm:text-[9px] font-mono font-bold text-yellow-500 uppercase tracking-widest block truncate">{card.badge}</span>
                  <h3 className="text-[10px] sm:text-xs font-bold text-white flex items-center gap-1 sm:gap-1.5 truncate">
                    {card.title}
                  </h3>
                </div>

                {/* Light reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 3. MODERN GLOWING PROGRESS CHARGER */}
        <div className="w-full max-w-md space-y-3 pt-6">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 font-mono">
              <motion.svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-yellow-500 fill-current"
                animate={{
                  rotate: progress >= 100 ? [0, 360, 720] : [0, 360],
                  scale: progress >= 100 ? [1, 1.6, 1.35] : [1, 1.25, 1],
                  filter: progress >= 100 
                    ? [
                        "drop-shadow(0 0 4px rgba(234, 179, 8, 0.6))",
                        "drop-shadow(0 0 16px rgba(255, 255, 255, 1))",
                        "drop-shadow(0 0 8px rgba(234, 179, 8, 0.95))"
                      ]
                    : [
                        "drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))",
                        "drop-shadow(0 0 10px rgba(234, 179, 8, 0.85))",
                        "drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))"
                      ]
                }}
                transition={{
                  rotate: {
                    repeat: Infinity,
                    duration: progress >= 100 ? 1.2 : 4.5,
                    ease: "linear"
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  },
                  filter: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </motion.svg>
              {progress < 40 
                ? "Connecting service professionals..." 
                : progress < 75 
                ? "Securing satisfaction insurance guarantee..." 
                : "Polishing user control panel..."}
            </span>
            <span className="font-bold text-yellow-500 font-mono text-sm">{Math.floor(progress)}%</span>
          </div>

          <div className="relative w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden shadow-inner">
            {/* Glowing active bar */}
            <motion.div
              id="intro-progress-bar"
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-red-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
            {/* Secondary moving laser pulse */}
            <div 
              className="absolute h-full w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm animate-[shimmer_1.5s_infinite]"
              style={{ left: `${progress - 20}%` }}
            />
          </div>
        </div>

        {/* SKIP INTRO DIRECT ROUTE ACTION BUTTON */}
        <motion.button
          id="skip-intro-btn"
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className="text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer select-none bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 shadow-sm"
        >
          <span>Skip Intro & Enter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>

      </div>
    </div>
  );
}
