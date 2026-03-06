import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatbotWidget() {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      role: "assistant",
      text: "Hi! Ask me anything about jobs, trips, payments, routes, or your account.",
    },
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const userId = user?._id || user?.id;
  const userRole = useMemo(() => user?.role || user?.userType || "user", [user]);

  useEffect(() => {
    if (!socket) return;
    if (userId) socket.emit("joinUserRoom", String(userId));
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;

    const onAnswer = ({ messageId, answer } = {}) => {
      setMessages((prev) => {
        const next = [...(prev || [])];
        if (messageId) {
          const idx = next.findIndex((m) => m.id === messageId);
          if (idx !== -1) {
            next[idx] = { ...next[idx], pending: false };
          }
        }
        next.push({
          id: uid(),
          role: "assistant",
          text: typeof answer === "string" ? answer : "Sorry, I couldn't answer that.",
        });
        return next;
      });
      setSending(false);
    };

    socket.on("chat:answer", onAnswer);
    return () => socket.off("chat:answer", onAnswer);
  }, [socket]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text || !socket) return;
    const messageId = uid();
    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...(prev || []),
      { id: messageId, role: "user", text },
    ]);
    socket.emit("chat:ask", {
      messageId,
      message: text,
      userId: userId ? String(userId) : undefined,
      userRole,
    });
  };

  return (
    <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 9999 }}>
      {!open ? (
        <button
          className="btn btn-primary"
          onClick={() => setOpen(true)}
          style={{
            borderRadius: 999,
            padding: "0.75rem 0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
          title="Chat"
        >
          <MessageCircle size={18} />
          Chat
        </button>
      ) : (
        <div
          className="card"
          style={{
            width: 360,
            maxWidth: "calc(100vw - 36px)",
            height: 460,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 0.9rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, lineHeight: 1.2 }}>TransSmart Assistant</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Real-time help (multilingual)
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              padding: "0.75rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  padding: "0.55rem 0.65rem",
                  borderRadius: 14,
                  background:
                    m.role === "user"
                      ? "rgba(124, 58, 237, 0.35)"
                      : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.9rem",
                  lineHeight: 1.25,
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "90%",
                  padding: "0.55rem 0.65rem",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "var(--color-text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Typing…
              </div>
            )}
          </div>

          <div
            style={{
              padding: "0.65rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type your question…"
              style={{
                flex: 1,
                borderRadius: 12,
                padding: "0.6rem 0.7rem",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "inherit",
                outline: "none",
              }}
              disabled={!socket}
            />
            <button className="btn btn-primary" onClick={send} disabled={!socket || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

