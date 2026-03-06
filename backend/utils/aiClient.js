const AppError = require("./AppError");

function getRequiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new AppError(`Missing ${name} in server environment`, 501);
  return v;
}

/**
 * Groq API chat completions (OpenAI-compatible).
 * Used for smart match and route optimization.
 */
async function groqChatJson({ messages, model, timeoutMs = 25000 }) {
  const apiKey = getRequiredEnv("GROQ_API_KEY");
  const usedModel = model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: usedModel,
        temperature: 0.2,
        messages,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data?.error?.message ||
        `Groq request failed with status ${res.status}`;
      throw new AppError(msg, 502);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new AppError("Groq returned empty response", 502);

    try {
      return JSON.parse(content);
    } catch {
      throw new AppError("Groq returned non-JSON output", 502);
    }
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new AppError("Groq request timed out", 504);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function groqChatText({ messages, model, timeoutMs = 25000 }) {
  const apiKey = getRequiredEnv("GROQ_API_KEY");
  const usedModel = model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: usedModel,
        temperature: 0.2,
        messages,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data?.error?.message ||
        `Groq request failed with status ${res.status}`;
      throw new AppError(msg, 502);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new AppError("Groq returned empty response", 502);
    return String(content);
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new AppError("Groq request timed out", 504);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function aiRankTrucksForJob({ job, trucks }) {
  const payload = {
    job: {
      id: job._id?.toString?.() || String(job._id),
      title: job.title,
      pickupLocation: job.pickupLocation,
      deliveryLocation: job.deliveryLocation,
      price: job.price,
      requiredCapacity: Number(job.requiredCapacity) || 0,
      preferredDeliveryDate: job.preferredDeliveryDate || null,
    },
    trucks: (trucks || []).map((t) => ({
      id: t._id?.toString?.() || String(t._id),
      truckNumber: t.truckNumber,
      capacity: t.capacity,
      fuelType: t.fuelType,
      availability: t.availability,
      transporter: {
        id: t.transporter?._id?.toString?.() || String(t.transporter?._id || ""),
        name: t.transporter?.name,
      },
    })),
  };

  const messages = [
    {
      role: "system",
      content:
        "You are an AI dispatch matcher for a logistics platform. " +
        "Return ONLY valid JSON. No markdown. No extra keys.",
    },
    {
      role: "user",
      content:
        "Rank the best trucks for this job.\n\n" +
        "Rules:\n" +
        "- Exclude trucks with availability != 'available'.\n" +
        "- Exclude trucks whose capacity is less than job.requiredCapacity (if requiredCapacity > 0).\n" +
        "- Prefer closest capacity fit (minimize excess capacity) while meeting requirement.\n" +
        "- Prefer eco-friendly fuel types (electric > petrol > diesel) when other factors similar.\n" +
        "- Return up to 10 suggestions.\n\n" +
        "Output schema:\n" +
        "{ \"suggestions\": [ { \"truckId\": string, \"score\": number (0-100), \"reasons\": string[] } ] }\n\n" +
        "Input:\n" +
        JSON.stringify(payload),
    },
  ];

  const out = await groqChatJson({ messages });
  const suggestions = Array.isArray(out?.suggestions) ? out.suggestions : [];
  return suggestions
    .filter((s) => typeof s?.truckId === "string")
    .slice(0, 10)
    .map((s) => ({
      truckId: s.truckId,
      score:
        typeof s.score === "number" && Number.isFinite(s.score)
          ? Math.max(0, Math.min(100, Math.round(s.score)))
          : 0,
      reasons: Array.isArray(s.reasons)
        ? s.reasons.filter((r) => typeof r === "string").slice(0, 4)
        : [],
    }));
}

async function aiChooseBestRoute({ job, candidates, objective }) {
  const payload = {
    job: {
      id: job._id?.toString?.() || String(job._id),
      pickupLocation: job.pickupLocation,
      deliveryLocation: job.deliveryLocation,
      requiredCapacity: Number(job.requiredCapacity) || 0,
    },
    objective: objective || "eco",
    candidates: (candidates || []).map((c, idx) => ({
      index: idx,
      distance_km: c.distance,
      duration_minutes: Math.round((c.duration || 0) / 60),
      fuel_used_liters: c.fuelUsed,
      fuel_cost: c.fuelCost,
      greenScore: c.greenScore,
      previewSteps: (c.steps || []).slice(0, 4).map((s) => s.instruction),
    })),
  };

  const messages = [
    {
      role: "system",
      content:
        "You are an AI route selector for logistics. " +
        "Return ONLY valid JSON. No markdown. No extra keys.",
    },
    {
      role: "user",
      content:
        "Choose the single best route candidate.\n\n" +
        "Priorities by objective:\n" +
        "- 'eco': maximize greenScore, then minimize fuel_cost, then minimize duration.\n" +
        "- 'fastest': minimize duration, then minimize distance.\n" +
        "- 'cheapest': minimize fuel_cost, then minimize distance.\n\n" +
        "Output schema:\n" +
        "{ \"bestIndex\": number, \"reason\": string }\n\n" +
        "Input:\n" +
        JSON.stringify(payload),
    },
  ];

  const out = await groqChatJson({ messages });
  const bestIndex =
    typeof out?.bestIndex === "number" && Number.isFinite(out.bestIndex)
      ? Math.trunc(out.bestIndex)
      : 0;
  return {
    bestIndex,
    reason: typeof out?.reason === "string" ? out.reason : "",
  };
}

module.exports = { aiRankTrucksForJob, aiChooseBestRoute, groqChatText };
