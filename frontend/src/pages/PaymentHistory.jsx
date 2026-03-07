import { useState, useEffect } from "react";
import { getMyPayments, markAsPaid, createPayment } from "../services/paymentService";
import { getShipperDashboard } from "../services/dashboardService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { CreditCard, PlusCircle, IndianRupee } from "lucide-react";
import RazorpayCheckoutModal from "../components/payment/RazorpayCheckoutModal";

export default function PaymentHistory() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPayModal, setShowPayModal] = useState(null);
  const [jobsNeedingPayment, setJobsNeedingPayment] = useState([]);
  const [createLoading, setCreateLoading] = useState(null);

  const load = () => {
    getMyPayments()
      .then((res) => setPayments(res.data || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  // Join user room for real-time payment updates
  useEffect(() => {
    if (socket?.connected && user?._id) {
      socket.emit("joinUserRoom", user._id);
    }
  }, [socket?.connected, user?._id]);

  // Real-time: payment created (shipper creates, both receive)
  useEffect(() => {
    if (!socket?.connected || !user?._id) return;
    const handler = (payment) => {
      const shipperId = payment.shipper?._id || payment.shipper;
      const transporterId = payment.transporter?._id || payment.transporter;
      if (user._id !== shipperId && user._id !== transporterId) return;
      setPayments((prev) => {
        const idx = prev.findIndex((p) => p._id === payment._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payment;
          return next;
        }
        const jobId = (payment.job?._id || payment.job)?.toString?.();
        const withoutDup = prev.filter((p) => {
          if (p._id === payment._id) return false;
          const pJobId = (p.job?._id || p.job)?.toString?.();
          return !jobId || pJobId !== jobId;
        });
        return [payment, ...withoutDup];
      });
    };
    socket.on("payment:created", handler);
    return () => socket.off("payment:created", handler);
  }, [socket?.connected, user]);

  // Real-time: payment marked paid (shipper marks, both receive)
  useEffect(() => {
    if (!socket?.connected || !user?._id) return;
    const handler = (payment) => {
      const shipperId = payment.shipper?._id || payment.shipper;
      const transporterId = payment.transporter?._id || payment.transporter;
      if (user._id !== shipperId && user._id !== transporterId) return;
      setPayments((prev) => {
        const idx = prev.findIndex((p) => p._id === payment._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payment;
          return next;
        }
        const jobId = (payment.job?._id || payment.job)?.toString?.();
        const withoutDup = prev.filter((p) => {
          if (p._id === payment._id) return false;
          const pJobId = (p.job?._id || p.job)?.toString?.();
          return !jobId || pJobId !== jobId;
        });
        return [payment, ...withoutDup];
      });
    };
    socket.on("payment:paid", handler);
    return () => socket.off("payment:paid", handler);
  }, [socket?.connected, user]);

  useEffect(() => {
    if (user?.role === "shipper") {
      getShipperDashboard()
        .then((res) => {
          const completed = (res.data?.jobs || []).filter(
            (j) => j.status === "completed"
          );
          setJobsNeedingPayment(completed);
        })
        .catch(() => setJobsNeedingPayment([]));
    }
  }, [user?.role]);

  const handlePaymentSuccess = async () => {
    if (!showPayModal) return;
    setActionLoading(showPayModal);
    try {
      const res = await markAsPaid(showPayModal, "card");
      const payment = res?.data;
      if (payment) {
        setPayments((prev) =>
          prev.map((p) => (p._id === payment._id ? payment : p))
        );
      } else {
        load();
      }
    } catch (err) {
      console.error(err);
      load();
    } finally {
      setActionLoading(null);
      setShowPayModal(null);
    }
  };

  const handleCreatePayment = async (jobId) => {
    setCreateLoading(jobId);
    try {
      const res = await createPayment(jobId);
      const payment = res?.data;
      if (payment) {
        setPayments((prev) => {
          const withoutDup = prev.filter((p) => p._id !== payment._id);
          const jobId = (payment.job?._id || payment.job)?.toString?.();
          const filtered = jobId
            ? withoutDup.filter((p) => (p.job?._id || p.job)?.toString?.() !== jobId)
            : withoutDup;
          return [payment, ...filtered];
        });
      } else {
        load();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(null);
    }
  };

  if (loading) return <Loader />;

  const paidJobIds = [...new Set(payments.map((p) => (p.job?._id || p.job)?.toString?.()).filter(Boolean))];
  const jobsWithoutPayment = jobsNeedingPayment.filter(
    (j) => !paidJobIds.includes(j._id?.toString?.())
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment History</h1>
          <p className="page-subtitle">Track and manage your payments</p>
        </div>
      </div>

      {user?.role === "shipper" && jobsWithoutPayment.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h3 className="section-title">Create Payment</h3>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            Create payment for completed jobs
          </p>
          <div className="list-stack">
            {jobsWithoutPayment.map((j) => (
              <div key={j._id} className="list-item" style={{ padding: "0.5rem 0" }}>
                <div>
                  <span className="list-item-title">{j.title}</span>
                  <span className="list-item-price" style={{ marginLeft: "0.75rem" }}>₹{j.price}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={createLoading === j._id}
                  onClick={() => handleCreatePayment(j._id)}
                >
                  <PlusCircle size={14} />
                  {createLoading === j._id ? "Creating..." : "Create Payment"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CreditCard size={32} className="empty-state-icon" />
            <p className="empty-state-text">No payments yet.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {payments.map((p) => (
            <div key={p._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <IndianRupee size={16} style={{ color: "var(--color-primary)" }} />
                    ₹{p.amount}
                  </div>
                  <div className="list-item-sub">
                    Job: {p.job?.title || p.job?._id || "-"}
                  </div>
                  <div className="list-item-meta">{formatDate(p.createdAt)}</div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge badge-${p.status === "paid" ? "completed" : "accepted"}`}>
                    {p.status}
                  </span>
                  {p.status === "pending" && user?.role === "shipper" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === p._id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPayModal(p._id);
                      }}
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RazorpayCheckoutModal
        open={!!showPayModal}
        onClose={() => setShowPayModal(null)}
        amount={payments.find((p) => p._id === showPayModal)?.amount ?? ""}
        description={payments.find((p) => p._id === showPayModal)?.job?.title ? `Job: ${payments.find((p) => p._id === showPayModal).job.title}` : null}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
