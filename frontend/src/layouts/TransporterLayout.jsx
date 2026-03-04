import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import {
  LayoutDashboard,
  Search,
  Truck,
  MapPin,
  CreditCard,
  Bell,
  Star,
  Sparkles,
  User,
  Send,
} from "lucide-react";

const links = [
  { to: "/transporter/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/transporter/profile", label: "Profile", icon: <User size={18} /> },
  { to: "/transporter/jobs", label: "Browse Jobs", icon: <Search size={18} /> },
  { to: "/transporter/trucks", label: "My Trucks", icon: <Truck size={18} /> },
  { to: "/transporter/requests", label: "Requests", icon: <Send size={18} /> },
  { to: "/transporter/trips", label: "My Trips", icon: <MapPin size={18} /> },
  { to: "/payments", label: "Payments", icon: <CreditCard size={18} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { to: "/reviews", label: "Reviews", icon: <Star size={18} /> },
  { to: "/ai", label: "AI Tools", icon: <Sparkles size={18} /> },
];

export default function TransporterLayout() {
  return (
    <>
      <Navbar />
      <div className="page-layout">
        <Sidebar links={links} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
