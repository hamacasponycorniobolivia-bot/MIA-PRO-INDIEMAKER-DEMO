import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const fields = [
    { label: isEs ? 'Email' : 'Email', value: user?.email || '—', editable: false },
    { label: isEs ? 'Rol' : 'Role', value: user?.role || 'USER', editable: false },
    { label: isEs ? 'ID de Usuario' : 'User ID', value: user?.id || '—', editable: false },
    { label: isEs ? 'Wallet Address' : 'Wallet Address', value: '—', editable: true, unavailable: false },
    { label: isEs ? 'Tenant ID' : 'Tenant ID', value: '—', editable: true, unavailable: false },
    { label: isEs ? 'Fecha de Registro' : 'Registration Date', value: '—', editable: true, unavailable: false },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          {isEs ? 'Mi Perfil' : 'My Profile'}
        </h1>
        <span style={{ fontSize: '0.75rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
          UNAVAILABLE
        </span>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {fields.map((field, idx) => (
          <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: idx < fields.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>{field.value}</span>
            </div>
            {field.unavailable ? (
              <span style={{ fontSize: '0.65rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                UNAVAILABLE
              </span>
            ) : (
              <span style={{ fontSize: '0.65rem', color: 'var(--accent)', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                LIVE
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
          {isEs ? 'Editar Perfil' : 'Edit Profile'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
          {isEs ? 'La funcionalidad de edición de perfil está en no disponible en esta versión.' : 'Profile editing functionality is in the not available in this release.'}
        </p>
      </div>
    </div>
  );
}
