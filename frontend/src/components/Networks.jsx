export default function Networks() {
  // Regla 125: Estado honesto. Cambiar a 'LIVE' cuando el backend confirme la red.
  const networks = [
    { name: 'Ethereum', chainId: '1', currency: 'ETH', status: 'UNAVAILABLE' },
    { name: 'Polygon', chainId: '137', currency: 'MATIC', status: 'UNAVAILABLE' },
    { name: 'Base', chainId: '8453', currency: 'ETH', status: 'UNAVAILABLE' },
    { name: 'Arbitrum', chainId: '42161', currency: 'ETH', status: 'UNAVAILABLE' },
  ];

  const getStatusColor = (s) => {
    if (s === 'LIVE') return 'var(--accent)';
    if (s === 'TESTNET') return '#f59e0b';
    return '#525252';
  };

  return (
    <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>WEB3 INFRASTRUCTURE</span>
        <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>Supported Networks</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          MIA is designed to be chain-agnostic. We integrate with the most secure and scalable networks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {networks.map((net) => (
          <div key={net.name} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{net.name}</h3>
              <span style={{ fontSize: '0.75rem', color: getStatusColor(net.status), fontWeight: '600', padding: '0.25rem 0.5rem', backgroundColor: `${getStatusColor(net.status)}20`, borderRadius: '4px' }}>
                {net.status}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span>Chain ID: {net.chainId}</span>
              <span>Native Currency: {net.currency}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
