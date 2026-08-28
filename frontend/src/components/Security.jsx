export default function Security() {
  // Regla 125: Solo características confirmadas en el inventario del backend.
  const features = [
    { title: 'JWT Authentication', desc: 'Secure session management with encrypted tokens.' },
    { title: 'Multi-Tenant Isolation', desc: 'Strict data separation between organizations.' },
    { title: 'Audit Logging', desc: 'Immutable records of all critical platform actions.' },
    { title: 'Rate Limiting', desc: 'Protection against brute-force and DDoS attacks.' },
    { title: 'Redis Caching', desc: 'High-performance data retrieval with fallback mechanisms.' },
    { title: 'RBAC', desc: 'Role-Based Access Control for fine-grained permissions.' },
  ];

  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>ENTERPRISE GRADE</span>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>Security & Infrastructure</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Built with a security-first approach. Your assets and data are protected by industry-standard protocols.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((feature) => (
            <div key={feature.title} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
