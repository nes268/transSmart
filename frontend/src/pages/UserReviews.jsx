import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserReviews } from "../services/reviewService";
import Loader from "../components/common/Loader";

export default function UserReviews() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserReviews(userId)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader />;
  if (!data) return <div style={{ color: "var(--color-error)" }}>Failed to load reviews</div>;

  const { averageRating, count, data: reviews } = data;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem", background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer" }}>← Back</button>
      <h1 style={{ marginBottom: "1rem" }}>Reviews</h1>
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>{averageRating} ★</div>
        <div style={{ color: "var(--color-text-muted)" }}>{count} review{count !== 1 ? "s" : ""}</div>
      </div>

      {reviews.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>No reviews yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600 }}>{r.reviewer?.name || "Anonymous"}</span>
                <span style={{ color: "var(--color-primary)" }}>{r.rating} ★</span>
              </div>
              {r.comment && <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{r.comment}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
