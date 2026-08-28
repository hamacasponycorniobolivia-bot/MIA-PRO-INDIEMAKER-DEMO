import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export default function AdminSystem() {
  const { token } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('UNAVAILABLE');
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/admin/system`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(d => { if(d) { setData(d); setStatus('LIVE'); } })
      .catch(() => setStatus('UNAVAILABLE'));
  }, [token]);
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{isEs ? 'Estado del Sistema' : 'System Status'}</h1>
        <span style={{ fontSize: '0.75rem', color: status === 'LIVE' ? 'var(--accent)' : '#f59e0b', backgroundColor: status === 'LIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>{status}</span>
      </div>
      {status === 'UNAVAILABLE' ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>{isEs ? 'Endpoint no disponible aún.' : 'Endpoint not available yet.'}</div> :
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
        <pre style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{JSON.stringify(data, null, 2)}</pre>
      </div>}
    </div>
  );
}
