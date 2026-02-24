"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  sender: "USER" | "AI";
  text: string;
  classification?: { type: string; amount: number } | null;
}

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "USER",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === "PAID_ONLY") {
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "AI",
            text: "🔒 Trinit AI Chat is a premium feature. Upgrade your plan to unlock AI-powered financial insights, expense tracking, and personalized advice.",
          }]);
          setIsLoading(false);
          return;
        }
        throw new Error(err.error || "Failed to send message");
      }

      const data = await res.json();
      const aiMsg: Message = {
        id: data.chatId || (Date.now() + 1).toString(),
        sender: "AI",
        text: data.reply,
        classification: data.classification,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "AI",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className="relative w-full h-full flex flex-col p-4 md:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center z-10 mb-4"
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            className="absolute -top-4 -left-32 md:-left-36 bg-black text-white text-[10px] md:text-xs px-4 py-3 rounded-3xl rounded-br-none shadow-2xl border border-white/20 font-mono tracking-tighter z-10"
            style={{ minWidth: "120px", textAlign: "center" }}
          >
            Let&apos;s work<br/>on your<br/>finances
          </motion.div>
          <div className="text-6xl md:text-7xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            🐸
          </div>
        </div>
      </motion.div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col shadow-2xl z-10 relative mb-4"
      >
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
          {messages.length === 0 ? (
            <>
              <div className="flex flex-col gap-5 text-white/90 max-w-2xl">
                <div className="flex items-center gap-3"><img src="/trinit_logo.jpg" alt="Trinit" className="w-10 h-10 rounded-full object-cover" /><h2 className="text-2xl font-bold text-white tracking-wide">Trinit</h2></div>
                <p className="text-lg md:text-xl font-medium tracking-wide">Hi! I&apos;m Trinit 👋</p>
                <p className="text-base md:text-lg leading-relaxed text-white/80">
                  I&apos;ll help you keep track of your spending and stay in control of your money — one message at a time.
                </p>
                <p className="text-base md:text-lg text-white/80 mt-2">What would you like to do first?</p>
              </div>

              <div className="flex flex-col gap-3 mt-4 max-w-xl">
                {[
                  { text: "How does this work?", icon: "➔" },
                  { text: "Create a savings goal", icon: "➔" },
                  { text: "Add my first expense", icon: "➔" },
                  { text: "Analyze my portfolio vs. competitors", icon: "📊" },
                ].map((btn, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                    onClick={() => handleSuggestion(btn.text)}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-left px-5 py-4 rounded-2xl flex justify-between items-center transition-all group shadow-lg"
                  >
                    <span className="text-white/90 font-medium text-base tracking-wide">{btn.text}</span>
                    <span className="text-white/50 group-hover:text-white transition-colors text-xl font-bold">{btn.icon}</span>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-2xl ${
                    msg.sender === "USER"
                      ? "bg-white/20 text-white rounded-br-sm"
                      : "bg-white/5 text-white/90 rounded-bl-sm border border-white/10"
                  }`}
                >
                  {msg.sender === "AI" && (
                    <div className="text-xs text-white/50 mb-1 font-medium">Trinit</div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.classification?.type && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        msg.classification.type === "INCOME" ? "bg-green-500/20 border-green-500/30 text-green-400" :
                        msg.classification.type === "EXPENSE" ? "bg-red-500/20 border-red-500/30 text-red-400" :
                        "bg-white/10 border-white/20 text-white/60"
                      }`}>
                        {msg.classification.type}
                      </span>
                      {msg.classification.amount && (
                        <span className="text-xs font-mono text-white/50">${msg.classification.amount}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-bl-sm">
                <div className="text-xs text-white/50 mb-1 font-medium">Trinit</div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="text-white/60 text-sm"
                >
                  Thinking...
                </motion.div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 relative flex-shrink-0"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question, add a new expense..."
            disabled={isLoading}
            className="w-full bg-black/40 border-2 border-white/20 rounded-full pl-6 pr-16 py-4 md:py-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors text-base md:text-lg shadow-inner disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-white hover:bg-white/90 text-black rounded-full flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45 ml-1">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </motion.div>
      </motion.main>
    </div>
  );
}
