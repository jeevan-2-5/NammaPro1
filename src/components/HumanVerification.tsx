import React, { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface HumanVerificationProps {
  onVerify: (verified: boolean) => void;
  actionLabel?: string;
}

export default function HumanVerification({ onVerify, actionLabel = "proceed" }: HumanVerificationProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [slideUnlocked, setSlideUnlocked] = useState(false);

  const generateChallenge = () => {
    const n1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
    const n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const correctAnswer = n1 + n2;

    // Generate 3 unique wrong options
    const wrongOptions = new Set<number>();
    while (wrongOptions.size < 3) {
      const wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      if (wrong !== correctAnswer && wrong > 0) {
        wrongOptions.add(wrong);
      }
    }

    // Combine and shuffle
    const allOptions = [correctAnswer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);

    setNum1(n1);
    setNum2(n2);
    setOptions(allOptions);
    setSelectedOption(null);
    setSlideProgress(0);
    setSlideUnlocked(false);
    onVerify(false);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleSelectOption = (opt: number) => {
    setSelectedOption(opt);
    const isMathCorrect = opt === (num1 + num2);
    
    // If math is correct and we've already unlocked slide, or if we want to require slide next
    if (isMathCorrect && slideUnlocked) {
      onVerify(true);
    } else if (!isMathCorrect) {
      onVerify(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSlideProgress(val);
    
    if (val >= 95) {
      setSlideProgress(100);
      setSlideUnlocked(true);
      const isMathCorrect = selectedOption === (num1 + num2);
      if (isMathCorrect) {
        onVerify(true);
      }
    }
  };

  const handleSliderRelease = () => {
    setIsSliding(false);
    if (slideProgress < 95) {
      setSlideProgress(0);
      setSlideUnlocked(false);
      onVerify(false);
    }
  };

  const isMathCorrect = selectedOption === (num1 + num2);
  const isFullyVerified = isMathCorrect && slideUnlocked;

  return (
    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-blue-500 animate-pulse" />
        </div>
        <button
          type="button"
          id="refresh-captcha-btn"
          onClick={generateChallenge}
          className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Refresh challenge"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Step 1: Solving the Simple Math Expression */}
        <div className="bg-white/40 dark:bg-slate-900/35 p-3 rounded-xl border border-slate-200/40 dark:border-white/5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1">
            <span>Step 1: Solve to authenticate</span>
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wider">
              {num1} + {num2} = ?
            </span>
            <div className="flex gap-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  id={`captcha-opt-${opt}`}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-9 h-9 rounded-lg border text-xs font-bold font-mono transition-all duration-200 ${
                    selectedOption === opt
                      ? opt === (num1 + num2)
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                      : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Slider to Lock/Verify */}
        <div className={`p-3 rounded-xl border transition-all ${
          isMathCorrect 
            ? "bg-white/40 dark:bg-slate-900/35 border-slate-200/40 dark:border-white/5 opacity-100" 
            : "opacity-60 pointer-events-none"
        }`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            Step 2: Slide to unlock secure gateway
          </p>

          <div className="relative h-10 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/40 dark:border-white/5 flex items-center justify-center overflow-hidden">
            {/* Dynamic Sliding Background Fill */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-500/15 dark:bg-blue-500/10 transition-all duration-75"
              style={{ width: `${slideProgress}%` }}
            />

            {/* Central Guide Text */}
            <span className="absolute text-[11px] font-bold tracking-wide pointer-events-none text-slate-400 dark:text-slate-500 uppercase select-none">
              {slideUnlocked ? "Gateway Securely Unlocked" : "Slide handler to right ➔"}
            </span>

            {/* Real Slider Input overlay */}
            <input
              type="range"
              id="captcha-slider"
              min="0"
              max="100"
              value={slideProgress}
              onChange={handleSliderChange}
              onMouseDown={() => setIsSliding(true)}
              onTouchStart={() => setIsSliding(true)}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              disabled={!isMathCorrect || slideUnlocked}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            {/* Custom slider drag handle element */}
            <div 
              className={`absolute left-1 top-1 bottom-1 w-8 rounded-lg flex items-center justify-center shadow-md border transition-all duration-75 ${
                slideUnlocked
                  ? "bg-emerald-500 border-emerald-600 text-white"
                  : isMathCorrect
                    ? "bg-blue-600 border-blue-700 text-white"
                    : "bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700 text-slate-400"
              }`}
              style={{ 
                left: `calc(${slideProgress}% - ${slideProgress * 0.32}px)`,
                transform: `scale(${isSliding ? 1.05 : 1})`
              }}
            >
              {slideUnlocked ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
