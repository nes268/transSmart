import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const links = [
  { to: "/transporter/dashboard", label: "Dashboard" },
  { to: "/transporter/jobs", label: "Browse Jobs" },
  { to: "/transporter/trucks", label: "My Trucks" },
  { to: "/transporter/trips", label: "My Trips" },
  { to: "/invoices", label: "Invoices" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ai", label: "AI Tools" },
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
