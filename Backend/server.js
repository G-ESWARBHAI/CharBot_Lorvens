// backend/server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://rguktstuff784.app.n8n.cloud/webhook/3c15abd5-cc89-47ee-9563-5ddd20d36259/chat";

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", webhookConfigured: Boolean(WEBHOOK_URL), target: WEBHOOK_URL });
});

// Help users who GET the chat endpoint in a browser
app.get("/api/chat", (_req, res) => {
  res.status(405).json({ success: false, error: "Use POST /api/chat with JSON { message }" });
});

// Simple mock to validate frontend quickly
app.post("/api/mock", (req, res) => {
  const { message } = req.body ?? {};
  const reply = message ? `You said: ${message}` : "Hello! Ask me anything.";
  return res.json({ success: true, webhookResponse: { text: reply } });
});

// Forward to n8n webhook
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatId, route } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const payload = {
      chatId,
      route,
      message,
      text: message,
      prompt: message,
      input: message,
    };

    const response = await axios.post(WEBHOOK_URL, payload, { timeout: 20000 });

    return res.json({ success: true, webhookResponse: response.data });
  } catch (error) {
    const status = error?.response?.status ?? 500;
    const upstreamData = error?.response?.data ?? null;
    const errorMessage = error?.message || "Failed to send message to webhook";
    console.error("Error calling webhook:", { status, message: errorMessage, upstreamData });
    return res.status(status).json({
      success: false,
      error: errorMessage,
      upstreamStatus: status,
      upstreamData,
      target: WEBHOOK_URL,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
  