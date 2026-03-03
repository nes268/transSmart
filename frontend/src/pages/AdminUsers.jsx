import { useState, useEffect } from "react";
import { getAllUsers, toggleBlockUser, deleteUser } from "../services/adminService";
import Loader from "../components/common/Loader";
import { User, Ban, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    try {
      await toggleBlockUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: !u.isBlocked } : u))
      );
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
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="list-stack">
        {users.map((u) => (
          <div key={u._id} className="card card-hover">
            <div className="list-item">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  className="navbar-avatar"
                  style={{ width: 40, height: 40, fontSize: "0.875rem" }}
                >
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="list-item-title">{u.name}</div>
                  <div className="list-item-sub">{u.email}</div>
                  <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                    {u.isBlocked && (
                      <span className="badge badge-accepted">Blocked</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="list-item-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleBlock(u._id)}
                >
                  <Ban size={14} /> {u.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u._id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
