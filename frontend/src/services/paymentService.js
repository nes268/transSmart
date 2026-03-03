import api from "./api";

export const createPayment = async (jobId) => {
  const res = await api.post("/payments", { jobId });
  return res.data;
};

export const getMyPayments = async () => {
  const res = await api.get("/payments/my");
  return res.data;
};

export const markAsPaid = async (id, paymentMethod = "upi") => {
  const res = await api.patch(`/payments/${id}/pay`, { paymentMethod });
  return res.data;
};
