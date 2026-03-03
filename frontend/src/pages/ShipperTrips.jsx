import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperTrips } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { MapPin, Navigation } from "lucide-react";

export default function ShipperTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipperTrips()
      .then((res) => setTrips(res.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const activeTrips = trips.filter(
    (t) => t.status !== "completed" && t.status !== "delivered"
  );
  const completedTrips = trips.filter((t) => t.status === "completed");

  const TripCard = ({ trip }) => (
    <div className="card card-hover">
      <div className="list-item">
        <div>
          <div className="list-item-title">{trip.job?.title || "Trip"}</div>
          <div className="list-item-sub">
            {trip.job?.pickupLocation} → {trip.job?.deliveryLocation}
          </div>
          <div className="list-item-meta">
            Transporter: {trip.transporter?.name || "-"} • Truck:{" "}
            {trip.truck?.truckNumber || "-"} • {formatDate(trip.startedAt)}
          </div>
        </div>
        <div className="list-item-actions">
          <span
            className={`badge badge-${
              trip.status === "completed"
                ? "completed"
                : trip.status === "in_transit" || trip.status === "delivered"
                ? "accepted"
                : "open"
            }`}
          >
            {trip.status.replace("_", " ")}
          </span>
          <span className="list-item-price">₹{trip.job?.price}</span>
          {(trip.status === "in_transit" || trip.status === "delivered") && (
            <Link to={`/trips/${trip._id}`} className="btn btn-primary btn-sm">
              <Navigation size={14} /> Track
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">My Trips</h1>
      </div>

      <div className="section-header">
        <h2 className="section-title">Active Trips</h2>
      </div>
      {activeTrips.length === 0 ? (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="empty-state">
            <MapPin size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No active trips. Trips appear here when a transporter accepts your job.
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack" style={{ marginBottom: "2rem" }}>
          {activeTrips.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Completed Trips</h2>
      </div>
      {completedTrips.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">No completed trips yet.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {completedTrips.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
