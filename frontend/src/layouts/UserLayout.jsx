import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WalletStatus from '../components/WalletStatus';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: isEs ? 'Dashboard' : 'Dashboard', icon: '📊' },
    { path: '/marketplace', label: isEs ? 'Marketplace' : 'Marketplace', icon: '🏪' },
    { path: '/assets', label: isEs ? 'Mis Assets' : 'My Assets', icon: '🎨' },
    { path: '/wallet', label: isEs ? 'Wallet' : 'Wallet', icon: '💰' },
    { path: '/transactions', label: isEs ? 'Transacciones' : 'Transactions', icon: '💸' },
    { path: '/activity', label: isEs ? 'Actividad' : 'Activity', icon: '📋' },
    { path: '/profile', label: isEs ? 'Perfil' : 'Profile', icon: '👤' },
    { path: '/security', label: isEs ? 'Seguridad' : 'Security', icon: '🔒' },
    { path: '/settings', label: isEs ? 'Configuración' : 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>MIA</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>v1.1</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-primary)',
                backgroundColor: location.pathname === item.path ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                borderLeft: location.pathname === item.path ? '3px solid var(--accent)' : '3px solid transparent',
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? '600' : '400',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {isEs ? 'Cerrar Sesión' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <WalletStatus />
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
