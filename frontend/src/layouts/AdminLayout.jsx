import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, Wallet, Box, ShoppingCart, Activity, FileText, ShieldCheck, Settings, LogOut, Menu, Database, Server, Download, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { i18n } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState(
    () => localStorage.getItem('mia_pro_language') || i18n.resolvedLanguage || 'es'
  );

  const changeGlobalLanguage = (language) => {
    if (!['es', 'en'].includes(language)) return;

    setActiveLanguage(language);
    i18n.changeLanguage(language);

    localStorage.setItem('mia_pro_language', language);
    localStorage.setItem('mia_pro_settings_language', language);

    document.documentElement.lang = language;

    window.dispatchEvent(
      new CustomEvent('mia-language-change', {
        detail: { language }
      })
    );
  };
  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { path: '/dashboard', label: 'Gestión Principal', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/tenants', label: 'Tenants', icon: Building2 },
    { path: '/admin/wallets', label: 'Wallets', icon: Wallet },
    { path: '/admin/assets', label: 'Activos (NFTs)', icon: Box },
    { path: '/admin/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { path: '/admin/transactions', label: 'Transacciones', icon: Activity },
    { path: '/admin/ledger', label: 'Ledger Contable', icon: FileText },
    { path: '/admin/audit', label: 'Auditoría', icon: ShieldCheck },
    { path: '/admin/logs', label: 'Logs del Sistema', icon: Server },
    { path: '/admin/backups', label: 'Backups', icon: Database },
    { path: '/admin/system', label: 'Estado del Sistema', icon: Settings },
    { path: '/admin/exports', label: 'Exportaciones', icon: Download },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  if (String(user?.role || '').toUpperCase() === 'SUPER_ADMIN') {
    menuItems.push({
      path: '/admin/visit-metrics',
      label: '📊 Métricas de Visitas',
      icon: Activity
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><span className="font-bold text-white text-lg">M</span></div>
            <div><h1 className="text-xl font-bold tracking-tight text-white">MIA Pro</h1><p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">Admin Console</p></div>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-400 transition-colors" /><input type="text" placeholder="Buscar recurso..." className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400" /></div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 px-2">Gestión Principal</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-emerald-600/10 to-transparent text-emerald-400 border-l-2 border-emerald-500' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-l-2 border-transparent'}`}>
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-300 group-hover:text-slate-300'}`} /><span>{item.label}</span>
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px]"><div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white">{user?.email?.charAt(0).toUpperCase() || 'A'}</div></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{user?.email}</p><p className="text-xs text-emerald-500 font-medium truncate">Super Administrator</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all duration-200 group"><LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />Cerrar Sesión Segura</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <header className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => changeGlobalLanguage('es')}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                activeLanguage === 'es'
                  ? 'bg-emerald-400/20 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.12)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl leading-none">🇪🇸</span>
              <span>ESPAÑOL</span>
            </button>

            <div className="h-7 w-px bg-white/10" />

            <button
              type="button"
              onClick={() => changeGlobalLanguage('en')}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                activeLanguage === 'en'
                  ? 'bg-cyan-400/20 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl leading-none">🇺🇸</span>
              <span>ENGLISH</span>
            </button>

            <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden sm:block" />
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"><Menu className="w-6 h-6" /></button>
            <div><h2 className="text-xl font-bold text-white tracking-tight">{menuItems.find(item => item.path === location.pathname)?.label || 'Panel de Control'}</h2><p className="text-xs text-slate-300 hidden sm:block">Bienvenido de nuevo, Administrador.</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
            <button
              type="button"
              onClick={() => setIsInfoOpen((open) => !open)}
              aria-label="Información de MIA Pro"
              className="relative p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-full transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            </button>

            {isInfoOpen && (
              <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-cyan-400/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 bg-cyan-400/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-cyan-300">MIA Pro</p>
                      <p className="text-xs text-slate-400 mt-1">Plataforma Fintech · Blockchain · Web3</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInfoOpen(false)}
                      className="text-slate-500 hover:text-white text-lg"
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="max-h-[65vh] overflow-y-auto p-4 space-y-2">
                  {[
                    ['💳', 'Pagos y transacciones', 'Gestión de operaciones financieras y movimientos.'],
                    ['👛', 'Wallets y activos', 'Gestión de wallets, activos digitales y NFTs.'],
                    ['⛓️', 'Blockchain', 'Integración con Ethereum y redes compatibles.'],
                    ['📒', 'Ledger contable', 'Contabilidad de doble partida y trazabilidad.'],
                    ['🛒', 'Marketplace', 'Gestión de listings, órdenes y operaciones de mercado.'],
                    ['🔐', 'Seguridad', 'Autenticación, roles, protección y controles administrativos.'],
                    ['🔔', 'Webhooks y eventos', 'Eventos, entregas, reintentos y procesamiento asíncrono.'],
                    ['📊', 'Métricas', 'Visitas, actividad y métricas administrativas.'],
                    ['🧾', 'Auditoría y logs', 'Trazabilidad de operaciones y eventos del sistema.'],
                    ['💾', 'Backups y exportaciones', 'Herramientas de respaldo y exportación de información.'],
                    ['⚙️', 'Administración', 'Usuarios, tenants, configuración y estado del sistema.'],
                  ].map(([icon, title, description]) => (
                    <div key={title} className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-3">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
            <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs font-medium text-slate-300">Sistema Operativo</span></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar"><div className="max-w-7xl mx-auto fade-in"><Outlet /></div></main>
      </div>
    </div>
  );
}
