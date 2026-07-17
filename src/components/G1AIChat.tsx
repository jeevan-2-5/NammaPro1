import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Mic, Volume2, VolumeX, Bot, AlertCircle } from "lucide-react";
import { fetchApi } from "../lib/api";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface G1AIChatProps {
  onQuickBook?: (category: string, proId?: string) => void;
}

export default function G1AIChat({ onQuickBook }: G1AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "g1ai",
      text: "Hello, I am G1AI. Your premium 24/7 NammaPro concierge. I can recommend top-rated service experts, estimate booking prices, validate exclusive festive coupons, or register urgent support requests. How can I delight you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "Recommend top cleaning experts",
        "How much does plumbing cost?",
        "Show me exclusive coupons",
        "File a service complaint"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Speech Synthesis (Voice Output)
  const speakResponse = (text: string) => {
    if (!isSpeakingEnabled) return;
    try {
      window.speechSynthesis.cancel();
      // Remove basic markdown elements for cleaner speech
      const cleanText = text.replace(/\*\*|\*|#|-/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      
      // Try to find a warm female / premium voice
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en"));
      if (premiumVoice) utterance.voice = premiumVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Simulates Voice Recognition (Speech to Text)
  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback elegant simulation
      setIsListening(true);
      const simulatedPhrases = [
        "Recommend top cleaning experts in Bengaluru",
        "Apply NAMMAPRO20 coupon for discount",
        "Register a plumbing ticket"
      ];
      const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      
      setTimeout(() => {
        setInput(randomPhrase);
        setIsListening(false);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Basic regex markdown to HTML formatting
  const parseMarkdown = (text: string) => {
    let formatted = text;
    // Replace bold **text** with strong
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Replace bullet points
    formatted = formatted.replace(/^\s*-\s+(.*?)$/gm, "<li class='ml-4 list-disc text-sm my-1'>$1</li>");
    // Replace custom highlights or price metrics
    formatted = formatted.replace(/\$(\d+)/g, "<span class='font-mono font-bold text-teal-600 dark:text-teal-400'>$$$1</span>");
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetchApi("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: chatHistory,
          userMessage: textToSend
        })
      });

      const aiMsgId = `g1ai_${Date.now()}`;
      const aiResponseText = res.text;

      // Scan response for trigger elements to provide custom UI actions
      let computedSuggestions: string[] = [];
      if (aiResponseText.toLowerCase().includes("cleaning")) {
        computedSuggestions.push("Book Home Cleaning now");
      }
      if (aiResponseText.toLowerCase().includes("tutor")) {
        computedSuggestions.push("Book Expert Tutor");
      }
      if (aiResponseText.toLowerCase().includes("coupon")) {
        computedSuggestions.push("Apply Coupon NAMMAPRO20");
      }
      if (computedSuggestions.length === 0) {
        computedSuggestions = ["Find electricians", "View AC mechanics", "Help with billing"];
      }

      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: "g1ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: computedSuggestions
      };

      setMessages(prev => [...prev, aiMsg]);
      speakResponse(aiResponseText);

    } catch (error: any) {
      const failMsg: ChatMessage = {
        id: `g1ai_fail_${Date.now()}`,
        sender: "g1ai",
        text: "Hello, I am G1AI. I had a slight disruption connecting to the server. But do not worry, I can help you manually! You can type 'Book Home Cleaning' or 'Apply Coupon NAMMAPRO20' directly, and I will handle it.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, failMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Check if suggestion relates to direct booking
    if (suggestion.includes("Book Home Cleaning")) {
      if (onQuickBook) onQuickBook("cleaning");
      setIsOpen(false);
      return;
    }
    if (suggestion.includes("Book Expert Tutor")) {
      if (onQuickBook) onQuickBook("tutor");
      setIsOpen(false);
      return;
    }
    handleSendMessage(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <motion.button
        id="g1ai-chat-bubble-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.4)] border border-indigo-400/30 cursor-pointer relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500"></span>
        </span>
        
        {/* Hover Label */}
        <div className="absolute right-16 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with G1AI Assistant
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="g1ai-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 w-[380px] sm:w-[420px] h-[580px] bg-white dark:bg-slate-950 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800/80 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 text-white flex items-center justify-between border-b border-indigo-500/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    G1AI Concierge
                  </h3>
                  <p className="text-[11px] text-indigo-100/80">Always active • 24/7 Support</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Voice Speaker Control */}
                <button
                  id="g1ai-voice-speaker-toggle"
                  onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isSpeakingEnabled ? "text-yellow-300" : "text-white/60"
                  }`}
                  title={isSpeakingEnabled ? "Voice output: ON" : "Voice output: OFF"}
                >
                  {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  id="g1ai-chat-close"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Support Notification Banner */}
            <div className="bg-slate-50 dark:bg-slate-900/60 px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                You can talk to G1AI in <span className="font-semibold text-blue-600 dark:text-blue-400">English, Kannada, Hindi, Tamil</span> & more!
              </p>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-100 rounded-bl-none"
                    }`}
                  >
                    {/* Content text */}
                    <div className="space-y-1">
                      {msg.sender === "user" ? <p>{msg.text}</p> : parseMarkdown(msg.text)}
                    </div>
                    
                    {/* Timestamp */}
                    <span className="block text-[9.5px] mt-1.5 text-right text-slate-400 dark:text-slate-500">
                      {msg.timestamp}
                    </span>

                    {/* Suggestions within bubble */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-slate-800/80 text-[11px] font-medium text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-md transition-all active:scale-95"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Loader Skeleton */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 flex gap-2">
              <button
                id="g1ai-mic-btn"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? "bg-red-500 text-white border-red-500 animate-pulse scale-105 shadow-md"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                }`}
                title="Speak to G1AI"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  id="g1ai-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder={isListening ? "Listening..." : "Ask G1AI (e.g. recommend deep clean)..."}
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:bg-white"
                  disabled={isLoading}
                />
                
                <button
                  id="g1ai-submit-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
