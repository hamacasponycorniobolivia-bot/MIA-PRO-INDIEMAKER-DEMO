import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>

        {/* Brand & Status */}
        <div>
          <h3 style={{ color: 'var(--accent)', margin: '0 0 1rem 0' }}>MIA</h3>
          <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Web3 Infrastructure.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
            <span>System Operational</span>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Product</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><Link to="/marketplace" style={{ color: 'inherit', textDecoration: 'none' }}>Marketplace</Link></li>
            <li><Link to="/wallet" style={{ color: 'inherit', textDecoration: 'none' }}>Wallet</Link></li>
            <li><Link to="/assets" style={{ color: 'inherit', textDecoration: 'none' }}>Assets</Link></li>
          </ul>
        </div>

        {/* Legal & Security */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Legal & Security</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link></li>
            <li><Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li><Link to="/security" style={{ color: 'inherit', textDecoration: 'none' }}>Security</Link></li>
          </ul>
        </div>

        {/* Contact & Language */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Contact</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li>support@mia.pro</li>
            <li>
              <button onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                {i18n.language === 'es' ? 'English' : 'Español'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', textAlign: 'center' }}>
        © 2026 MIA Pro. All rights reserved.
      </div>
    </footer>
  );
}
