import { useEffect } from "react";
import { motion } from "framer-motion";

const letterVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
      delay: 0.05 + i * 0.04,
    },
  }),
};

const accentLetterVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
      delay: 0.25 + i * 0.04,
    },
  }),
};

const taglineVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const barVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const TOTAL_DURATION_MS = 3200; // Time before calling onComplete

export default function LoadingWizard({ onComplete }) {
  const word = "TransSmart";
  const splitIndex = 5; // "Trans" vs "Smart"

  useEffect(() => {
    const t = setTimeout(() => {
      onComplete?.();
    }, TOTAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
        className="loading-wizard"
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
      >
        <div className="loading-wizard-bg" />

        <motion.div
          className="loading-wizard-content"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="loading-wizard-brand" variants={{}}>
            {word.split("").map((char, i) => (
              <motion.span
                key={i}
                className={`loading-wizard-char ${i >= splitIndex ? "accent" : ""}`}
                custom={i}
                variants={i < splitIndex ? letterVariants : accentLetterVariants}
                style={{ originY: 1 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            className="loading-wizard-tagline"
            variants={taglineVariants}
          >
            Smart Logistics, Delivered
          </motion.p>

          <motion.div
            className="loading-wizard-bar"
            variants={barVariants}
            style={{ originX: 0 }}
          />
        </motion.div>
      </motion.div>
  );
}
