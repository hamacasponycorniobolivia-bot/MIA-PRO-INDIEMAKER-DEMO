import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const stats = [
    { label: isEs ? 'Balance Total' : 'Total Balance', value: '—', status: 'UNAVAILABLE', desc: 'GET /api/wallet/:address' },
    { label: isEs ? 'Assets' : 'Assets', value: '—', status: 'UNAVAILABLE', desc: 'GET /api/inventory/:address' },
    { label: isEs ? 'Listings Activos' : 'Active Listings', value: '—', status: 'UNAVAILABLE', desc: 'GET /api/listings?seller=me' },
    { label: isEs ? 'Transacciones' : 'Transactions', value: '—', status: 'UNAVAILABLE', desc: 'GET /api/transactions' },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
        {isEs ? 'Bienvenido de nuevo' : 'Welcome back'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 2rem 0', fontSize: '0.9rem' }}>
        {user?.email}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{stat.label}</span>
              <span style={{ fontSize: '0.65rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                {stat.status}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#525252', fontFamily: 'monospace' }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
