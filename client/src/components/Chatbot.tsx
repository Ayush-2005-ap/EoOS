"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useVelocity, useSpring, useTransform } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I am the EoOS AI Assistant. Ask me anything about the Ease of Operating Schools Index 2026" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll physics for the button (parallax then snap back)
  const { scrollY } = useScroll();
  const springScrollY = useSpring(scrollY, {
    stiffness: 40,
    damping: 20,
    mass: 1
  });
  
  // buttonY will precisely offset the scroll so the button moves WITH the page content,
  // and then slowly springs back to its resting position.
  const buttonY = useTransform(() => springScrollY.get() - scrollY.get());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I am having trouble connecting to the server right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {isOpen ? (
        <motion.button
          onClick={() => setIsOpen(false)}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 p-4 bg-[#FFCC00] text-[#2D3B60] rounded-full shadow-lg hover:bg-[#FFD633] transition-colors z-50 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[32px]">close</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={() => setIsOpen(true)}
          style={{ y: buttonY }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-1/2 right-0 -translate-y-1/2 z-50 flex items-center cursor-pointer transition-transform hover:-translate-x-1 group"
        >
          <div className="bg-[#242424] text-[#FFCC00] font-bold text-[15px] pl-4 pr-3 py-2 rounded-l-lg shadow-md flex items-center h-[2.75rem] border border-r-0 border-[#333]">
            EoOS Navigator
          </div>
          <div className="bg-[#FFCC00] text-[#242424] rounded-l-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center h-[3.5rem] w-[3.5rem] relative -ml-2 z-10 border-y border-l border-[#E6B800] transition-colors group-hover:bg-[#FFD633]">
            <span className="material-symbols-outlined text-[32px]">search</span>
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[22rem] h-[36rem] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl border border-gray-100 z-50 overflow-hidden bg-[#F8F9FA]">
          <div className="p-4 bg-gradient-to-r from-[#2D3B60] to-[#3B4D7E] text-white flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-[15px] leading-tight tracking-wide">EoOS Navigator</h3>
                <p className="text-[11px] text-white/80 font-medium tracking-wider uppercase mt-0.5">Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div 
                  className={`px-4 py-3 max-w-[85%] rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-[#2D3B60] to-[#3B4D7E] text-white rounded-br-sm shadow-md" 
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  ) : (
                    <div className="text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-2" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 max-w-[85%]">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Sources: </span>
                    {msg.sources.map((s, i) => {
                      if (s.approx_pdf_page_range && s.approx_pdf_page_range.length > 0) {
                        return (
                          <a 
                            key={i} 
                            href={`/EoOS_Report_2026.pdf#page=${s.approx_pdf_page_range[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 rounded-md px-2 py-0.5 mt-1 mr-1.5 text-blue-700 no-underline font-medium text-[11px]"
                            title="Click to view this page in the report"
                          >
                            {s.state ? `${s.state} ` : ""} (Pg {s.approx_pdf_page_range[0]})
                          </a>
                        );
                      }
                      
                      let label = "Data Table";
                      if (s.sub_indicator) label = `${s.sub_indicator}`;
                      else if (s.indicator) label = `${s.indicator}`;
                      else if (s.domain) label = `${s.domain}`;
                      
                      return (
                        <span 
                          key={i}
                          className="inline-block bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5 mt-1 mr-1.5 text-gray-700 font-medium text-[11px] truncate max-w-full"
                          title={label}
                        >
                          {s.state ? `${s.state}: ` : ""}{label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#2D3B60] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#2D3B60] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#2D3B60] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-3 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2D3B60]/20 focus:border-transparent text-sm text-black placeholder-gray-400 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D3B60] to-[#3B4D7E] text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-xl ml-1">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
