import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addInteraction, setLoading, updateInteraction } from '../store/store';
import axios from 'axios';

const BACKEND = 'http://localhost:8000';

export default function FormTab() {
  const dispatch = useDispatch();
  const loading = useSelector(s => s.interactions.loading);
  const list = useSelector(s => s.interactions.list);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    hcp_name: '', specialty: '', date: '', location: '',
    products_discussed: '', notes: '', next_steps: '', rep_name: ''
  });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.hcp_name || !form.rep_name) return alert('HCP Name and Rep Name are required!');
    dispatch(setLoading(true));
    try {
      if (editingId) {
        const res = await axios.put(`${BACKEND}/interactions/${editingId}`, form);
        dispatch(updateInteraction(res.data));
        setEditingId(null);
      } else {
        const res = await axios.post(`${BACKEND}/interactions/log`, form);
        dispatch(addInteraction(res.data));
      }
      setForm({ hcp_name: '', specialty: '', date: '', location: '', products_discussed: '', notes: '', next_steps: '', rep_name: '' });
    } catch {
      alert('Backend not running yet! Fill form and test UI now. Backend comes next.');
    }
    dispatch(setLoading(false));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ hcp_name: item.hcp_name, specialty: item.specialty || '', date: item.date || '', location: item.location || '', products_discussed: item.products_discussed || '', notes: item.notes || '', next_steps: item.next_steps || '', rep_name: item.rep_name || '' });
  };

  const fields = [
    { name: 'hcp_name', label: '👨‍⚕️ HCP Name *', placeholder: 'Dr. Rajesh Sharma' },
    { name: 'rep_name', label: '🧑‍💼 Rep Name *', placeholder: 'Your name' },
    { name: 'specialty', label: '🏥 Specialty', placeholder: 'Cardiologist' },
    { name: 'date', label: '📅 Date', placeholder: '2024-01-15' },
    { name: 'location', label: '📍 Location', placeholder: 'Apollo Hospital, Hyderabad' },
    { name: 'products_discussed', label: '💊 Products Discussed', placeholder: 'Metformin, Insulin' },
    { name: 'next_steps', label: '➡️ Next Steps', placeholder: 'Follow up next week' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#4f46e5', marginBottom: 20 }}>{editingId ? '✏️ Edit Interaction' : '📝 Log New Interaction'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {fields.map(f => (
          <div key={f.name}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#374151' }}>{f.label}</label>
            <input name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#374151' }}>📋 Notes</label>
        <textarea name="notes" value={form.notes} onChange={handle} placeholder="Detailed notes about the interaction..."
          rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={submit} disabled={loading}
          style={{ background: loading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? '⏳ Saving...' : editingId ? '💾 Update' : '✅ Log Interaction'}
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setForm({ hcp_name: '', specialty: '', date: '', location: '', products_discussed: '', notes: '', next_steps: '', rep_name: '' }); }}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            ❌ Cancel
          </button>
        )}
      </div>
      {list.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#374151', marginBottom: 12 }}>📋 Logged Interactions ({list.length})</h3>
          {list.map((item, i) => (
            <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#1f2937', fontSize: 16 }}>👨‍⚕️ {item.hcp_name}</strong>
                  <span style={{ marginLeft: 10, color: '#6b7280', fontSize: 13 }}>{item.specialty}</span>
                </div>
                <button onClick={() => startEdit(item)}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  ✏️ Edit
                </button>
              </div>
              {item.ai_summary && <p style={{ margin: '8px 0 0', color: '#4f46e5', fontSize: 13, background: '#ede9fe', padding: '8px 12px', borderRadius: 6 }}>🤖 AI: {item.ai_summary}</p>}
              {item.notes && <p style={{ margin: '6px 0 0', color: '#374151', fontSize: 13 }}>📋 {item.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}