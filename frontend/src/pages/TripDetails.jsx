import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTripById } from "../services/tripService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import LiveMap from "../components/maps/LiveMap";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { ArrowLeft, MapPin, Truck, Clock, User, Phone } from "lucide-react";

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
  if (!trip)
    return <div className="alert alert-error">Trip not found</div>;

  const isTransporter = user?.role === "transporter";
  const isShipper = user?.role === "shipper";
  const canTrack =
    (trip.status === "in_transit" || trip.status === "delivered") &&
    (isTransporter || isShipper);
  const location = trip.currentLocation;

  return (
    <div className="animate-in">
      <Link
        to={
          user?.role === "shipper"
            ? "/shipper/trips"
            : "/transporter/trips"
        }
        className="back-link"
      >
        <ArrowLeft size={16} /> Back to Trips
      </Link>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="list-item">
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.375rem" }}>
              {trip.job?.title || "Trip"}
            </h1>
            <div className="list-item-sub" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={14} style={{ flexShrink: 0 }} />
              {trip.job?.pickupLocation} → {trip.job?.deliveryLocation}
            </div>
            <div className="list-item-meta" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem" }}>
              <Truck size={12} /> {trip.truck?.truckNumber}
              <span style={{ margin: "0 0.25rem" }}>•</span>
              <Clock size={12} /> {formatDate(trip.startedAt)}
              {trip.transporter?.name && (
                <>
                  <span style={{ margin: "0 0.25rem" }}>•</span>
                  <User size={12} /> {trip.transporter.name}
                  {trip.transporter?.phone && (
                    <>
                      <span style={{ margin: "0 0.25rem" }}>•</span>
                      <Phone size={12} /> {trip.transporter.phone}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <span
            className={`badge badge-${
              trip.status === "completed" ? "completed" : "accepted"
            }`}
          >
            {trip.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {canTrack && (
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>
            Live Tracking
          </h2>
          {socket ? (
            <LiveMap tripId={id} socket={socket} initialLocation={location} />
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>
              Connecting to live tracking...
            </p>
          )}
        </div>
      )}

      {!canTrack && trip.status !== "completed" && (
        <div className="card">
          <div className="empty-state">
            <MapPin size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              Live tracking is available when the trip is in transit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
