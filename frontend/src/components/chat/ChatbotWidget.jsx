import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Volume2, MessageCircle, Send } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "mr-IN", label: "मराठी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
];

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatbotWidget() {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
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
      const text = typeof answer === "string" ? answer : "Sorry, I couldn't answer that.";
      setMessages((prev) => {
        const next = [...(prev || [])];
        if (messageId) {
          const idx = next.findIndex((m) => m.id === messageId);
          if (idx !== -1) {
            next[idx] = { ...next[idx], pending: false };
          }
        }
        next.push({ id: uid(), role: "assistant", text });
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

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput((prev) => prev + (prev ? " " : "") + "(Voice not supported in this browser)");
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
        setInput((prev) => (prev ? prev + " " : "") + transcript);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
    recognitionRef.current.lang = language;
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  };

  const speakLastResponse = () => {
    const lastMsg = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastMsg?.text || !("speechSynthesis" in window)) return;
    if (synthRef.current) window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(lastMsg.text);
    utter.lang = language;
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    synthRef.current = utter;
  };

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
      preferredLanguage: language,
    });
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="chat-trigger"
            className="btn btn-primary"
            onClick={() => setOpen(true)}
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(201, 155, 74, 0.3)",
            }}
            title="Chat"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={26} strokeWidth={2} />
          </motion.button>
        ) : (
          <motion.div
            key="chat-panel"
            className="card chatbot-panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              width: 420,
              maxWidth: "calc(100vw - 40px)",
              height: 520,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              padding: "0.75rem 0.9rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: 700, lineHeight: 1.2 }}>TransSmart Assistant</div>
            <select
              className="chatbot-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              title="Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
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
                      ? "rgba(201, 155, 74, 0.25)"
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
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={listening ? stopListening : startListening}
              title={listening ? "Stop listening" : "Voice input"}
              style={{
                padding: "0.5rem",
                minWidth: 36,
                color: listening ? "var(--color-error)" : undefined,
              }}
            >
              <Mic size={18} />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={speakLastResponse}
              disabled={!messages.some((m) => m.role === "assistant") || speaking}
              title="Read last response aloud"
              style={{ padding: "0.5rem", minWidth: 36 }}
            >
              <Volume2 size={18} />
            </button>
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
            <button className="btn btn-primary" onClick={send} disabled={!socket || !input.trim()} title="Send">
              <Send size={18} />
            </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

