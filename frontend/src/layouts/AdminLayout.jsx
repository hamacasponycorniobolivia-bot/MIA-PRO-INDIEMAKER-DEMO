import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/tenants', label: 'Tenants' },
    { path: '/admin/wallets', label: 'Wallets' },
    { path: '/admin/assets', label: 'Assets' },
    { path: '/admin/marketplace', label: 'Marketplace' },
    { path: '/admin/transactions', label: 'Transactions' },
    { path: '/admin/ledger', label: 'Ledger' },
    { path: '/admin/audit', label: 'Audit' },
    { path: '/admin/logs', label: 'Logs' },
    { path: '/admin/system', label: 'System' },
    { path: '/admin/exports', label: 'Exports' },
    { path: '/admin/settings', label: 'Settings' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
      {/* Sidebar Admin (Regla 86) */}
      <aside className="admin-sidebar" style={{ width: '260px', backgroundColor: '#121212', borderRight: '1px solid #262626', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px' }}>MIA ADMIN</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#fff' : '#a3a3a3',
                backgroundColor: location.pathname === item.path ? '#ef4444' : 'transparent',
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #262626', fontSize: '0.75rem', color: '#525252' }}>
          Role: {user?.role}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Admin */}
        <header className="admin-header" style={{ height: '60px', borderBottom: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: '#121212' }}>
          <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
            {new Date().toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-US')}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid #262626', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>
            <span style={{ fontSize: '0.875rem', color: '#fff' }}>{user?.email}</span>
            <button onClick={logout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
