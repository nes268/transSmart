import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.032,
      delayChildren: 0.08,
    },
  },
};

const letter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const redirect =
      user.role === "shipper"
        ? "/shipper/dashboard"
        : user.role === "transporter"
        ? "/transporter/dashboard"
        : user.role === "admin"
        ? "/admin/dashboard"
        : "/login";
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="landing-page">
      <motion.div
        className="landing-hero"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div
          className="landing-brand"
          variants={letterContainer}
          initial="initial"
          animate="animate"
        >
          {"TransSmart".split("").map((char, i) => (
            <motion.span
              key={i}
              className={`landing-brand-char ${i >= 5 ? "accent" : ""}`}
              variants={letter}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
        <motion.h1
          className="landing-title"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Smart Logistics,
          <br />
          <span>Delivered.</span>
        </motion.h1>
        <motion.p
          className="landing-desc"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Connect shippers with transporters seamlessly. Real-time tracking,
          AI-powered matching, and effortless logistics management.
        </motion.p>
        <motion.div
          className="landing-actions"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Sign In
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="landing-features"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {[
          {
            title: "Live Tracking",
            desc: "Track shipments in real-time with GPS updates and live map views",
          },
          {
            title: "AI Matching",
            desc: "Intelligent transporter-job matching for optimal delivery outcomes",
          },
          {
            title: "Secure Payments",
            desc: "Transparent payment tracking with multiple payment methods supported",
          },
        ].map(({ title, desc }) => (
          <motion.div
            key={title}
            className="landing-feature-card"
            variants={fadeUp}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <div className="landing-feature-title">{title}</div>
            <div className="landing-feature-desc">{desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
