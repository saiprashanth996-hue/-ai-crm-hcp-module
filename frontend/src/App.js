import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import FormTab from './components/FormTab';
import ChatTab from './components/ChatTab';

export default function App() {
  const [tab, setTab] = useState('form');
  return (
    <Provider store={store}>
      <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ background: '#4f46e5', padding: '16px 32px', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🏥 AI-First CRM — HCP Interaction Logger</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>Powered by LangGraph + Groq AI</p>
        </div>
        <div style={{ maxWidth: 900, margin: '32px auto', background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
            {['form', 'chat'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '16px', border: 'none', background: tab === t ? '#ede9fe' : 'white', color: tab === t ? '#4f46e5' : '#6b7280', fontWeight: tab === t ? 700 : 500, fontSize: 15, cursor: 'pointer', borderBottom: tab === t ? '3px solid #4f46e5' : '3px solid transparent' }}>
                {t === 'form' ? '📝 Structured Form' : '💬 AI Chat'}
              </button>
            ))}
          </div>
          {tab === 'form' ? <FormTab /> : <ChatTab />}
        </div>
      </div>
    </Provider>
  );
}