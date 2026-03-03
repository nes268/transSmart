import { useState, useEffect } from "react";
import { addTruck, getMyTrucks, changeAvailability, updateTruck } from "../services/truckService";
import Loader from "../components/common/Loader";
import { PlusCircle, Truck, Edit3 } from "lucide-react";

export default function MyTrucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ truckNumber: "", capacity: "", fuelType: "diesel" });
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [editForm, setEditForm] = useState({ truckNumber: "", capacity: "", fuelType: "diesel" });

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
      await addTruck({ ...formData, capacity: parseFloat(formData.capacity) });
      setFormData({ truckNumber: "", capacity: "", fuelType: "diesel" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add truck");
    } finally {
      setSubmitLoading(false);
    }
  };

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
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">My Trucks</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={16} /> {showForm ? "Cancel" : "Add Truck"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: "520px" }}>
          {error && <div className="alert alert-error">{error}</div>}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? "Adding..." : "Add Truck"}
            </button>
          </form>
        </div>
      )}

      {trucks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Truck size={32} className="empty-state-icon" />
            <p className="empty-state-text">No trucks yet. Add your first truck to accept jobs.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {trucks.map((t) => (
            <div key={t._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{t.truckNumber}</div>
                  <div className="list-item-sub">{t.capacity} tons • {t.fuelType}</div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge badge-${t.availability === "available" ? "completed" : "accepted"}`}>
                    {t.availability}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleAvailability(t._id, t.availability)}>
                    {t.availability === "available" ? "Mark Busy" : "Mark Available"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTruck && (
        <div className="modal-overlay" onClick={() => setEditingTruck(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Truck</h3>
            {error && <div className="alert alert-error">{error}</div>}
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
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTruck(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
