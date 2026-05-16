/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, Clock, ShoppingCart, Info, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- AI Service ---

const SYSTEM_PROMPT = `You are GlowHaus Assistant, a friendly and professional customer service representative for a skincare brand based in Lagos, Nigeria.

Your goal is to help customers clearly, naturally, and efficiently.

Tone & Style:
- Warm, calm, and conversational
- Human-like, not robotic
- Clear and concise
- Never pushy or salesy
- Avoid hype or exaggerated claims
- Use simple English like WhatsApp chat
- Use emojis sparingly (only when natural)

Brand Knowledge:
Products:
- Glow Serum — ₦15,000
- Daily Moisturiser — ₦12,000
- Brightening Mask — ₦18,000
- Starter Kit — ₦38,000

Delivery:
- Lagos: Free delivery, 1–2 days
- Outside Lagos: ₦2,500, 3–5 days
- No international shipping

Ordering:
- Orders are placed via WhatsApp or Instagram DM
- Customer sends product, delivery details, and completes payment

Returns:
- Accepted within 7 days
- Items must be unopened and unused

Behavior Rules:
- Answer questions directly and clearly
- Keep responses short but helpful
- Format responses for readability
- When recommending:
  - Ask 1–2 clarifying questions if needed
  - Suggest only relevant products
- When explaining ordering:
  - Break into steps
- Never invent information

Escalation Rule:
If a question is outside your knowledge or is a complaint:
Say: “I’d love to make sure you get the right help with this. Let me connect you to a team member who can assist further.”

Do NOT:
- Make medical claims
- Sound robotic
- Overuse emojis
- Pressure the user`;

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: Date;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Components ---

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! Welcome to GlowHaus. I'm here to help you find the perfect skincare routine. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      // Simulate a small delay for natural feeling
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: response.text || "Sorry, I couldn't process that. Could you try again?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error("AI Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        text: "I'm having a little trouble connecting. Please try again in a moment!",
        timestamp: new Date(),
      }]);
    }
  };

  const quickReplies = [
    { label: "Prices", icon: <ShoppingCart size={14} />, query: "What are the prices of your products?" },
    { label: "Delivery", icon: <Clock size={14} />, query: "What are your delivery options and costs?" },
    { label: "Recommend for me", icon: <Search size={14} />, query: "What would you recommend for my skin?" },
    { label: "How to order", icon: <Info size={14} />, query: "How do I place an order?" },
  ];

  return (
    <div className="grid grid-cols-[350px_1fr] h-screen w-full max-w-[1440px] mx-auto bg-bg-app overflow-hidden border-r border-border">
      {/* Sidebar */}
      <aside className="bg-white border-r border-[#EEE] flex flex-col p-10 overflow-y-auto">
        <div className="brand-logo text-[32px] font-bold text-brand mb-2 tracking-tight">GlowHaus</div>
        <div className="brand-tagline text-sm text-[#999] mb-12">Pure. Radiant. Nigerian.</div>
        
        <h3 className="text-[12px] uppercase tracking-[1px] text-[#BBB] mb-4 font-bold">Our Essentials</h3>
        <div className="space-y-4">
          <div className="product-card bg-bg-app border border-[#F0EBE3] rounded-xl p-4">
            <h4 className="m-0 text-[15px] text-[#555] font-medium">Glow Serum</h4>
            <p className="m-0 text-[13px] text-brand font-bold">₦15,000</p>
          </div>
          <div className="product-card bg-bg-app border border-[#F0EBE3] rounded-xl p-4">
            <h4 className="m-0 text-[15px] text-[#555] font-medium">Daily Moisturiser</h4>
            <p className="m-0 text-[13px] text-brand font-bold">₦12,000</p>
          </div>
          <div className="product-card bg-bg-app border border-[#F0EBE3] rounded-xl p-4">
            <h4 className="m-0 text-[15px] text-[#555] font-medium">Brightening Mask</h4>
            <p className="m-0 text-[13px] text-brand font-bold">₦18,000</p>
          </div>
          <div className="product-card bg-bg-app border border-[#F0EBE3] rounded-xl p-4">
            <h4 className="m-0 text-[15px] text-[#555] font-medium">Starter Kit</h4>
            <p className="m-0 text-[13px] text-brand font-bold">₦38,000</p>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-[#EEE]">
          <p className="text-[12px] color-[#AAA] leading-relaxed">
            Delivery to Lagos: <strong>Free</strong><br />
            Outside Lagos: <strong>₦2,500</strong>
          </p>
        </div>
      </aside>

      {/* Chat Interface */}
      <div className="flex flex-col bg-bg-chat relative overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] z-10">
          <div>
            <div className="font-bold text-lg">Customer Care</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
              <span className="text-[12px] text-[#888]">Online</span>
            </div>
          </div>
          <div className="text-xl text-brand cursor-pointer">⋮</div>
        </header>

        {/* Chat Body */}
        <main className="flex-1 overflow-y-auto p-8 space-y-4 scroll-smooth" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-[18px] py-[14px] rounded-[18px] text-[15px] leading-relaxed shadow-sm relative ${
                    message.role === 'user'
                      ? 'bg-msg-user text-ink-user rounded-br-[4px]'
                      : 'bg-white text-[#333] rounded-bl-[4px]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="italic text-[12px] text-[#AAA] mb-2 animate-pulse">
              Assistant is typing...
            </div>
          )}
        </main>

        {/* Quick Replies */}
        <div className="px-8 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {quickReplies.map((reply) => (
            <button
              key={reply.label}
              onClick={() => handleSend(reply.query)}
              className="bg-white border border-brand text-brand px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all hover:bg-brand hover:text-white whitespace-nowrap"
            >
              {reply.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <footer className="bg-white p-5 px-8 flex items-center gap-4 border-t border-[#EEE]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about products, delivery..."
            className="flex-grow bg-[#F5F5F5] border-none py-3.5 px-5 rounded-[24px] text-[15px] outline-none placeholder:text-[#AAA]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`bg-brand text-white w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ➔
          </button>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
