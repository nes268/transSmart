import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { acceptJob, completeJob } from "../services/jobService";
import { getMyTrucks } from "../services/truckService";
import { createTrip } from "../services/tripService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    getAllJobs()
      .then((res) => {
        const found = res.data?.find((j) => j._id === id);
        setJob(found || null);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === "transporter" && showAcceptModal) {
      getMyTrucks()
        .then((res) => setTrucks(res.data || []))
        .catch(() => setTrucks([]));
    }
  }, [user?.role, showAcceptModal]);

  const handleAccept = async () => {
    if (!selectedTruck) {
      setError("Please select a truck");
      return;
    }
    setError("");
    setActionLoading(true);
    try {
      await acceptJob(id);
      await createTrip(id, selectedTruck);
      setShowAcceptModal(false);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeJob(id);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete job");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!job) return <div style={{ color: "var(--color-error)" }}>Job not found</div>;

  const isShipper = user?.role === "shipper";
  const isTransporter = user?.role === "transporter";
  const canAccept = isTransporter && job.status === "open";
  const canComplete = isTransporter && job.transporter?._id === user?._id && job.status === "accepted";

  return (
    <div>
      <Link to={isShipper ? "/shipper" : isTransporter ? "/transporter" : "/admin"} style={{ marginBottom: "1rem", display: "inline-block" }}>
        ← Back
      </Link>

      <div className="card" style={{ maxWidth: "700px" }}>
        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.2)", color: "var(--color-error)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.5rem" }}>{job.title}</h1>
          <span className={`badge badge-${job.status}`}>{job.status}</span>
        </div>

        <div style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>{job.description}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Pickup</div>
            <div>{job.pickupLocation}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Delivery</div>
            <div>{job.deliveryLocation}</div>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "1.25rem" }}>₹{job.price}</span>
        </div>

        {job.shipper && (
          <div style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Shipper:</span> {job.shipper.name} ({job.shipper.email})
          </div>
        )}
        {job.transporter && (
          <div style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Transporter:</span> {job.transporter.name} ({job.transporter.email})
            {" "}
            <Link to={`/reviews/user/${job.transporter._id}`} style={{ fontSize: "0.8125rem" }}>View reviews</Link>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Created {formatDate(job.createdAt)}</div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          {canAccept && (
            <button className="btn btn-primary" onClick={() => setShowAcceptModal(true)} disabled={actionLoading}>
              Accept Job
            </button>
          )}
          {canComplete && (
            <button className="btn btn-primary" onClick={handleComplete} disabled={actionLoading}>
              {actionLoading ? "Completing..." : "Mark Complete"}
            </button>
          )}
        </div>
      </div>

      {showAcceptModal && (
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
          onClick={() => setShowAcceptModal(false)}
        >
          <div className="card" style={{ maxWidth: "400px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Select Truck</h3>
            {trucks.filter((t) => t.availability === "available").length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>No available trucks. Add a truck first.</p>
            ) : (
              <>
                <div className="form-group">
                  <label>Truck</label>
                  <select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
                    <option value="">Choose...</option>
                    {trucks.filter((t) => t.availability === "available").map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.truckNumber} - {t.capacity} tons ({t.fuelType})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-primary" onClick={handleAccept} disabled={actionLoading || !selectedTruck}>
                    {actionLoading ? "Accepting..." : "Accept"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowAcceptModal(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
