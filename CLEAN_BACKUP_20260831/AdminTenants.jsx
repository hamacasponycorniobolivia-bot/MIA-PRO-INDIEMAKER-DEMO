import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminTenants() {
  const { token } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState('UNAVAILABLE');

  useEffect(() => {
    if (!token) return;
    const fetchTenants = async () => {
      try {
        const res = await fetch(`${API}/api/admin/tenants`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (Array.isArray(data)) { setTenants(data); setDataStatus('LIVE'); }
        else { setTenants([]); setDataStatus('UNAVAILABLE'); }
      } catch (err) { setTenants([]); setDataStatus('UNAVAILABLE'); }
      finally { setLoading(false); }
    };
    fetchTenants();
  }, [token]);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{isEs ? 'Gestión de Tenants' : 'Tenant Management'}</h1>
        <span style={{ fontSize: '0.75rem', color: dataStatus === 'LIVE' ? 'var(--accent)' : '#f59e0b', backgroundColor: dataStatus === 'LIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>{dataStatus}</span>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>{isEs ? 'Cargando...' : 'Loading...'}</div> :
      tenants.length === 0 ? <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}><h3>{isEs ? 'Sin tenants' : 'No tenants'}</h3></div> :
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estado</th>
          </tr></thead>
          <tbody>{tenants.map((t, idx) => (<tr key={t.id || idx} style={{ borderBottom: idx < tenants.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.id}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.name || 'Unnamed'}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--accent)' }}>{t.status || 'UNKNOWN'}</td>
          </tr>))}</tbody>
        </table>
      </div>}
    </div>
  );
}
