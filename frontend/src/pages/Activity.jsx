import { useTranslation } from 'react-i18next';

export default function Activity() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          {isEs ? 'Actividad Reciente' : 'Recent Activity'}
        </h1>
        <span style={{ fontSize: '0.75rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
          UNAVAILABLE
        </span>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
          {isEs ? 'Sin actividad registrada' : 'No activity recorded'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
          {isEs ? 'El endpoint GET /api/activity está en no disponible en esta versión.' : 'The GET /api/activity endpoint is in the not available in this release.'}
        </p>
        <div style={{ fontSize: '0.75rem', color: '#525252', fontFamily: 'monospace', marginTop: '1rem' }}>
          Table: audit_logs
        </div>
      </div>
    </div>
  );
}
