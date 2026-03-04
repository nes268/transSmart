import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { smartMatch, optimizeRoute } from "../services/aiService";
import { getAllJobs } from "../services/jobService";
import { createTruckRequest } from "../services/truckRequestService";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { Sparkles, MapPin, Zap, Truck, User, Phone, Send } from "lucide-react";

export default function AI() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("match");
  const [matchJobId, setMatchJobId] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [requestModal, setRequestModal] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [routeForm, setRouteForm] = useState({
    pickup: "",
    drop: "",
    fuelType: "diesel",
    fuelEfficiency: "5",
  });
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "transporter") setActiveTab("route");
  }, [user?.role]);

  useEffect(() => {
    const params = { status: "open" };
    if (user?.role === "shipper") params.mine = true;
    getAllJobs(params)
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const handleSmartMatch = async (e) => {
    e.preventDefault();
    if (!matchJobId) return;
    setError("");
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await smartMatch(matchJobId);
      setMatchResult(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Smart match failed. AI engine may not be configured."
      );
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestModal) return;
    setRequestLoading(true);
    setError("");
    try {
      await createTruckRequest(requestModal.truck._id, requestMessage);
      setRequestModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOptimizeRoute = async (e) => {
    e.preventDefault();
    setError("");
    setRouteLoading(true);
    setRouteResult(null);
    try {
      const res = await optimizeRoute(
        routeForm.pickup,
        routeForm.drop,
        routeForm.fuelType,
        parseFloat(routeForm.fuelEfficiency)
      );
      setRouteResult(res.optimization);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Route optimization failed. AI engine may not be configured."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Tools</h1>
          <p className="page-subtitle">Smart match and route optimization</p>
        </div>
      </div>

      <div className="tab-group" style={{ marginBottom: "1.5rem" }}>
        {user?.role === "shipper" && (
          <button
            className={`tab-btn${activeTab === "match" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("match");
              setError("");
              setMatchResult(null);
            }}
          >
            <Sparkles size={14} /> Smart Match
          </button>
        )}
        <button
          className={`tab-btn${activeTab === "route" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("route");
            setError("");
            setRouteResult(null);
          }}
        >
          <MapPin size={14} /> Optimize Route
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === "match" && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h2 className="section-title">Smart Match</h2>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} />
            </div>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Get AI-powered transporter suggestions for a job
          </p>
          <form onSubmit={handleSmartMatch}>
            <div className="form-group">
              <label>Select Job</label>
              <select
                value={matchJobId}
                onChange={(e) => setMatchJobId(e.target.value)}
                required
              >
                <option value="">Choose a job...</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} - ₹{j.price}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={matchLoading || jobs.length === 0}
            >
              {matchLoading ? "Finding match..." : "Get Suggestions"}
            </button>
          </form>
          {matchResult && (
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {matchResult.message} ({matchResult.totalTrucksScanned} truck profiles scanned)
              </p>
              {matchResult.suggestions?.length > 0 ? (
                <div className="list-stack">
                  {matchResult.suggestions.map((s, idx) => (
                    <div key={s.truck._id} className="card card-hover">
                      <div className="list-item">
                        <div style={{ flex: 1 }}>
                          <div className="list-item-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className="badge badge-open" style={{ minWidth: 28 }}>#{idx + 1}</span>
                            <Truck size={16} style={{ color: "var(--color-primary)" }} />
                            {s.truck.truckNumber}
                          </div>
                          <div className="list-item-sub">
                            {s.truck.capacity} tons • {s.truck.fuelType?.charAt(0).toUpperCase() + (s.truck.fuelType?.slice(1) || "")} •{" "}
                            <span className={`badge badge-${s.truck.availability === "available" ? "completed" : "accepted"}`} style={{ fontSize: "0.7rem" }}>
                              {s.truck.availability}
                            </span>
                          </div>
                          {s.truck.transporter && (
                            <div className="list-item-meta" style={{ marginTop: "0.25rem" }}>
                              <User size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                              {s.truck.transporter.name}
                              {s.truck.transporter.phone && (
                                <> • <Phone size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {s.truck.transporter.phone}</>
                              )}
                              {s.truck.transporter.email && (
                                <> • {s.truck.transporter.email}</>
                              )}
                            </div>
                          )}
                          <div style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            Match score: {s.score} — {s.reasons?.join(" • ")}
                          </div>
                        </div>
                        <div className="list-item-actions" style={{ flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setRequestModal(s);
                              setRequestMessage("");
                              setError("");
                            }}
                          >
                            <Send size={14} /> Send Request
                          </button>
                          {s.truck.transporter?._id && (
                            <Link
                              to={`/reviews/user/${s.truck.transporter._id}`}
                              className="btn btn-secondary btn-sm"
                            >
                              View Reviews
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "1.5rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                  }}
                >
                  No suitable trucks found for this job.
                </div>
              )}
            </div>
          )}

          {requestModal && (
            <div className="modal-overlay" style={{ marginTop: 0 }} onClick={() => setRequestModal(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Send Request</h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                  Request truck <strong>{requestModal.truck?.truckNumber}</strong> from {requestModal.truck?.transporter?.name}
                </p>
                <form onSubmit={handleSendRequest}>
                  <div className="form-group">
                    <label>Message (optional)</label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Add a note for the transporter..."
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="btn btn-primary" disabled={requestLoading}>
                      {requestLoading ? "Sending..." : "Send Request"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setRequestModal(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "route" && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h2 className="section-title">Optimize Route</h2>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} />
            </div>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Get fuel-efficient route suggestions
          </p>
          <form onSubmit={handleOptimizeRoute}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  value={routeForm.pickup}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, pickup: e.target.value })
                  }
                  placeholder="e.g. Chennai"
                  required
                />
              </div>
              <div className="form-group">
                <label>Drop Location</label>
                <input
                  value={routeForm.drop}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, drop: e.target.value })
                  }
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  value={routeForm.fuelType}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, fuelType: e.target.value })
                  }
                >
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fuel Efficiency (km/L)</label>
                <input
                  type="number"
                  value={routeForm.fuelEfficiency}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, fuelEfficiency: e.target.value })
                  }
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={routeLoading}
            >
              {routeLoading ? "Optimizing..." : "Optimize"}
            </button>
          </form>
          {routeResult && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Result</h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {JSON.stringify(routeResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
