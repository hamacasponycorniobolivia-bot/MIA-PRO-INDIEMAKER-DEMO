export default function Cryptocurrencies() {
  // Regla 125: Solo USDC y ETH son reales en el schema actual. El resto es UNAVAILABLE.
  const cryptos = [
    { name: 'USD Coin', symbol: 'USDC', network: 'Multi-chain', status: 'LIVE', decimals: 6 },
    { name: 'Ethereum', symbol: 'ETH', network: 'Native', status: 'LIVE', decimals: 18 },
    { name: 'Tether', symbol: 'USDT', network: 'Multi-chain', status: 'UNAVAILABLE', decimals: 6 },
    { name: 'Wrapped Bitcoin', symbol: 'WBTC', network: 'Ethereum', status: 'UNAVAILABLE', decimals: 8 },
  ];

  const getStatusColor = (s) => {
    if (s === 'LIVE') return 'var(--accent)';
    return '#525252';
  };

  return (
    <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>SUPPORTED ASSETS</span>
        <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>Cryptocurrencies</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Trade and manage your digital assets with institutional-grade security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {cryptos.map((crypto) => (
          <div key={crypto.symbol} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{crypto.name}</h3>
              <span style={{ fontSize: '0.75rem', color: getStatusColor(crypto.status), fontWeight: '600', padding: '0.25rem 0.5rem', backgroundColor: `${getStatusColor(crypto.status)}20`, borderRadius: '4px' }}>
                {crypto.status}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span>Symbol: <strong style={{color: 'var(--text-primary)'}}>{crypto.symbol}</strong></span>
              <span>Network: {crypto.network}</span>
              <span>Decimals: {crypto.decimals}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
