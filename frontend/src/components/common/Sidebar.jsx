import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const baseLinkStyle = {
  display: "block",
  padding: "0.75rem 1rem",
  color: "var(--color-text-muted)",
  borderRadius: "var(--radius)",
  marginBottom: "0.25rem",
  transition: "all 0.2s",
};

const activeStyle = {
  ...baseLinkStyle,
  background: "var(--color-primary)",
  color: "var(--color-bg)",
};

export default function Sidebar({ links }) {
  return (
    <aside
      style={{
        width: "240px",
        minHeight: "calc(100vh - 60px)",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "1rem",
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => (isActive ? activeStyle : baseLinkStyle)}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
