import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout() {
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
