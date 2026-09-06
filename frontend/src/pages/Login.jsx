import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { i18n } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDayMode, setIsDayMode] = useState(
    localStorage.getItem('mia_login_theme') === 'day'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('mia_pro_language', lang);
    window.dispatchEvent(new Event('mia-language-change'));
  };

  const toggleTheme = () => {
    setIsDayMode((current) => {
      const next = !current;
      localStorage.setItem('mia_login_theme', next ? 'day' : 'night');
      return next;
    });
  };

  const changeUser = () => {
    setEmail('');
    setPassword('');
    setTwoFactorCode('');
    setRecoveryCode('');
    setRequiresTwoFactor(false);
    setUseRecovery(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(
        email.trim(),
        password,
        requiresTwoFactor && !useRecovery ? twoFactorCode : '',
        requiresTwoFactor && useRecovery ? recoveryCode : ''
      );

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('MIA Pro login error:', err);

      if (err?.response?.data?.two_factor_required) {
        setRequiresTwoFactor(true);
        setError(
          err?.response?.data?.error ||
          'Se requiere autenticación de dos factores.'
        );
      } else {
        setError(
          err?.response?.data?.error ||
          err?.message ||
          'Credenciales inválidas'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isEnglish = i18n.language === 'en';
  const locale = isEnglish ? 'en-US' : 'es-BO';

  const timeText = currentTime.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateText = currentTime.toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const night = !isDayMode;

  const theme = night
    ? {
        page: 'linear-gradient(135deg, #020617 0%, #07111f 48%, #0f172a 100%)',
        card: 'rgba(8, 18, 32, 0.88)',
        cardBorder: 'rgba(103, 232, 249, 0.28)',
        text: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#94a3b8',
        cyan: '#67e8f9',
        cyanStrong: '#22d3ee',
        input: 'rgba(15, 23, 42, 0.82)',
        inputBorder: 'rgba(148, 163, 184, 0.24)',
        button: 'linear-gradient(135deg, #0891b2, #06b6d4)',
        shadow:
          '0 30px 80px rgba(0,0,0,.55), 0 0 50px rgba(34,211,238,.08)',
        glow: '0 0 18px rgba(103,232,249,.22)'
      }
    : {
        page: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 52%, #dbeafe 100%)',
        card: 'rgba(255, 255, 255, 0.94)',
        cardBorder: 'rgba(8, 145, 178, 0.25)',
        text: '#0f172a',
        secondary: '#334155',
        muted: '#64748b',
        cyan: '#0891b2',
        cyanStrong: '#06b6d4',
        input: 'rgba(248, 250, 252, 0.95)',
        inputBorder: 'rgba(100, 116, 139, 0.28)',
        button: 'linear-gradient(135deg, #0891b2, #06b6d4)',
        shadow:
          '0 30px 70px rgba(15,23,42,.16), 0 0 45px rgba(8,145,178,.08)',
        glow: '0 0 18px rgba(8,145,178,.14)'
      };

  const labelStyle = {
    display: 'block',
    marginTop: '18px',
    color: theme.secondary,
    fontSize: '15px',
    fontWeight: 600
  };

  const inputStyle = {
    width: '100%',
    marginTop: '8px',
    padding: '14px 15px',
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: '12px',
    boxSizing: 'border-box',
    background: theme.input,
    color: theme.text,
    fontSize: '15px',
    outline: 'none'
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '28px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.page,
        color: theme.text,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'rgba(34,211,238,.07)',
          filter: 'blur(80px)',
          top: '-180px',
          left: '-150px',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(103,232,249,.05)',
          filter: 'blur(80px)',
          bottom: '-160px',
          right: '-130px',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '470px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '5px',
              borderRadius: '12px',
              border: `1px solid ${theme.cardBorder}`,
              background: theme.card
            }}
          >
            <button
              type="button"
              onClick={() => changeLanguage('es')}
              style={{
                border: 0,
                borderRadius: '8px',
                padding: '7px 10px',
                cursor: 'pointer',
                background: !isEnglish ? theme.cyanStrong : 'transparent',
                color: !isEnglish ? '#001018' : theme.secondary,
                fontWeight: 700
              }}
            >
              🇪🇸 ES
            </button>

            <button
              type="button"
              onClick={() => changeLanguage('en')}
              style={{
                border: 0,
                borderRadius: '8px',
                padding: '7px 10px',
                cursor: 'pointer',
                background: isEnglish ? theme.cyanStrong : 'transparent',
                color: isEnglish ? '#001018' : theme.secondary,
                fontWeight: 700
              }}
            >
              🇬🇧 EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            style={{
              border: `1px solid ${theme.cardBorder}`,
              background: theme.card,
              color: theme.cyan,
              borderRadius: '12px',
              padding: '9px 13px',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: theme.glow
            }}
          >
            {night ? '☀️' : '🌙'}
          </button>
        </div>

        <section
          style={{
            width: '100%',
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '22px',
            padding: '34px',
            boxSizing: 'border-box',
            boxShadow: theme.shadow,
            backdropFilter: 'blur(18px)'
          }}
        >
          <header style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                margin: '0 auto 16px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${theme.cardBorder}`,
                background: night
                  ? 'rgba(34,211,238,.08)'
                  : 'rgba(8,145,178,.08)',
                color: theme.cyan,
                fontSize: '28px',
                fontWeight: 800,
                boxShadow: theme.glow
              }}
            >
              M
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: theme.text,
                textShadow: night
                  ? '0 0 18px rgba(255,255,255,.16)'
                  : 'none'
              }}
            >
              MIA Pro
            </h1>

            <p
              style={{
                margin: '9px 0 0',
                color: theme.cyan,
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '.04em'
              }}
            >
              {requiresTwoFactor
                ? isEnglish
                  ? 'SECURITY VERIFICATION'
                  : 'VERIFICACIÓN DE SEGURIDAD'
                : isEnglish
                  ? 'SECURE PLATFORM ACCESS'
                  : 'ACCESO SEGURO A LA PLATAFORMA'}
            </p>

            <div
              style={{
                marginTop: '20px',
                padding: '12px 15px',
                borderRadius: '14px',
                background: night
                  ? 'rgba(15,23,42,.72)'
                  : 'rgba(241,245,249,.85)',
                border: `1px solid ${theme.cardBorder}`
              }}
            >
              <div
                style={{
                  fontSize: '25px',
                  fontWeight: 700,
                  color: theme.text,
                  letterSpacing: '.04em',
                  textShadow: night
                    ? '0 0 12px rgba(255,255,255,.14)'
                    : 'none'
                }}
              >
                {timeText}
              </div>

              <div
                style={{
                  marginTop: '3px',
                  color: theme.muted,
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {dateText}
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>
              {isEnglish ? 'Email' : 'Correo'}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                disabled={requiresTwoFactor}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {isEnglish ? 'Password' : 'Contraseña'}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={requiresTwoFactor}
                style={inputStyle}
              />
            </label>

            {requiresTwoFactor && !useRecovery && (
              <label style={labelStyle}>
                {isEnglish ? '2FA Code' : 'Código 2FA'}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(event) =>
                    setTwoFactorCode(
                      event.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  autoComplete="one-time-code"
                  placeholder={
                    isEnglish ? '6-digit code' : 'Código de 6 dígitos'
                  }
                  required
                  style={{
                    ...inputStyle,
                    border: `1px solid ${theme.cyanStrong}`,
                    textAlign: 'left',
                    letterSpacing: '0.3rem',
                    fontSize: '22px',
                    boxShadow: theme.glow
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setUseRecovery(true);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  style={{
                    marginTop: '10px',
                    border: 0,
                    background: 'transparent',
                    color: theme.cyan,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {isEnglish
                    ? 'Use recovery code'
                    : 'Usar código de recuperación'}
                </button>
              </label>
            )}

            {requiresTwoFactor && useRecovery && (
              <label style={labelStyle}>
                {isEnglish ? 'Recovery Code' : 'Código de recuperación'}
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(event) =>
                    setRecoveryCode(event.target.value.toUpperCase())
                  }
                  autoComplete="one-time-code"
                  placeholder={
                    isEnglish
                      ? 'Recovery code'
                      : 'Código de recuperación'
                  }
                  required
                  style={{
                    ...inputStyle,
                    border: `1px solid ${theme.cyanStrong}`,
                    letterSpacing: '0.08rem',
                    boxShadow: theme.glow
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setUseRecovery(false);
                    setRecoveryCode('');
                    setError('');
                  }}
                  style={{
                    marginTop: '10px',
                    border: 0,
                    background: 'transparent',
                    color: theme.cyan,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {isEnglish ? 'Use 2FA code' : 'Usar código 2FA'}
                </button>
              </label>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  marginTop: '18px',
                  padding: '13px 14px',
                  background: night
                    ? 'rgba(127,29,29,.24)'
                    : 'rgba(254,226,226,.9)',
                  color: night ? '#fecaca' : '#991b1b',
                  border: `1px solid ${
                    night ? 'rgba(248,113,113,.25)' : '#fecaca'
                  }`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (requiresTwoFactor &&
                  ((!useRecovery && twoFactorCode.length !== 6) ||
                    (useRecovery && !recoveryCode.trim())))
              }
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                border: 0,
                borderRadius: '12px',
                background: theme.button,
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(6,182,212,.22)'
              }}
            >
              {loading
                ? isEnglish
                  ? 'Verifying...'
                  : 'Verificando...'
                : requiresTwoFactor
                  ? isEnglish
                    ? 'Verify and enter'
                    : 'Verificar y entrar'
                  : isEnglish
                    ? 'Sign in'
                    : 'Iniciar sesión'}
            </button>

            {!requiresTwoFactor && (
              <button
                type="button"
                onClick={changeUser}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '11px',
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px',
                  background: 'transparent',
                  color: theme.secondary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {isEnglish ? '↔ Change user' : '↔ Cambiar usuario'}
              </button>
            )}

            {requiresTwoFactor && (
              <button
                type="button"
                onClick={changeUser}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '11px',
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px',
                  background: 'transparent',
                  color: theme.secondary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {isEnglish ? '↔ Change user' : '↔ Cambiar usuario'}
              </button>
            )}
          </form>
        </section>

        <footer
          style={{
            textAlign: 'left',
            marginTop: '20px',
            color: theme.muted,
            fontSize: '12px',
            lineHeight: 1.7
          }}
        >
          <div
            style={{
              color: theme.cyan,
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            Creador
          </div>

          <div
            style={{
              color: theme.text,
              fontSize: '21px',
              fontWeight: 700,
              marginTop: '2px',
              textShadow: night
                ? '0 0 10px rgba(255,255,255,.12)'
                : 'none'
            }}
          >
            LEONARDO ATILIO AQUINO
          </div>

          <div style={{ fontSize: '22px' }}>
            Ingeniero en Sistemas · Full Stack Developer · Blockchain & Web3 🇦🇷
          </div>

          <div style={{ marginTop: '6px', fontSize: '20px' }}>
            LinkedIn:{' '}
            <a
              href="https://www.linkedin.com/in/leonardo-aquino-4a9379233/"
              target="_blank"
              rel="noreferrer"
              style={{ color: theme.cyan }}
            >
              linkedin.com/in/leonardo-aquino
            </a>
          </div>

          <div style={{ fontSize: '22px' }}>
            Email:{' '}
            <a
              href="mailto:leonardoaqui05@gmail.com"
              style={{ color: theme.cyan }}
            >
              leonardoaqui05@gmail.com
            </a>
          </div>

          <div style={{ marginTop: '6px', fontSize: '20px' }}>
            © 2026 MIA Pro · Creado del 1 de julio al 2 de septiembre de 2026 ·
            Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </main>
  );
}
