"use client";

import React, { useState } from "react";
import { Bot, Send, Mic, Sparkles, Globe, Volume2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export const AIChatbot: React.FC = () => {
  const [language, setLanguage] = useState<string>("English");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Namaste! I am AGRI-NOVA AI Assistant. Ask me anything about crop diseases, mandi prices, weather forecasts, or government subsidy schemes.",
      timestamp: "12:00 PM"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { sender: "user", text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Based on current agricultural telemetry, tomato market prices in your zone are trending upward at ₹45/kg. Ensure soil drip irrigation is set to 4,200 L/ha today.";
      if (language === "Malayalam") {
        reply = "ആഗ്രി-നോവ AI സഹായി: നിശ്ചിത തക്കാളി മാർക്കറ്റ് വില കിലോയ്ക്ക് ₹45 ആയി ഉയർന്നു. ഇന്ന് ജലസേചനം ആവശ്യാനുസരണം ക്രമീകരിക്കുക.";
      } else if (language === "Hindi") {
        reply = "एग्री-नोवा एआई सहायक: आपकी मंडी में टमाटर का भाव ₹45/किलो चल रहा है। आज शाम सिंचाई की सलाह दी जाती है।";
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <Card className="space-y-4 flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gray-900 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>AGRI-NOVA Multilingual AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-gray-600 animate-pulse" />
            </h3>
            <p className="text-[10px] text-gray-400">LLM Engine (Gemini / OpenAI Architecture)</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-2 text-xs">
          <Globe className="w-4 h-4 text-gray-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1 rounded-lg bg-gray-800 border border-gray-700 text-white font-medium text-xs focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Malayalam">മലയാളം (Malayalam)</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-gray-700/20 text-gray-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-xs sm:max-w-md rounded-2xl p-3 leading-relaxed ${
                m.sender === "user"
                  ? "bg-gray-900 text-white rounded-tr-none font-medium"
                  : "bg-gray-800 border border-gray-700/80 text-gray-200 rounded-tl-none"
              }`}
            >
              <p>{m.text}</p>
              <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{m.timestamp}</span>
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-gray-800 text-gray-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Bot className="w-4 h-4 animate-spin" />
            <span>AI is formulating response...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0 text-[10px]">
        <button
          onClick={() => handleQuickPrompt("What is today's tomato mandi price?")}
          className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 whitespace-nowrap"
        >
          💰 Tomato Price
        </button>
        <button
          onClick={() => handleQuickPrompt("How to apply for PM-KISAN subsidy?")}
          className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 whitespace-nowrap"
        >
          📜 PM-KISAN Scheme
        </button>
        <button
          onClick={() => handleQuickPrompt("When should I irrigate paddy fields?")}
          className="px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 whitespace-nowrap"
        >
          💧 Irrigation Advice
        </button>
      </div>

      {/* Input box */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-800 shrink-0 text-xs">
        <button className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-600 border border-gray-700" title="Voice Input">
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask AI Assistant in ${language}...`}
          className="flex-1 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-gray-700 focus:outline-none"
        />
        <Button onClick={handleSend} size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>

    </Card>
  );
};
