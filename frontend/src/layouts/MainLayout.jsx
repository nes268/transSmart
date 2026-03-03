import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </>
  );
}
