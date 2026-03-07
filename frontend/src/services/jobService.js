import api from "./api";

export const createJob = async (data) => {
  const res = await api.post("/jobs", data);
  return res.data;
};

export const getAllJobs = async (params = {}) => {
  const res = await api.get("/jobs", { params });
  return res.data;
};

export const acceptJob = async (id) => {
  const res = await api.put(`/jobs/accept/${id}`);
  return res.data;
};

export const completeJob = async (id) => {
  const res = await api.put(`/jobs/complete/${id}`);
  return res.data;
};

export const getReturnLoads = async (jobId) => {
  const res = await api.get(`/jobs/return-loads/${jobId}`);
  return res.data;
};
