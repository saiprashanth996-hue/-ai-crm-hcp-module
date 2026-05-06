import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage } from '../store/store';
import axios from 'axios';

const BACKEND = 'http://localhost:8000';

export default function ChatTab() {
  const dispatch = useDispatch();
  const messages = useSelector(s => s.interactions.chatMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    dispatch(addChatMessage({ role: 'user', content: input }));
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/chat`, { message: input });
      dispatch(addChatMessage({ role: 'assistant', content: res.data.response }));
    } catch {
      dispatch(addChatMessage({ role: 'assistant', content: '⚠️ Backend not connected yet. We will set it up next!' }));
    }
    setLoading(false);
  };

  const suggestions = [
    "Log interaction with Dr. Patel about Metformin today in Hyderabad",
    "Show interaction history for Dr. Sharma",
    "What should I do next for Dr. Kumar?",
    "Search HCP profile for Dr. Reddy",
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '75vh', padding: '20px' }}>
      <h2 style={{ color: '#4f46e5', marginBottom: 8 }}>💬 AI Chat — Log via Conversation</h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Talk naturally! The AI will extract and log the interaction automatically.</p>
      {messages.length === 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>💡 Try saying:</p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)}
              style={{ display: 'block', marginBottom: 6, background: '#ede9fe', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#4f46e5', textAlign: 'left' }}>
              "{s}"
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e5e7eb' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5, background: m.role === 'user' ? '#4f46e5' : 'white', color: m.role === 'user' ? 'white' : '#1f2937', border: m.role === 'assistant' ? '1px solid #e5e7eb' : 'none' }}>
              {m.role === 'assistant' && <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>🤖 AI Agent</span>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#6b7280', fontSize: 14 }}>⏳ AI is thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type: 'Met Dr. Sharma today at Apollo, discussed Metformin...'"
          style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
        <button onClick={send} disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          ➤
        </button>
      </div>
    </div>
  );
}