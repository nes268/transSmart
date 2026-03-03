import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../services/jobService";
import { ArrowLeft } from "lucide-react";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [requiredCapacity, setRequiredCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createJob({
        title,
        description,
        pickupLocation,
        deliveryLocation,
        price: parseFloat(price),
      });
      navigate("/shipper");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to create job.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <button onClick={() => navigate(-1)} className="back-link" style={{ background: "none", border: "none", cursor: "pointer" }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Job</h1>
          <p className="page-subtitle">Fill in the details for your shipment</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "640px" }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Furniture delivery"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the shipment details..."
              rows={3}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Address or city"
                required
              />
            </div>
            <div className="form-group">
              <label>Drop Location</label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Address or city"
                required
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Required Capacity (tons)</label>
              <input
                type="number"
                value={requiredCapacity}
                onChange={(e) => setRequiredCapacity(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Budget (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Job"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
