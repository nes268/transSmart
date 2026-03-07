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
      <div className="page-layout">
        <Sidebar links={links} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
