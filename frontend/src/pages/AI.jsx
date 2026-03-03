import { useState, useEffect } from "react";
import { smartMatch, optimizeRoute } from "../services/aiService";
import { getAllJobs } from "../services/jobService";
import Loader from "../components/common/Loader";
import { Sparkles, MapPin, Zap } from "lucide-react";

export default function AI() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("match");
  const [matchJobId, setMatchJobId] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
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
    getAllJobs({ status: "open" })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSmartMatch = async (e) => {
    e.preventDefault();
    if (!matchJobId) return;
    setError("");
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await smartMatch(matchJobId);
      setMatchResult(res.suggestion);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Smart match failed. AI engine may not be configured."
      );
    } finally {
      setMatchLoading(false);
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
                {JSON.stringify(matchResult, null, 2)}
              </pre>
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
