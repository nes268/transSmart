import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const links = [
  { to: "/transporter/dashboard", label: "Dashboard" },
  { to: "/transporter/jobs", label: "Browse Jobs" },
  { to: "/transporter/trucks", label: "My Trucks" },
  { to: "/transporter/trips", label: "My Trips" },
  { to: "/payments", label: "Payments" },
  { to: "/notifications", label: "Notifications" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ai", label: "AI Tools" },
];

export default function TransporterLayout() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar links={links} />
        <main style={{ flex: 1, padding: "1.5rem", overflow: "auto" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
