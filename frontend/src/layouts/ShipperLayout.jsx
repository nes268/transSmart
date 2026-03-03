import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const links = [
  { to: "/shipper/dashboard", label: "Dashboard" },
  { to: "/shipper/jobs/new", label: "Create Job" },
  { to: "/shipper/jobs", label: "My Jobs" },
  { to: "/shipper/trips", label: "My Trips" },
  { to: "/payments", label: "Payments" },
  { to: "/notifications", label: "Notifications" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ai", label: "AI Tools" },
];

export default function ShipperLayout() {
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
