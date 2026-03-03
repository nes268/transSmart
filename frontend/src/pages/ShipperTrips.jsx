import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperTrips } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function ShipperTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipperTrips()
      .then((res) => setTrips(res.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const activeTrips = trips.filter((t) => t.status !== "completed" && t.status !== "delivered");
  const completedTrips = trips.filter((t) => t.status === "completed");

  const TripCard = ({ trip }) => (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        <div style={{ fontWeight: 600 }}>{trip.job?.title || "Trip"}</div>
        <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {trip.job?.pickupLocation} → {trip.job?.deliveryLocation}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
          Transporter: {trip.transporter?.name || "-"} • Truck: {trip.truck?.truckNumber || "-"} • {formatDate(trip.startedAt)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className={`badge badge-${trip.status === "completed" ? "completed" : trip.status === "in_transit" || trip.status === "delivered" ? "accepted" : "open"}`}>
          {trip.status.replace("_", " ")}
        </span>
        <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>₹{trip.job?.price}</span>
        {(trip.status === "in_transit" || trip.status === "delivered") && (
          <Link to={`/trips/${trip._id}`} className="btn btn-primary" style={{ fontSize: "0.8125rem" }}>
            Live Track
          </Link>
        )}
      </div>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>My Trips</h1>

      <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>Active Trips</h2>
      {activeTrips.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "2rem" }}>
          No active trips. Trips appear here when a transporter accepts your job.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {activeTrips.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </div>
      )}

      <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>Completed Trips</h2>
      {completedTrips.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No completed trips yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {completedTrips.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
