import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
} from "lucide-react";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { to: "/admin/jobs", label: "Jobs", icon: <Package size={18} /> },
  { to: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
];

export default function AdminLayout() {
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
