import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Security() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    alert(isEs ? 'Endpoint no implementado en el backend' : 'El endpoint no está implementado en el backend');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const securityFeatures = [
    {
      title: isEs ? 'Contraseña' : 'Contraseña',
      desc: isEs ? 'Cambiar tu contraseña de acceso' : 'Cambiar tu contraseña de acceso',
      status: 'NO DISPONIBLE',
      endpoint: 'POST /api/auth/change-password'
    },
    {
      title: isEs ? 'Autenticación 2FA' : 'Autenticación 2FA',
      desc: isEs ? 'Doble factor de autenticación (TOTP)' : 'Doble factor de autenticación (TOTP)',
      status: 'NO DISPONIBLE',
      endpoint: 'POST /api/auth/2fa/enable'
    },
    {
      title: isEs ? 'Sesiones Activas' : 'Sesiones Activas',
      desc: isEs ? 'Ver y cerrar sesiones abiertas' : 'Ver y cerrar sesiones abiertas',
      status: 'NO DISPONIBLE',
      endpoint: 'GET /api/auth/sessions'
    },
    {
      title: isEs ? 'Cerrar Sesión' : 'Cerrar Sesión',
      desc: isEs ? 'Cerrar sesión en este dispositivo' : 'Cerrar sesión en este dispositivo',
      status: 'ACTIVO',
      endpoint: 'Eliminación del token en el cliente'
    },
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 2rem 0' }}>
        {isEs ? 'Seguridad' : 'Security'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {securityFeatures.map((feature, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
              <span style={{
                fontSize: '0.65rem',
                color: feature.status === 'ACTIVO' ? 'var(--accent)' : '#f59e0b',
                backgroundColor: feature.status === 'ACTIVO' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {feature.status}
              </span>
            </div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {feature.desc}
            </p>
            <div style={{ fontSize: '0.7rem', color: '#525252', fontFamily: 'monospace' }}>
              {feature.endpoint}
            </div>
            {feature.status === 'ACTIVO' && (
              <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>
                {isEs ? 'Cerrar Sesión' : 'Cerrar Sesión'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Change Password Form - UNAVAILABLE */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
          {isEs ? 'Cambiar Contraseña' : 'Change Password'}
        </h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder={isEs ? 'Contraseña actual' : 'Current password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }}
          />
          <input
            type="password"
            placeholder={isEs ? 'Nueva contraseña' : 'New password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }}
          />
          <input
            type="password"
            placeholder={isEs ? 'Confirmar nueva contraseña' : 'Confirm new password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }}
          />
          <button type="submit" disabled style={{ padding: '0.75rem', backgroundColor: '#525252', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: '600' }}>
            {isEs ? 'Función no disponible en esta versión' : 'Función no disponible en esta versión'}
          </button>
        </form>
      </div>
    </div>
  );
}
