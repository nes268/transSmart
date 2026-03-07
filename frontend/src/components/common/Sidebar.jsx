import { NavLink } from "react-router-dom";

export default function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
