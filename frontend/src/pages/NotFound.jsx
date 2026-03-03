import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <p style={{ color: "var(--color-text-muted)", fontSize: "1.125rem" }}>
        This page doesn't exist
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
        <ArrowLeft size={16} />
        Go Home
      </Link>
    </div>
  );
}
