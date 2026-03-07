import { useState } from "react";
import { X, Minimize2 } from "lucide-react";
import "./RazorpayCheckoutModal.css";

/**
 * Mock Razorpay checkout modal - UI matches real Razorpay payment flow.
 * Payment always succeeds (mock).
 */
export default function RazorpayCheckoutModal({
  open,
  onClose,
  amount,
  description,
  onSuccess,
}) {
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2000));
    setStep("success");
    await new Promise((r) => setTimeout(r, 1500));
    onSuccess?.();
    handleClose();
    setLoading(false);
  };

  const handleClose = () => {
    if (step === "processing") return;
    setStep("form");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setName("");
    setUpiId("");
    setBank("");
    setSaveCard(false);
    onClose?.();
  };

  if (!open) return null;

  const formatCardNumber = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const methods = [
    { id: "upi", label: "UPI", recommended: true },
    { id: "card", label: "Cards" },
    { id: "netbanking", label: "Netbanking" },
    { id: "wallet", label: "Wallet" },
    { id: "paylater", label: "Pay Later" },
  ];

  return (
    <div className="rzp-overlay" onClick={handleClose}>
      <div className="rzp-modal rzp-modal-split" onClick={(e) => e.stopPropagation()}>
        {step === "form" && (
          <>
            {/* Left: Summary panel */}
            <div className="rzp-left">
              <div className="rzp-left-header">
                <div className="rzp-shop-logo">T</div>
                <span className="rzp-shop-name">TransSmart</span>
              </div>
              <div className="rzp-price-summary">
                <div className="rzp-price-label">Price Summary</div>
                <div className="rzp-price-value">₹{amount}</div>
                {description && <div className="rzp-price-desc">{description}</div>}
              </div>
              <div className="rzp-user-info">
                <span>Using as +91 •••• •••• 1234</span>
                <span className="rzp-arrow">›</span>
              </div>
              <div className="rzp-left-graphics" aria-hidden>
                <div className="rzp-graphic rzp-graphic-1" />
                <div className="rzp-graphic rzp-graphic-2" />
                <div className="rzp-graphic rzp-graphic-3" />
              </div>
              <div className="rzp-secured">
                <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="" className="rzp-secured-logo" />
                Secured by Razorpay
              </div>
            </div>

            {/* Right: Payment options */}
            <div className="rzp-right">
              <div className="rzp-right-header">
                <h2 className="rzp-right-title">Payment Options</h2>
                <div className="rzp-window-controls">
                  <button type="button" className="rzp-window-btn" aria-label="Minimize"><Minimize2 size={14} /></button>
                  <button type="button" className="rzp-window-btn" onClick={handleClose} aria-label="Close"><X size={16} strokeWidth={2} /></button>
                </div>
              </div>

              <form onSubmit={handlePay} className="rzp-right-body">
                <div className="rzp-methods-sidebar">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`rzp-method-item${method === m.id ? " active" : ""}`}
                      onClick={() => setMethod(m.id)}
                    >
                      {m.recommended && <span className="rzp-recommended">Recommended</span>}
                      <span className="rzp-method-label">{m.label}</span>
                      <div className="rzp-method-icons">
                        {m.id === "upi" && (
                          <>
                            <span className="rzp-pm-icon">P</span>
                            <span className="rzp-pm-icon">G</span>
                            <span className="rzp-pm-icon">P</span>
                            <span className="rzp-pm-icon">B</span>
                          </>
                        )}
                        {m.id === "card" && (
                          <>
                            <span className="rzp-pm-icon visa">Visa</span>
                            <span className="rzp-pm-icon mc">MC</span>
                            <span className="rzp-pm-icon">RuPay</span>
                            <span className="rzp-pm-icon">Maestro</span>
                          </>
                        )}
                        {m.id === "netbanking" && (
                          <>
                            <span className="rzp-pm-icon">SBI</span>
                            <span className="rzp-pm-icon">HDFC</span>
                            <span className="rzp-pm-icon">ICICI</span>
                            <span className="rzp-pm-icon">Axis</span>
                          </>
                        )}
                        {m.id === "wallet" && (
                          <>
                            <span className="rzp-pm-icon">PayTM</span>
                            <span className="rzp-pm-icon">Mobi</span>
                          </>
                        )}
                        {m.id === "paylater" && (
                          <>
                            <span className="rzp-pm-icon">Simpl</span>
                            <span className="rzp-pm-icon">Ola</span>
                            <span className="rzp-pm-icon">LazyPay</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rzp-form-area">
                  {method === "card" && (
                    <div className="rzp-card-form-new">
                      <h3 className="rzp-form-title">Add a new card</h3>
                      <div className="rzp-field">
                        <input
                          type="text"
                          placeholder="Card number"
                          value={formatCardNumber(cardNumber)}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                          maxLength={19}
                        />
                        <span className="rzp-card-brand">VISA</span>
                      </div>
                      <div className="rzp-field-row">
                        <div className="rzp-field">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                              setExpiry(v);
                            }}
                            maxLength={5}
                          />
                        </div>
                        <div className="rzp-field">
                          <input
                            type="password"
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="rzp-field">
                        <input
                          type="text"
                          placeholder="Cardholder name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <label className="rzp-checkbox">
                        <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                        <span>Save this card as per RBI guidelines</span>
                      </label>
                      <button type="submit" className="rzp-continue-btn" disabled={loading}>
                        Continue
                      </button>
                    </div>
                  )}
                  {method === "upi" && (
                    <div className="rzp-other-form">
                      <h3 className="rzp-form-title">Enter UPI ID</h3>
                      <div className="rzp-field">
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="rzp-continue-btn" disabled={loading}>Continue</button>
                    </div>
                  )}
                  {method === "netbanking" && (
                    <div className="rzp-other-form">
                      <h3 className="rzp-form-title">Select your bank</h3>
                      <div className="rzp-field">
                        <select value={bank} onChange={(e) => setBank(e.target.value)}>
                          <option value="">Choose bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                        </select>
                      </div>
                      <button type="submit" className="rzp-continue-btn" disabled={loading}>Continue</button>
                    </div>
                  )}
                  {(method === "wallet" || method === "paylater") && (
                    <div className="rzp-other-form">
                      <p className="rzp-coming">This option will be available soon.</p>
                      <button type="button" className="rzp-continue-btn" onClick={() => setMethod("card")}>Use Card instead</button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="rzp-fullscreen-state">
            <div className="rzp-spinner" />
            <p className="rzp-processing-title">Processing payment</p>
            <p className="rzp-processing-desc">Please wait, do not close this window</p>
          </div>
        )}

        {step === "success" && (
          <div className="rzp-fullscreen-state rzp-success">
            <div className="rzp-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="rzp-success-title">Payment successful</p>
            <p className="rzp-success-desc">Your payment of ₹{amount} was completed successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
}
