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
          {link.icon && <span className="sidebar-link-icon">{link.icon}</span>}
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
