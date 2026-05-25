import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import getApiBase from '../utils/apiBase';

export default function AIAssistant() {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm BiteTrack AI. I can analyze your food logs, tell you your daily calorie needs, or give you a weekly summary. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, showSessions]);

  const fetchSessions = async () => {
    if (!isSignedIn) return;
    try {
      const currentToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/api/ai/sessions`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, isSignedIn]);

  const loadSession = async (id) => {
    try {
      setIsLoading(true);
      const currentToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/api/ai/sessions/${id}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSessionId(data._id);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{ role: 'assistant', text: "Hi! I'm BiteTrack AI. How can I help?" }]);
        }
        setShowSessions(false);
      }
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      const currentToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/api/ai/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s._id !== id));
        if (currentSessionId === id) {
          createNewSession();
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([{ role: 'assistant', text: "Hi! I'm BiteTrack AI. How can I help?" }]);
    setShowSessions(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isSignedIn) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const currentToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const payload = { message: userMsg };
      if (currentSessionId) {
        payload.sessionId = currentSessionId;
      }

      const response = await fetch(`${getApiBase()}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions(); // Refresh list so the new chat shows up
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message || 'Unknown error'}. Please check the console.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform ${isOpen ? 'hidden' : ''}`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute bottom-0 right-0 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 flex justify-between items-center text-white relative z-10 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="font-bold">BiteTrack AI</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowSessions(!showSessions)} className="p-1 rounded hover:bg-white/20 transition-colors" title="Recent Chats">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button onClick={createNewSession} className="p-1 rounded hover:bg-white/20 transition-colors" title="New Chat">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Sessions Sidebar/Overlay */}
              {showSessions ? (
                <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-white sticky top-0 font-semibold text-gray-700 shadow-sm">
                    Recent Chats
                  </div>
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No recent chats found.</div>
                  ) : (
                    <div className="flex flex-col">
                      {sessions.map(session => (
                        <div 
                          key={session._id} 
                          onClick={() => loadSession(session._id)}
                          className={`flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${currentSessionId === session._id ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex-1 truncate pr-2">
                            <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(session.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={(e) => deleteSession(e, session._id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Chat Area */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none shadow-sm text-sm italic">
                          Thinking...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your logs..."
                        className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
