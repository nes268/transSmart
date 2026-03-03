import { useState, useEffect } from "react";
import { addTruck, getMyTrucks, changeAvailability, updateTruck } from "../services/truckService";
import Loader from "../components/common/Loader";

export default function MyTrucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ truckNumber: "", capacity: "", fuelType: "diesel" });
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const load = () => {
    getMyTrucks()
      .then((res) => setTrucks(res.data || []))
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);
    try {
      await addTruck({
        ...formData,
        capacity: parseFloat(formData.capacity),
      });
      setFormData({ truckNumber: "", capacity: "", fuelType: "diesel" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add truck");
    } finally {
      setSubmitLoading(false);
    }
  };

  const [editingTruck, setEditingTruck] = useState(null);
  const [editForm, setEditForm] = useState({ truckNumber: "", capacity: "", fuelType: "diesel" });

  const toggleAvailability = async (id, current) => {
    const next = current === "available" ? "busy" : "available";
    try {
      await changeAvailability(id, next);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    }
  };

  const openEdit = (t) => {
    setEditingTruck(t);
    setEditForm({ truckNumber: t.truckNumber, capacity: String(t.capacity), fuelType: t.fuelType });
    setError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTruck) return;
    setSubmitLoading(true);
    setError("");
    try {
      await updateTruck(editingTruck._id, {
        truckNumber: editForm.truckNumber,
        capacity: parseFloat(editForm.capacity),
        fuelType: editForm.fuelType,
      });
      setEditingTruck(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update truck");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>My Trucks</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Truck"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
          {error && (
            <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.2)", color: "var(--color-error)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Truck Number</label>
              <input
                value={formData.truckNumber}
                onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                placeholder="e.g. TN01AB1234"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacity (tons)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="5"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Fuel Type</label>
              <select value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? "Adding..." : "Add Truck"}
            </button>
          </form>
        </div>
      )}

      {trucks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No trucks yet. Add your first truck to accept jobs.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {trucks.map((t) => (
            <div key={t._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.truckNumber}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {t.capacity} tons • {t.fuelType}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className={`badge badge-${t.availability === "available" ? "completed" : "accepted"}`}>
                  {t.availability}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem" }}
                  onClick={() => openEdit(t)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem" }}
                  onClick={() => toggleAvailability(t._id, t.availability)}
                >
                  {t.availability === "available" ? "Mark Busy" : "Mark Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTruck && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setEditingTruck(null)}
        >
          <div className="card" style={{ maxWidth: "400px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Edit Truck</h3>
            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.2)", color: "var(--color-error)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Truck Number</label>
                <input value={editForm.truckNumber} onChange={(e) => setEditForm({ ...editForm, truckNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Capacity (tons)</label>
                <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} min="0.1" step="0.1" required />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select value={editForm.fuelType} onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}>
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>{submitLoading ? "Saving..." : "Save"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTruck(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
