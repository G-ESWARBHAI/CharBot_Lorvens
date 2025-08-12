import { create } from "zustand";
import axios from "axios";

// Use .env for API base; fallback to dev/prod defaults
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://chatbot-7m92.onrender.com");

// Generate or retrieve persistent chat ID
function getOrCreateChatId() {
  try {
    const key = "chatbot_chat_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

const persistentChatId = getOrCreateChatId();

// Try to extract assistant text from various formats
const extractAssistantText = (data) => {
  if (!data) return "";
  const webhook = data.webhookResponse ?? data;
  if (typeof webhook === "string") return webhook;

  const candidates = [
    webhook?.text,
    webhook?.reply,
    webhook?.message,
    webhook?.content,
    webhook?.output,
    data?.message,
    data?.output,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c;
  }

  if (webhook && typeof webhook === "object") {
    const keys = Object.keys(webhook);
    if (keys.length === 1 && typeof webhook[keys[0]] === "string") {
      const value = webhook[keys[0]];
      if (value.trim().length > 0) return value;
    }
  }

  try {
    return JSON.stringify(webhook);
  } catch {
    return "Received response";
  }
};

const useChatStore = create((set, get) => ({
  message: "",
  response: null,
  messages: [],
  isLoading: false,
  error: null,

  setMessage: (msg) => set({ message: msg }),

  clearChat: () => set({ messages: [], response: null, error: null }),

  sendMessage: async () => {
    const currentMessage = get().message?.trim();
    if (!currentMessage) return;

    const userEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
      content: currentMessage,
    };

    set((state) => ({
      messages: [...state.messages, userEntry],
      message: "",
      isLoading: true,
      error: null,
    }));

    try {
      const route =
        typeof window !== "undefined"
          ? window?.ChatWidgetConfig?.webhook?.route
          : undefined;

      const res = await axios.post(`${API_BASE}/api/chat`, {
        chatId: persistentChatId,
        message: currentMessage,
        route,
      });

      const assistantText = extractAssistantText(res?.data);
      const assistantEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: assistantText || "",
      };

      set((state) => ({
        response: res?.data ?? null,
        messages: [...state.messages, assistantEntry],
        isLoading: false,
      }));
    } catch (err) {
      console.error(err);
      const upstreamMessage =
        err?.response?.data?.error ?? err?.message ?? "Request failed";

      const assistantEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: `Error: ${upstreamMessage}`,
      };

      set((state) => ({
        messages: [...state.messages, assistantEntry],
        isLoading: false,
        error: upstreamMessage,
      }));
    }
  },
}));

export default useChatStore;
