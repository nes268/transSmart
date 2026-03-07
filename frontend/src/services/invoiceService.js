import api from "./api";

export const getMyInvoices = async () => {
  const res = await api.get("/invoices/my");
  return res.data;
};

export const getInvoiceById = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};
