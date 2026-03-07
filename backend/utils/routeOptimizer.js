/**
 * Route optimization: OSRM
 * Geocoding: Nominatim
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

async function geocodeWithNominatim(query) {
  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TransSmart/1.0" }
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function geocode(place) {
  let result = await geocodeWithNominatim(place);
  if (result) return result;
  // Fallback: try shorter queries (remove first comma-separated part)
  let query = place.trim();
  while (query.includes(",")) {
    query = query.replace(/^[^,]+\s*,\s*/, "").trim();
    if (query) {
      result = await geocodeWithNominatim(query);
      if (result) return result;
    }
  }
  throw new Error(`Could not geocode: ${place}`);
}

async function getRoute(pickupCoords, dropCoords) {
  const coords = `${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error(data.message || "Route not found");
  }
  const route = data.routes[0];
  return {
    distance: route.distance / 1000,
    duration: Math.round(route.duration),
    geometry: route.geometry,
    legs: route.legs || [],
  };
}

async function getRoutes(pickupCoords, dropCoords) {
  const coords = `${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=true&alternatives=true`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error(data.message || "Route not found");
  }
  return data.routes.map((route) => ({
    distance: route.distance / 1000,
    duration: Math.round(route.duration),
    geometry: route.geometry,
    legs: route.legs || [],
  }));
}

function buildSteps(legs) {
  const steps = [];
  const modifiers = { left: "Turn left", right: "Turn right", straight: "Go straight", slight_left: "Slight left", slight_right: "Slight right" };
  for (const leg of legs) {
    for (const step of leg.steps || []) {
      const mod = step.maneuver?.modifier || "straight";
      steps.push({
        instruction: modifiers[mod] || "Continue",
        distance: Math.round((step.distance || 0) / 1000 * 100) / 100,
        duration: Math.round(step.duration || 0)
      });
    }
  }
  return steps.slice(0, 12);
}

function calcFuelMetrics(distanceKm, fuelType, fuelEfficiency) {
  const fuelUsed = distanceKm / (fuelEfficiency || 5);
  const rates = { diesel: 95, petrol: 105, electric: 8 };
  const fuelCost = Math.round(fuelUsed * (rates[fuelType] || 95));
  const emissionFactors = { diesel: 2.68, petrol: 2.31, electric: 0.5 };
  const co2 = fuelUsed * (emissionFactors[fuelType] || 2.5);
  const greenScore = Math.max(0, Math.round(100 - co2 * 2));
  return { fuelUsed, fuelCost, greenScore };
}

async function optimizeRoute(pickupPlace, dropPlace, fuelType = "diesel", fuelEfficiency = 5) {
  const [pickupCoords, dropCoords] = await Promise.all([
    geocode(pickupPlace),
    geocode(dropPlace)
  ]);

  const routeData = await getRoute(pickupCoords, dropCoords);
  const steps = buildSteps(routeData.legs);
  const { fuelUsed, fuelCost, greenScore } = calcFuelMetrics(
    routeData.distance,
    fuelType,
    fuelEfficiency
  );

  return {
    distance: Math.round(routeData.distance * 100) / 100,
    duration: routeData.duration,
    fuelUsed: Math.round(fuelUsed * 100) / 100,
    fuelCost,
    greenScore,
    steps,
    geometry: routeData.geometry,
    pickupCoords,
    dropCoords
  };
}

async function optimizeRouteCandidates(pickupPlace, dropPlace, fuelType = "diesel", fuelEfficiency = 5) {
  const [pickupCoords, dropCoords] = await Promise.all([
    geocode(pickupPlace),
    geocode(dropPlace)
  ]);

  const routes = await getRoutes(pickupCoords, dropCoords);
  const candidates = routes.map((routeData) => {
    const steps = buildSteps(routeData.legs);
    const { fuelUsed, fuelCost, greenScore } = calcFuelMetrics(
      routeData.distance,
      fuelType,
      fuelEfficiency
    );
    return {
      distance: Math.round(routeData.distance * 100) / 100,
      duration: routeData.duration,
      fuelUsed: Math.round(fuelUsed * 100) / 100,
      fuelCost,
      greenScore,
      steps,
      geometry: routeData.geometry,
    };
  });

  return { candidates, pickupCoords, dropCoords };
}

module.exports = { optimizeRoute, optimizeRouteCandidates, geocode };
