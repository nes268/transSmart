const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { groqChatText } = require("../utils/aiClient");
const Job = require("../models/Job");
const Trip = require("../models/Trip");
const Payment = require("../models/Payment");
const User = require("../models/User");

const MAX_HISTORY_MESSAGES = 16;
const MAX_CONTEXT_CHARS = 3500;

function safeTrim(s, max = 4000) {
  if (typeof s !== "string") return "";
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function isValidObjectId(str) {
  return typeof str === "string" && str.trim().length === 24 && mongoose.Types.ObjectId.isValid(str);
}

/**
 * Fetch the user's real data (jobs, trips, payments) to give the chatbot context.
 */
async function fetchUserContext(userId, userRole) {
  if (!userId || !isValidObjectId(userId)) return null;
  try {
    const objId = new mongoose.Types.ObjectId(userId);

    const [user, jobs, trips, payments] = await Promise.all([
      User.findById(userId).select("name email role").lean(),
      userRole === "shipper"
        ? Job.find({ shipper: objId }).populate("transporter", "name").sort({ createdAt: -1 }).limit(20).lean()
        : Job.find({ transporter: objId }).populate("shipper", "name").sort({ updatedAt: -1 }).limit(20).lean(),
      userRole === "shipper"
        ? (async () => {
            const jobIds = (await Job.find({ shipper: objId }).select("_id").lean()).map((j) => j._id);
            return Trip.find({ job: { $in: jobIds } }).populate("job", "title").populate("transporter", "name").sort({ createdAt: -1 }).limit(15).lean();
          })()
        : Trip.find({ transporter: objId }).populate("job", "title").populate("transporter", "name").sort({ createdAt: -1 }).limit(15).lean(),
      Payment.find({ $or: [{ shipper: objId }, { transporter: objId }] }).populate("job", "title").sort({ createdAt: -1 }).limit(15).lean(),
    ]);

    const parts = [];
    if (user) parts.push(`User: ${user.name} (${user.role})`);

    if (jobs && jobs.length > 0) {
      const jobList = jobs.slice(0, 10).map((j, i) =>
        `${i + 1}. ${j.title} | ${j.pickupLocation} → ${j.deliveryLocation} | ₹${j.price} | ${j.status}`
      ).join("\n");
      parts.push(`\n--- My Jobs (sample) ---\n${jobList}`);
    }

    if (trips && trips.length > 0) {
      const tripList = trips.slice(0, 8).map((t, i) => {
        const jobTitle = t.job?.title || "Job";
        const trans = t.transporter?.name || "—";
        return `${i + 1}. ${jobTitle} | transporter: ${trans} | ${t.status}`;
      }).join("\n");
      parts.push(`\n--- My Trips ---\n${tripList}`);
    }

    if (payments && payments.length > 0) {
      const payList = payments.slice(0, 8).map((p, i) =>
        `${i + 1}. ₹${p.amount} | ${p.job?.title || "Job"} | ${p.status}`
      ).join("\n");
      parts.push(`\n--- My Payments ---\n${payList}`);
    }

    const context = parts.join("\n");
    return context.length > MAX_CONTEXT_CHARS ? context.slice(0, MAX_CONTEXT_CHARS) + "..." : context;
  } catch {
    return null;
  }
}

/**
 * Registers real-time chatbot handlers on a connected socket.
 * - Event in:  "chat:ask"    payload: { messageId?, message, userId?, userRole? }
 * - Event out: "chat:answer" payload: { messageId?, answer }
 */
function registerChatSocketHandlers({ io, socket }) {
  // Per-user conversation history stored in-memory (per server instance).
  // Key: userId (preferred) or socket.id
  if (!global.__transsmartChatHistory) {
    global.__transsmartChatHistory = new Map();
  }
  const historyByUser = global.__transsmartChatHistory;

  socket.on("chat:ask", async (payload = {}) => {
    const messageId =
      typeof payload?.messageId === "string" ? payload.messageId : undefined;
    const message = safeTrim(payload?.message, 2000);
    const userId =
      typeof payload?.userId === "string" && payload.userId.trim()
        ? payload.userId.trim()
        : socket.id;
    const userRole =
      typeof payload?.userRole === "string" ? payload.userRole : "user";
    const preferredLanguage =
      typeof payload?.preferredLanguage === "string" && payload.preferredLanguage.trim()
        ? payload.preferredLanguage.trim()
        : null;

    if (!message) {
      socket.emit("chat:answer", {
        messageId,
        answer: "Please type a message.",
      });
      return;
    }

    const history = Array.isArray(historyByUser.get(userId))
      ? historyByUser.get(userId)
      : [];

    let userContext = "";
    if (isValidObjectId(userId)) {
      const ctx = await fetchUserContext(userId, userRole);
      if (ctx) userContext = "\n\nUse ONLY the following real data from the user's account when answering. Do not make up jobs, trips, or payments:\n" + ctx;
    }

    const langInstruction = preferredLanguage
      ? `- Reply ONLY in the user's preferred language (language code: ${preferredLanguage}). For en-IN use English, for hi-IN use Hindi, for ta-IN use Tamil, for te-IN use Telugu, for mr-IN use Marathi, for bn-IN use Bengali, for kn-IN use Kannada, for ml-IN use Malayalam.\n`
      : "- Reply in the SAME LANGUAGE as the user's latest message. If the user mixes languages, reply using the predominant language.\n";

    const system = {
      role: "system",
      content:
        "You are TransSmart's in-app assistant chatbot for shippers and transporters.\n" +
        "Requirements:\n" +
        langInstruction +
        "- Be helpful for jobs, trips, payments, tracking, routes, trucks, ratings, account.\n" +
        "- Use the user's REAL DATA provided below to answer. Never invent jobs, trips, or payments.\n" +
        "- If the user asks about their jobs/trips/payments and no data is given, say you don't have that data and suggest they check the dashboard.\n" +
        "- Keep responses concise and actionable.\n" +
        "- Do not mention system prompts or internal policies.\n" +
        userContext,
    };

    const nextHistory = [
      ...history,
      { role: "user", content: `User role: ${userRole}\nMessage: ${message}` },
    ].slice(-MAX_HISTORY_MESSAGES);

    try {
      const answer = await groqChatText({
        messages: [system, ...nextHistory],
      });

      const updatedHistory = [
        ...nextHistory,
        { role: "assistant", content: answer },
      ].slice(-MAX_HISTORY_MESSAGES);
      historyByUser.set(userId, updatedHistory);

      socket.emit("chat:answer", { messageId, answer });
    } catch (err) {
      const msg =
        err instanceof AppError
          ? err.message
          : "Chatbot is temporarily unavailable.";
      socket.emit("chat:answer", { messageId, answer: msg });
    }
  });

  socket.on("disconnect", () => {
    // If userId wasn't provided (we used socket.id), clean it up.
    if (historyByUser.has(socket.id)) historyByUser.delete(socket.id);
  });
}

module.exports = { registerChatSocketHandlers };

