import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Truck, MapPin, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import CursorTip from "../components/common/CursorTip";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
      <CursorTip />
      <motion.div
        className="landing-hero"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div
          className="landing-logo"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Truck size={28} />
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
            icon: MapPin,
            title: "Live Tracking",
            desc: "Track shipments in real-time with GPS updates and live map views",
            iconStyle: { background: "var(--color-primary-light)", color: "var(--color-primary)" },
          },
          {
            icon: Sparkles,
            title: "AI Matching",
            desc: "Intelligent transporter-job matching for optimal delivery outcomes",
            iconStyle: { background: "var(--color-accent-light)", color: "var(--color-accent)" },
          },
          {
            icon: Shield,
            title: "Secure Payments",
            desc: "Transparent payment tracking with multiple payment methods supported",
            iconStyle: { background: "var(--color-success-light)", color: "var(--color-success)" },
          },
        ].map(({ icon: Icon, title, desc, iconStyle }) => (
          <motion.div
            key={title}
            className="landing-feature-card"
            variants={fadeUp}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -4,
              transition: { duration: 0.2 },
            }}
          >
            <div className="landing-feature-icon" style={iconStyle}>
              <Icon size={20} />
            </div>
            <div className="landing-feature-title">{title}</div>
            <div className="landing-feature-desc">{desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
