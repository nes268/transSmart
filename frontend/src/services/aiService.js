import api from "./api";

export const smartMatch = async (jobId) => {
  const res = await api.post("/ai/suggest", { jobId });
  return res.data;
};

export const optimizeRoute = async (jobId, fuelType = "diesel", fuelEfficiency = 5) => {
  const res = await api.post("/ai/optimize-route", {
    jobId,
    fuelType,
    fuelEfficiency,
  });
  return res.data;
};
