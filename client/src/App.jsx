import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, X, Bot, User, Cpu, ChevronRight, Menu, MessageSquare, History, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome, Engineer. I am your specialized AI assistant. How can I assist you with your technical problems today?' }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('flash');
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const userMessage = { role: 'user', text: input, fileName: file?.name };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('message', input);
    formData.append('model', selectedModel);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post(`${API_BASE}/chat`, formData);
      setMessages(prev => [...prev, { role: 'ai', text: response.data.text }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Failed to process your request. Please ensure the server is running.' }]);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!showWorkbench) {
    return (
      <div className="landing-container">
        <div className="landing-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="hero-title">ENGINEERING<br />AI CORE</h1>
            <p className="hero-subtitle">
              Advanced technical intelligence for modern complex challenges.
            </p>
            <div className="flex justify-center">
              <button className="btn-enter" onClick={() => setShowWorkbench(true)}>
                Enter Workbench
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button
        className="sidebar-toggle md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="brand-text">ENG AI</h1>
          <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: MessageSquare, label: 'Workbench', active: true },
            { icon: History, label: 'History', active: false },
            { icon: Settings, label: 'Settings', active: false }
          ].map((item, i) => (
            <button
              key={i}
              className={`nav-btn ${item.active ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border-glass opacity-60">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest text-text-muted">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            SYSTEM OPERATIONAL
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="main-chat" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <header className="chat-header">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Workbench 1.0</h2>

          <div className="model-switcher">
            <button
              className={`model-btn ${selectedModel === 'flash' ? 'active' : ''}`}
              onClick={() => setSelectedModel('flash')}
            >
              Flash
            </button>
            <button
              className={`model-btn ${selectedModel === 'pro' ? 'active' : ''}`}
              onClick={() => setSelectedModel('pro')}
            >
              Pro
            </button>
          </div>
        </header>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              <div className="message-bubble">
                {msg.fileName && (
                  <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 text-xs">
                    <FileText size={14} className="text-accent-primary" />
                    <span className="font-medium">{msg.fileName}</span>
                  </div>
                )}

                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-bubble opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="input-area">
          <div className="input-wrapper">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".pdf,image/*"
            />
            <button
              className="p-2 text-text-secondary hover:text-white transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={20} />
            </button>

            <div className="flex flex-col flex-1">
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="file-preview mb-2 flex justify-between items-center bg-accent-soft p-2 rounded-lg border border-border-accent"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-medium text-accent-primary truncate">
                      <FileText size={12} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => setFile(null)} className="text-accent-primary hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <textarea
                placeholder="Talk to engine..."
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            <button className="btn-send" onClick={handleSend}>
              <Send size={20} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

