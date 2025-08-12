import { useEffect, useRef } from "react";
import useChatStore from "../stores/chatStore";

export default function ChatComponent() {
  const {
    message,
    messages,
    isLoading,
    error,
    setMessage,
    sendMessage,
    clearChat,
  } = useChatStore();

  const listEndRef = useRef(null);

  const handleSend = () => {
    if (!message?.trim() || isLoading) return;
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-950 text-left">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800 bg-zinc-900/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-emerald-600 grid place-items-center text-white font-bold">CB</div>
          <div>
            <p className="text-zinc-100 font-semibold">Surya Agent</p>
            <p className="text-xs text-zinc-400">Your AI assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center text-center text-zinc-400 gap-2">
            <div className="text-2xl">👋</div>
            <p className="text-sm">Start the conversation. Ask me anything.</p>
            <p className="text-xs text-zinc-500">Tips: product info, how-tos, troubleshooting</p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}

        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600/90 text-white grid place-items-center text-xs font-bold">AI</div>
            <div className="px-3 py-2 rounded-2xl rounded-tl-none bg-zinc-800 border border-zinc-700 text-zinc-100 max-w-[80%]">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 px-2">{error}</div>
        )}

        <div ref={listEndRef} />
      </div>

      <div className="border-t border-zinc-800 bg-zinc-900 p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message"
            className="flex-1 resize-none rounded-lg bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 border border-zinc-700 focus:border-indigo-600 focus:outline-none px-3 py-2 sm:py-2.5 max-h-40"
          />
          <button
            onClick={handleSend}
            disabled={!message?.trim() || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-3.5 sm:px-4 py-2 shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.4 20.6 22 12 3.4 3.4l-.9 7.2 10.5 1.4-10.5 1.4.9 7.2z" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-zinc-500">Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold ${isUser ? "bg-zinc-700 text-zinc-200" : "bg-emerald-600/90 text-white"}`}>
          {isUser ? "U" : "AI"}
        </div>
        <div className={`${isUser ? "bg-emerald-600 text-white border-emerald-500" : "bg-zinc-800 text-zinc-100 border-zinc-700"} px-3 py-2 rounded-2xl ${isUser ? "rounded-tr-none" : "rounded-tl-none"} border`}>
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
