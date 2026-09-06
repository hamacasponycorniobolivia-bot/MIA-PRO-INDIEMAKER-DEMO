import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Security() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  const [session, setSession] = useState(null);

  const [passwordMessage, setPasswordMessage] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const token = localStorage.getItem('mia_token');

  const loadSecurityState = useCallback(async () => {
    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const [twoFactorRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/api/auth/2fa/status`, authConfig),
        axios.get(`${API}/api/auth/sessions`, authConfig)
      ]);

      setTwoFactorEnabled(Boolean(twoFactorRes.data.enabled));
      setSession(sessionsRes.data.sessions?.[0] || null);
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        logout();
        navigate('/login');
        return;
      }

      setSessionMessage(
        error.response?.data?.error ||
        (isEs ? 'No se pudo consultar el estado de seguridad.' : 'Could not load security status.')
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout, isEs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSecurityState();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadSecurityState]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        isEs ? 'Las nuevas contraseñas no coinciden.' : 'The new passwords do not match.'
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/auth/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword
        },
        authConfig
      );

      setPasswordMessage(
        response.data.message ||
        (isEs ? 'Contraseña actualizada correctamente.' : 'Password updated successfully.')
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage(
        error.response?.data?.error ||
        (isEs ? 'Error al cambiar la contraseña.' : 'Error changing password.')
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleTwoFactorSetup = async () => {
    setTwoFactorMessage('');
    setRecoveryCodes([]);

    setTwoFactorLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/auth/2fa/setup`,
        {},
        authConfig
      );

      setQrCode(response.data.qrCode || '');
      setTwoFactorMessage(
        isEs
          ? 'Escanea el QR con tu aplicación autenticadora y luego introduce el código de 6 dígitos.'
          : 'Scan the QR with your authenticator app and then enter the 6-digit code.'
      );
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.error ||
        (isEs ? 'Error al iniciar la configuración 2FA.' : 'Error starting 2FA setup.')
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorEnable = async () => {
    setTwoFactorMessage('');

    setTwoFactorLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/auth/2fa/enable`,
        { code: twoFactorCode },
        authConfig
      );

      setTwoFactorEnabled(true);
      setQrCode('');
      setTwoFactorCode('');
      setRecoveryCodes(response.data.recoveryCodes || []);

      setTwoFactorMessage(
        response.data.message ||
        (isEs ? 'Autenticación 2FA activada correctamente.' : '2FA enabled successfully.')
      );
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.error ||
        (isEs ? 'Error al activar 2FA.' : 'Error enabling 2FA.')
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorDisable = async () => {
    const password = window.prompt(
      isEs ? 'Introduce tu contraseña actual:' : 'Enter your current password:'
    );

    if (password === null) return;

    const code = window.prompt(
      isEs ? 'Introduce el código 2FA de 6 dígitos:' : 'Enter your 6-digit 2FA code:'
    );

    if (code === null) return;

    setTwoFactorMessage('');
    setTwoFactorLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/auth/2fa/disable`,
        { password, code },
        authConfig
      );

      setTwoFactorEnabled(false);
      setQrCode('');
      setTwoFactorCode('');
      setRecoveryCodes([]);

      setTwoFactorMessage(
        response.data.message ||
        (isEs ? 'Autenticación 2FA desactivada correctamente.' : '2FA disabled successfully.')
      );
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.error ||
        (isEs ? 'Error al desactivar 2FA.' : 'Error disabling 2FA.')
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 0 18px rgba(34, 211, 238, 0.05)'
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.8rem',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '7px',
    fontSize: '0.95rem'
  };

  const buttonStyle = {
    padding: '0.8rem 1rem',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem'
  };

  if (loading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>
          {isEs ? 'Seguridad' : 'Security'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isEs ? 'Verificando estado de seguridad...' : 'Checking security status...'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '2rem',
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}
      >
        {isEs ? 'Seguridad' : 'Security'}
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '1rem'
        }}
      >
        {isEs
          ? 'Administra tu contraseña, autenticación de dos factores y sesión activa.'
          : 'Manage your password, two-factor authentication and active session.'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        <section style={cardStyle}>
          <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>
            🔐 {isEs ? 'Cambiar Contraseña' : 'Change Password'}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isEs
              ? 'Actualiza tu contraseña de acceso.'
              : 'Update your access password.'}
          </p>

          <form
            onSubmit={handleChangePassword}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
          >
            <input
              type="password"
              placeholder={isEs ? 'Contraseña actual' : 'Current password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
              required
            />

            <input
              type="password"
              placeholder={isEs ? 'Nueva contraseña' : 'New password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <input
              type="password"
              placeholder={isEs ? 'Confirmar nueva contraseña' : 'Confirm new password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                ...buttonStyle,
                backgroundColor: 'var(--accent)',
                color: '#fff',
                opacity: passwordLoading ? 0.6 : 1
              }}
            >
              {passwordLoading
                ? (isEs ? 'Actualizando...' : 'Updating...')
                : (isEs ? 'Cambiar Contraseña' : 'Change Password')}
            </button>
          </form>

          {passwordMessage && (
            <p
              style={{
                marginTop: '1rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            >
              {passwordMessage}
            </p>
          )}
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>
              🛡️ {isEs ? 'Autenticación 2FA' : '2FA Authentication'}
            </h2>

            <span
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: twoFactorEnabled ? '#22c55e' : '#f59e0b',
                backgroundColor: twoFactorEnabled
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(245,158,11,0.1)'
              }}
            >
              {twoFactorEnabled
                ? (isEs ? 'ACTIVO' : 'ACTIVE')
                : (isEs ? 'INACTIVO' : 'INACTIVE')}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isEs
              ? 'Protege tu cuenta mediante códigos TOTP.'
              : 'Protect your account using TOTP codes.'}
          </p>

          {!twoFactorEnabled && !qrCode && (
            <button
              onClick={handleTwoFactorSetup}
              disabled={twoFactorLoading}
              style={{
                ...buttonStyle,
                backgroundColor: 'var(--accent)',
                color: '#fff',
                opacity: twoFactorLoading ? 0.6 : 1,
                width: '100%'
              }}
            >
              {twoFactorLoading
                ? (isEs ? 'Generando QR...' : 'Generating QR...')
                : (isEs ? 'Configurar 2FA' : 'Set up 2FA')}
            </button>
          )}

          {qrCode && !twoFactorEnabled && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isEs
                  ? 'Escanea este código QR con Google Authenticator, Authy u otra aplicación TOTP.'
                  : 'Scan this QR code with Google Authenticator, Authy or another TOTP app.'}
              </p>

              <img
                src={qrCode}
                alt="MIA Pro 2FA QR"
                style={{
                  width: '190px',
                  height: '190px',
                  background: '#fff',
                  padding: '10px',
                  borderRadius: '10px'
                }}
              />

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={isEs ? 'Código de 6 dígitos' : '6-digit code'}
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                style={{
                  ...inputStyle,
                  marginTop: '1rem',
                  textAlign: 'center',
                  letterSpacing: '0.3rem'
                }}
              />

              <button
                onClick={handleTwoFactorEnable}
                disabled={twoFactorLoading || twoFactorCode.length !== 6}
                style={{
                  ...buttonStyle,
                  marginTop: '0.8rem',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  opacity:
                    twoFactorLoading || twoFactorCode.length !== 6 ? 0.6 : 1,
                  width: '100%'
                }}
              >
                {twoFactorLoading
                  ? (isEs ? 'Verificando...' : 'Verifying...')
                  : (isEs ? 'Activar 2FA' : 'Enable 2FA')}
              </button>
            </div>
          )}

          {twoFactorEnabled && (
            <button
              onClick={handleTwoFactorDisable}
              disabled={twoFactorLoading}
              style={{
                ...buttonStyle,
                backgroundColor: 'var(--danger)',
                color: '#fff',
                opacity: twoFactorLoading ? 0.6 : 1,
                width: '100%'
              }}
            >
              {twoFactorLoading
                ? (isEs ? 'Procesando...' : 'Processing...')
                : (isEs ? 'Desactivar 2FA' : 'Disable 2FA')}
            </button>
          )}

          {twoFactorMessage && (
            <p
              style={{
                marginTop: '1rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            >
              {twoFactorMessage}
            </p>
          )}

          {recoveryCodes.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(245,158,11,0.4)',
                backgroundColor: 'rgba(245,158,11,0.06)'
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>
                {isEs ? 'Códigos de recuperación' : 'Recovery codes'}
              </strong>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem'
                }}
              >
                {isEs
                  ? 'Guárdalos en un lugar seguro. Se muestran una sola vez.'
                  : 'Store them securely. They are shown only once.'}
              </p>

              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  lineHeight: 1.8
                }}
              >
                {recoveryCodes.join('\n')}
              </pre>
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>
            💻 {isEs ? 'Sesión Activa' : 'Active Session'}
          </h2>

          {session ? (
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Email:</strong>{' '}
                {session.email}
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Rol:</strong>{' '}
                {session.role}
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isEs ? 'Usuario:' : 'User:'}
                </strong>{' '}
                {session.user_id}
              </div>

              <div
                style={{
                  marginTop: '0.8rem',
                  color: '#22c55e',
                  fontWeight: '700'
                }}
              >
                ● {isEs ? 'Sesión autenticada' : 'Authenticated session'}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              {isEs ? 'No se pudo obtener la sesión.' : 'Could not load session.'}
            </p>
          )}

          {sessionMessage && (
            <p style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
              {sessionMessage}
            </p>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>
            🚪 {isEs ? 'Cerrar Sesión' : 'Sign Out'}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isEs
              ? 'Cierra la sesión en este dispositivo eliminando el token local.'
              : 'Sign out on this device by removing the local token.'}
          </p>

          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              backgroundColor: 'var(--danger)',
              color: '#fff',
              width: '100%'
            }}
          >
            {isEs ? 'Cerrar Sesión' : 'Sign Out'}
          </button>
        </section>
      </div>
    </div>
  );
}
