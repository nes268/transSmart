import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../hooks/useAuth";

const shipperLinks = [
  { to: "/shipper/dashboard", label: "Dashboard", end: true },
  { to: "/shipper/jobs", label: "My Jobs", end: true },
  { to: "/shipper/trucks", label: "Browse Trucks" },
  { to: "/payments", label: "Payments" },
  { to: "/invoices", label: "Invoices" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ai", label: "AI Tools" },
];

const transporterLinks = [
  { to: "/transporter/dashboard", label: "Dashboard" },
  { to: "/transporter/jobs", label: "Browse Jobs" },
  { to: "/transporter/trucks", label: "My Trucks" },
  { to: "/transporter/trips", label: "My Trips" },
  { to: "/invoices", label: "Invoices" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ai", label: "AI Tools" },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/invoices", label: "Invoices" },
];

export default function MainLayout() {
  const { user } = useAuth();
  const links =
    user?.role === "transporter"
      ? transporterLinks
      : user?.role === "admin"
        ? adminLinks
        : shipperLinks;

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
