import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import mapboxgl from "mapbox-gl";
import "leaflet/dist/leaflet.css";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat != null && center?.lng != null) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Mapbox live driver map
function LiveMapMapbox({ tripId, socket, initialLocation, onLocationReceived, isDriver, onSendLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [location, setLocation] = useState(initialLocation || { lat: 13.0827, lng: 80.2707 });

  useEffect(() => {
    if (initialLocation?.lat != null && initialLocation?.lng != null) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    socket.emit("joinTrip", tripId);
  }, [tripId, socket?.connected]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    const handler = (data) => {
      setLocation({ lat: data.lat, lng: data.lng });
      onLocationReceived?.(data);
    };
    socket.on("liveLocation", handler);
    return () => socket.off("liveLocation", handler);
  }, [tripId, socket?.connected, onLocationReceived]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapRef.current) return;

    let cancelled = false;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [location.lng, location.lat],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const marker = new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML("<strong>Driver location</strong>"))
      .addTo(map);

    markerRef.current = marker;
    mapInstance.current = map;

    if (isDriver && onSendLocation) {
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setLocation({ lat, lng });
        onSendLocation(lat, lng);
      });
    }

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.remove();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (markerRef.current && location?.lat != null && location?.lng != null) {
      markerRef.current.setLngLat([location.lng, location.lat]);
    }
    if (mapInstance.current && location?.lat != null && location?.lng != null) {
      mapInstance.current.easeTo({ center: [location.lng, location.lat], duration: 800 });
    }
  }, [location?.lat, location?.lng]);

  if (!MAPBOX_TOKEN) return null;

  return (
    <div
      ref={mapRef}
      style={{ height: "400px", borderRadius: "var(--radius)", overflow: "hidden" }}
    />
  );
}

// Leaflet fallback
function LiveMapLeaflet({ tripId, socket, initialLocation, onLocationReceived, isDriver, onSendLocation }) {
  const [location, setLocation] = useState(initialLocation || { lat: 13.0827, lng: 80.2707 });

  useEffect(() => {
    if (initialLocation?.lat != null && initialLocation?.lng != null) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    socket.emit("joinTrip", tripId);
  }, [tripId, socket?.connected]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    const handler = (data) => {
      setLocation({ lat: data.lat, lng: data.lng });
      onLocationReceived?.(data);
    };
    socket.on("liveLocation", handler);
    return () => socket.off("liveLocation", handler);
  }, [tripId, socket?.connected, onLocationReceived]);

  const handleMapClick = (e) => {
    if (isDriver && onSendLocation) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      onSendLocation(lat, lng);
    }
  };

  return (
    <div style={{ height: "400px", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        onClick={handleMapClick}
      >
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater center={location} />
        <Marker position={[location.lat, location.lng]}>
          <Popup>Current location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default function LiveMap(props) {
  return MAPBOX_TOKEN ? <LiveMapMapbox {...props} /> : <LiveMapLeaflet {...props} />;
}
