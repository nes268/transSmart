import { useState, useEffect } from "react";
import { getAllUsers, toggleBlockUser, deleteUser } from "../services/adminService";
import Loader from "../components/common/Loader";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    try {
      await toggleBlockUser(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: !u.isBlocked } : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Users</h1>
      {error && (
        <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.2)", color: "var(--color-error)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {users.map((u) => (
          <div key={u._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{u.email}</div>
              <span className={`badge badge-${u.role}`} style={{ marginTop: "0.25rem", display: "inline-block" }}>
                {u.role}
              </span>
              {u.isBlocked && <span className="badge badge-accepted" style={{ marginLeft: "0.5rem" }}>Blocked</span>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" style={{ fontSize: "0.8125rem" }} onClick={() => handleBlock(u._id)}>
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
              <button className="btn btn-danger" style={{ fontSize: "0.8125rem" }} onClick={() => handleDelete(u._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
