import api from "./api";

export const smartMatch = async (jobId) => {
  const res = await api.post("/ai/suggest", { jobId });
  return res.data;
};

export const optimizeRoute = async (pickup, drop, fuelType, fuelEfficiency) => {
  const res = await api.post("/ai/optimize-route", {
    pickup,
    drop,
    fuelType,
    fuelEfficiency,
  });
  return res.data;
};
