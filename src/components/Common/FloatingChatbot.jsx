import React, { useState } from "react";
import { MessageCircle, X, Send, Loader2, RotateCcw } from "lucide-react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL || ""}/chatbot`;

// Renders inline **bold** but keeps double quotes outside bold so "text" doesn't show as bold
function renderInlineBold(str) {
  const parts = [];
  let remaining = str;
  let key = 0;
  while (remaining.length > 0) {
    const boldStart = remaining.indexOf("**");
    if (boldStart === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (boldStart > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, boldStart)}</span>);
    }
    remaining = remaining.slice(boldStart + 2);
    const boldEnd = remaining.indexOf("**");
    if (boldEnd === -1) {
      parts.push(<span key={key++}>**{remaining}</span>);
      break;
    }
    let boldContent = remaining.slice(0, boldEnd);
    // Keep leading/trailing double quotes outside bold
    let prefix = "";
    let suffix = "";
    if (boldContent.startsWith('"') && boldContent.endsWith('"') && boldContent.length > 1) {
      prefix = '"';
      suffix = '"';
      boldContent = boldContent.slice(1, -1);
    }
    parts.push(<span key={key++}>{prefix}<strong className="font-semibold text-richblack-25">{boldContent}</strong>{suffix}</span>);
    remaining = remaining.slice(boldEnd + 2);
  }
  return <>{parts}</>;
}

function formatResponse(text) {
  if (!text) return null;
  const lines = text.split("\n").map((line, index) => {
    if (line.trim() === "") return null;
    // Full-line bold heading; keep double quotes outside bold
    if (line.startsWith("**") && line.endsWith("**")) {
      let inner = line.replace(/\*\*/g, "").trim();
      if (inner.startsWith('"') && inner.endsWith('"') && inner.length > 1) {
        inner = inner.slice(1, -1);
        return (
          <h3 key={index} className="text-[#FCB045] text-sm mt-2">
            "<span className="font-bold">{inner}</span>"
          </h3>
        );
      }
      return (
        <h3 key={index} className="font-bold text-[#FCB045] text-sm mt-2">
          {inner}
        </h3>
      );
    }
    if (line.startsWith("* ") && !line.startsWith("**")) {
      return (
        <li key={index} className="list-disc ml-4 text-richblack-100 text-sm">
          {renderInlineBold(line.replace(/^\* /, ""))}
        </li>
      );
    }
    return (
      <p key={index} className="text-richblack-5 text-sm">
        {renderInlineBold(line)}
      </p>
    );
  });
  return <div className="space-y-1">{lines}</div>;
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmedInput }]);
    setIsLoading(true);
    setInput("");

    try {
      const { data } = await axios.post(API_URL, { message: trimmedInput });
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Something went wrong. Try again.";
      setMessages((prev) => [...prev, { sender: "bot", text: `❌ ${msg}` }]);
    }
    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FCB045]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[999] flex h-[420px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-richblack-600 bg-richblack-800 shadow-2xl">
          <div className="border-b border-richblack-600 bg-richblack-700 px-4 py-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white">StudyNotion Assistant</h3>
              <p className="text-xs text-richblack-400">
                Ask about courses, categories, pricing & navigation. No login needed.
              </p>
            </div>
            <button
              onClick={resetChat}
              disabled={isLoading}
              className="shrink-0 rounded-lg p-2 text-richblack-400 hover:bg-richblack-600 hover:text-white transition-colors disabled:opacity-50"
              title="Clear chat and start new session"
              aria-label="Reset chat"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6 text-richblack-400 text-sm">
                👋 Ask me about courses, prices, categories, or how to use the platform.
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-sm ${
                  msg.sender === "user"
                    ? "ml-8 bg-richblack-600 text-richblack-25"
                    : "mr-4 bg-richblack-700 text-richblack-100 border border-richblack-600"
                }`}
              >
                {formatResponse(msg.text)}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-richblack-400 text-sm">
                <Loader2 className="animate-spin" size={18} />
                <span>Thinking...</span>
              </div>
            )}
          </div>
          <div className="border-t border-richblack-600 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-richblack-500 bg-richblack-700 px-3 py-2 text-sm text-white placeholder-richblack-400 outline-none focus:ring-1 focus:ring-[#FCB045]"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="rounded-lg bg-[#FCB045] p-2 text-richblack-900 hover:opacity-90 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
