import { useRef, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
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

// Mapbox route map (styled, smooth)
function RouteMapMapbox({ geometry, pickupLocation, deliveryLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const coordinates = useMemo(() => {
    if (!geometry?.coordinates?.length) return [];
    return geometry.coordinates;
  }, [geometry]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapRef.current || !coordinates.length) return;

    let cancelled = false;
    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [start[0], start[1]],
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (cancelled) return;
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        },
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#10b981",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      const bounds = coordinates.reduce(
        (b, [lng, lat]) => b.extend([lng, lat]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });

      const startMarker = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat(start)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup</strong>${pickupLocation ? `<br/>${pickupLocation}` : ""}`))
        .addTo(map);
      const endMarker = new mapboxgl.Marker({ color: "#10b981" })
        .setLngLat(end)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Delivery</strong>${deliveryLocation ? `<br/>${deliveryLocation}` : ""}`))
        .addTo(map);
      markersRef.current = [startMarker, endMarker];
    });

    mapInstance.current = map;

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        markersRef.current.forEach((m) => m.remove());
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coordinates, pickupLocation, deliveryLocation]);

  if (!MAPBOX_TOKEN || !coordinates.length) return null;

  return (
    <div
      ref={mapRef}
      className="mapbox-route-map"
      style={{ height: "320px", borderRadius: "var(--radius)", overflow: "hidden" }}
    />
  );
}

function MapBounds({ geometry }) {
  const map = useMap();
  useEffect(() => {
    if (!geometry?.coordinates?.length) return;
    const coords = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds.pad(0.15));
  }, [geometry, map]);
  return null;
}

function RouteMapLeaflet({ geometry, pickupLocation, deliveryLocation }) {
  const positions = useMemo(() => {
    if (!geometry?.coordinates?.length) return [];
    return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [geometry]);

  if (!positions.length) return null;
  const start = positions[0];
  const end = positions[positions.length - 1];

  return (
    <div style={{ height: "320px", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <MapContainer center={start} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapBounds geometry={geometry} />
        <Polyline positions={positions} color="#10b981" weight={4} opacity={0.9} />
        <Marker position={start}>
          <Popup>Pickup{pickupLocation ? `: ${pickupLocation}` : ""}</Popup>
        </Marker>
        <Marker position={end}>
          <Popup>Delivery{deliveryLocation ? `: ${deliveryLocation}` : ""}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default function RouteMap(props) {
  if (!props.geometry?.coordinates?.length) return null;
  return MAPBOX_TOKEN ? (
    <RouteMapMapbox {...props} />
  ) : (
    <RouteMapLeaflet {...props} />
  );
}
