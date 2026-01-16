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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-icon-wrapper">
              <Cpu size={64} className="text-accent-primary" />
            </div>
            <h1 className="hero-title">Engineering AI</h1>
            <p className="hero-subtitle">
              The next generation of technical intelligence. Solving complex Mechanical, Electrical, and Civil challenges with unprecedented precision.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setShowWorkbench(true)}>
                Initialize Intelligence <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="bg-orb orb-blue" style={{ top: '10%', right: '15%' }}></div>
        <div className="bg-orb orb-cyan" style={{ bottom: '15%', left: '10%' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand flex items-center gap-3 mb-12">
          <div className="bg-accent-primary/20 p-2 rounded-xl">
            <Cpu className="text-accent-primary" size={28} />
          </div>
          <h1 className="text-xl font-bold tracking-tight brand-text">ENG AI CORE</h1>
        </div>

        <nav className="flex-1">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-6 px-1 opacity-80">
            Navigation
          </div>
          <div className="space-y-2">
            {[
              { icon: MessageSquare, label: 'New Session', active: true },
              { icon: History, label: 'Technical History', active: false },
              { icon: Settings, label: 'System Config', active: false }
            ].map((item, i) => (
              <button
                key={i}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${item.active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-12">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-6 px-1 opacity-80">
              Recent Projects
            </div>
            <div className="space-y-1">
              {['Heat Exchanger v2', 'Bridge Load Test', 'Circuit PCB Design'].map((item, i) => (
                <button key={i} className="flex items-center w-full gap-2 px-4 py-2 text-xs text-text-secondary hover:text-white transition-colors text-left">
                  <FileText size={14} className="opacity-40" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-border-light">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">System Online</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed opacity-60">
              Neural Engine v1.0.4-beta<br />
              Math Accuracy: 99.98%
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-chat" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <header className="chat-header">
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Active Project</span>
            </div>
            <h2 className="text-sm font-semibold text-text-primary tracking-wide">Technical Workbench</h2>
          </div>

          <div className="model-switcher">
            <button
              className={`model-btn ${selectedModel === 'flash' ? 'active' : ''}`}
              onClick={() => setSelectedModel('flash')}
            >
              Flash 1.5
            </button>
            <button
              className={`model-btn ${selectedModel === 'pro' ? 'active' : ''}`}
              onClick={() => setSelectedModel('pro')}
            >
              Pro 1.5
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
                <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                  {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                  <span>{msg.role === 'user' ? 'Query Source' : 'Engine Response'}</span>
                </div>

                {msg.fileName && (
                  <div className="mb-3 p-3 bg-black/30 rounded-xl border border-white/10 flex items-center gap-3 text-xs">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message ai">
              <div className="message-bubble bg-transparent border-none">
                <div className="flex items-center gap-3 text-accent-primary">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary"></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Processing technical query...</span>
                </div>
              </div>
            </motion.div>
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
              className="btn-icon-styled"
              onClick={() => fileInputRef.current.click()}
              title="Upload technical documentation"
            >
              <Upload size={18} />
            </button>

            <div className="flex flex-col flex-1">
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="file-preview mb-2 flex justify-between items-center bg-accent-primary/10 p-2 rounded-lg border border-accent-primary/20"
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
                placeholder="Describe your engineering problem..."
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

            <button className="btn-send-gradient" onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6 opacity-30">
            <div className="h-[1px] w-12 bg-white"></div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white">
              Professional Engineering Assistant
            </p>
            <div className="h-[1px] w-12 bg-white"></div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

