import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminOverview() {
  const { token } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [stats, setStats] = useState({
    users: { count: 0, status: 'UNAVAILABLE' },
    tenants: { count: 0, status: 'UNAVAILABLE' },
    wallets: { count: 0, status: 'UNAVAILABLE' },
    assets: { count: 0, status: 'UNAVAILABLE' },
    listings: { count: 0, status: 'UNAVAILABLE' },
    transactions: { count: 0, status: 'UNAVAILABLE' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        // Intentar obtener datos reales de los endpoints existentes
        const endpoints = [
          { key: 'users', url: '/api/admin/users' },
          { key: 'tenants', url: '/api/admin/tenants' },
          { key: 'wallets', url: '/api/admin/wallets' },
          { key: 'assets', url: '/api/admin/assets' },
          { key: 'listings', url: '/api/admin/listings' },
          { key: 'transactions', url: '/api/admin/transactions' },
        ];

        const results = await Promise.allSettled(
          endpoints.map(ep =>
            fetch(`${API}${ep.url}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : Promise.reject())
          )
        );

        const newStats = { ...stats };
        endpoints.forEach((ep, idx) => {
          if (results[idx].status === 'fulfilled' && Array.isArray(results[idx].value)) {
            newStats[ep.key] = {
              count: results[idx].value.length,
              status: 'LIVE'
            };
          } else {
            newStats[ep.key] = { count: 0, status: 'UNAVAILABLE' };
          }
        });

        setStats(newStats);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    { key: 'users', label: isEs ? 'Usuarios' : 'Users', icon: '👥', color: '#3b82f6' },
    { key: 'tenants', label: isEs ? 'Tenants' : 'Tenants', icon: '🏢', color: '#8b5cf6' },
    { key: 'wallets', label: isEs ? 'Wallets' : 'Wallets', icon: '💰', color: '#10b981' },
    { key: 'assets', label: isEs ? 'Assets' : 'Assets', icon: '🎨', color: '#f59e0b' },
    { key: 'listings', label: isEs ? 'Listings' : 'Listings', icon: '🏪', color: '#ef4444' },
    { key: 'transactions', label: isEs ? 'Transacciones' : 'Transactions', icon: '💸', color: '#06b6d4' },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 2rem 0' }}>
        {isEs ? 'Panel de Administración' : 'Admin Dashboard'}
      </h1>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          {isEs ? 'Cargando estadísticas...' : 'Loading statistics...'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {statCards.map((card) => (
            <div key={card.key} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                <span style={{
                  fontSize: '0.65rem',
                  color: stats[card.key].status === 'LIVE' ? 'var(--accent)' : '#f59e0b',
                  backgroundColor: stats[card.key].status === 'LIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {stats[card.key].status}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>
                {stats[card.key].count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Health */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
          {isEs ? 'Estado del Sistema' : 'System Health'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>API</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Database</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Redis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#525252' }}></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Web3 Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
