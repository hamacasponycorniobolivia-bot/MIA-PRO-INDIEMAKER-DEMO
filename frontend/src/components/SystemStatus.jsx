import { useState } from 'react';

export default function SystemStatus() {
  // Regla 125: Estado honesto. Cambiar a 'LIVE' o 'TESTNET' cuando el backend esté conectado.
  const [globalStatus, setGlobalStatus] = useState('UNAVAILABLE');

  const services = [
    { name: 'MIA API', status: globalStatus },
    { name: 'Database', status: globalStatus },
    { name: 'Redis Cache', status: globalStatus },
    { name: 'Web3 Node', status: globalStatus },
  ];

  const getStatusColor = (s) => {
    if (s === 'LIVE') return 'var(--accent)';
    if (s === 'TESTNET') return '#f59e0b';
    return '#525252';
  };

  const getStatusText = (s) => {
    if (s === 'LIVE') return 'Operational';
    if (s === 'TESTNET') return 'Testnet / Demo';
    return 'Unavailable';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', margin: '2rem auto', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>MIA System Status</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
          {globalStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {services.map((service) => (
          <div key={service.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(service.status) }}></span>
            <span>{service.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{getStatusText(service.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
