import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="page-content" style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </>
  );
}
