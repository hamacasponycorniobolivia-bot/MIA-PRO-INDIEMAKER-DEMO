import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminMarketplace() {
  const { token } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState('UNAVAILABLE');

  useEffect(() => {
    if (!token) return;
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API}/api/admin/marketplace`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (Array.isArray(data)) { setListings(data); setDataStatus('LIVE'); }
        else { setListings([]); setDataStatus('UNAVAILABLE'); }
      } catch (err) { setListings([]); setDataStatus('UNAVAILABLE'); }
      finally { setLoading(false); }
    };
    fetchListings();
  }, [token]);

  const formatPrice = (priceWei) => priceWei ? `${(Number(priceWei) / 1e6).toFixed(2)} USDC` : '—';

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{isEs ? 'Gestión de Marketplace' : 'Marketplace Management'}</h1>
        <span style={{ fontSize: '0.75rem', color: dataStatus === 'LIVE' ? 'var(--accent)' : '#f59e0b', backgroundColor: dataStatus === 'LIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>{dataStatus}</span>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>{isEs ? 'Cargando...' : 'Loading...'}</div> :
      listings.length === 0 ? <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}><h3>{isEs ? 'Sin listings' : 'No listings'}</h3></div> :
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Token ID</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seller</th>
            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estado</th>
          </tr></thead>
          <tbody>{listings.map((l, idx) => (<tr key={l.id || idx} style={{ borderBottom: idx < listings.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{l.id}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>#{l.token_id || '—'}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{l.seller_address ? `${l.seller_address.slice(0,6)}...${l.seller_address.slice(-4)}` : '—'}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--accent)', textAlign: 'right', fontWeight: '600' }}>{formatPrice(l.price_wei)}</td>
            <td style={{ padding: '1rem', fontSize: '0.875rem', color: l.status === 'ACTIVE' ? 'var(--accent)' : '#f59e0b' }}>{l.status || 'UNKNOWN'}</td>
          </tr>))}</tbody>
        </table>
      </div>}
    </div>
  );
}
