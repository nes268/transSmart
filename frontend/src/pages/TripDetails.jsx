import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTripById } from "../services/tripService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import LiveMap from "../components/maps/LiveMap";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripById(id)
      .then((res) => setTrip(res.data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!trip) return <div style={{ color: "var(--color-error)" }}>Trip not found</div>;

  const isTransporter = user?.role === "transporter";
  const isShipper = user?.role === "shipper";
  const canTrack = (trip.status === "in_transit" || trip.status === "delivered") && (isTransporter || isShipper);
  const location = trip.currentLocation;

  return (
    <div>
      <Link to={user?.role === "shipper" ? "/shipper/trips" : "/transporter/trips"} style={{ marginBottom: "1rem", display: "inline-block" }}>
        ← Back to Trips
      </Link>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{trip.job?.title || "Trip"}</h1>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {trip.job?.pickupLocation} → {trip.job?.deliveryLocation}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Truck: {trip.truck?.truckNumber} • Started {formatDate(trip.startedAt)}
            </div>
          </div>
          <span className={`badge badge-${trip.status === "completed" ? "completed" : "accepted"}`}>
            {trip.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {canTrack && (
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Live Tracking</h2>
          {socket ? (
            <LiveMap tripId={id} socket={socket} initialLocation={location} />
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>Connecting to live tracking...</p>
          )}
        </div>
      )}

      {!canTrack && trip.status !== "completed" && (
        <div className="card" style={{ color: "var(--color-text-muted)" }}>
          Live tracking is available when the trip is in transit.
        </div>
      )}
    </div>
  );
}
