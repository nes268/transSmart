import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Bell,
  Star,
  Sparkles,
} from "lucide-react";

const links = [
  { to: "/shipper/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/shipper/jobs/new", label: "Create Job", icon: <PlusCircle size={18} /> },
  { to: "/shipper/jobs", label: "My Jobs", icon: <Package size={18} /> },
  { to: "/shipper/trucks", label: "Browse Trucks", icon: <Truck size={18} /> },
  { to: "/shipper/trips", label: "My Trips", icon: <MapPin size={18} /> },
  { to: "/payments", label: "Payments", icon: <CreditCard size={18} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { to: "/reviews", label: "Reviews", icon: <Star size={18} /> },
  { to: "/ai", label: "AI Tools", icon: <Sparkles size={18} /> },
];

export default function ShipperLayout() {
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
