import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Settings() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [theme, setTheme] = useState(localStorage.getItem('mia_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mia_theme', theme);
  }, [theme]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const settingsSections = [
    {
      title: isEs ? 'Idioma' : 'Language',
      desc: isEs ? 'Selecciona el idioma de la interfaz' : 'Select the interface language',
      status: 'LIVE',
      content: (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => handleLanguageChange('es')}
            style={{ padding: '0.5rem 1rem', backgroundColor: i18n.language === 'es' ? 'var(--accent)' : 'var(--bg-primary)', color: i18n.language === 'es' ? '#000' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            Español
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            style={{ padding: '0.5rem 1rem', backgroundColor: i18n.language === 'en' ? 'var(--accent)' : 'var(--bg-primary)', color: i18n.language === 'en' ? '#000' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            English
          </button>
        </div>
      )
    },
    {
      title: isEs ? 'Tema' : 'Theme',
      desc: isEs ? 'Selecciona el tema visual' : 'Select the visual theme',
      status: 'LIVE',
      content: (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => handleThemeChange('dark')}
            style={{ padding: '0.5rem 1rem', backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--bg-primary)', color: theme === 'dark' ? '#000' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            {isEs ? 'Oscuro' : 'Dark'}
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            style={{ padding: '0.5rem 1rem', backgroundColor: theme === 'light' ? 'var(--accent)' : 'var(--bg-primary)', color: theme === 'light' ? '#000' : 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            {isEs ? 'Claro' : 'Light'}
          </button>
        </div>
      )
    },
    {
      title: isEs ? 'Notificaciones' : 'Notifications',
      desc: isEs ? 'Configurar alertas y notificaciones' : 'Configure alerts and notifications',
      status: 'UNAVAILABLE',
      content: (
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isEs ? 'Endpoint no implementado en el backend' : 'Endpoint not implemented in backend'}
        </div>
      )
    },
    {
      title: isEs ? 'Preferencias de Usuario' : 'User Preferences',
      desc: isEs ? 'Configuración avanzada de cuenta' : 'Advanced account settings',
      status: 'UNAVAILABLE',
      content: (
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isEs ? 'Endpoint no implementado en el backend' : 'Endpoint not implemented in backend'}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 2rem 0' }}>
        {isEs ? 'Configuración' : 'Settings'}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {settingsSections.map((section, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{section.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{section.desc}</p>
              </div>
              <span style={{
                fontSize: '0.65rem',
                color: section.status === 'LIVE' ? 'var(--accent)' : '#f59e0b',
                backgroundColor: section.status === 'LIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {section.status}
              </span>
            </div>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}
