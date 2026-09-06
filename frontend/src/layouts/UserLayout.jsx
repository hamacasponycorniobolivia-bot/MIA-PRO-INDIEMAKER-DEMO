import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Box,
  Wallet,
  History,
  Activity,
  User,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const menu = [
  { p: '/dashboard', l: 'Dashboard', i: LayoutDashboard },
  { p: '/marketplace', l: 'Marketplace', i: ShoppingBag },
  { p: '/assets', l: 'Mis Activos', i: Box },
  { p: '/wallet', l: 'Billetera', i: Wallet },
  { p: '/transactions', l: 'Transacciones', i: History },
  { p: '/activity', l: 'Actividad', i: Activity },
  { p: '/profile', l: 'Perfil', i: User },
  { p: '/admin/users', l: 'Usuarios', i: Users, },
  { p: '/security', l: 'Seguridad', i: Shield },
  { p: '/settings', l: 'Configuración', i: Settings },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials =
    user?.email?.charAt(0)?.toUpperCase() || 'M';

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#020617] text-white">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[140px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[140px]" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col
          border-r border-white/[0.08]
          bg-slate-950/85
          shadow-[20px_0_80px_rgba(0,0,0,0.45)]
          backdrop-blur-2xl
          transition-transform duration-500
          lg:relative lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* Logo */}
        <div className="relative px-6 pb-6 pt-7">
          <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div className="
                relative flex h-11 w-11 items-center justify-center
                rounded-2xl
                border border-emerald-400/30
                bg-gradient-to-br from-emerald-400/20 to-cyan-400/10
                shadow-[0_0_35px_rgba(16,185,129,0.18)]
              ">
                <div className="absolute inset-1 rounded-xl border border-white/5" />
                <Zap size={20} className="text-emerald-300" />
              </div>

              <div>
                <div className="
                  bg-gradient-to-r from-emerald-300 via-cyan-300 to-white
                  bg-clip-text text-xl font-black tracking-tight text-transparent
                ">
                  MIA
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                  Pro Platform
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Plataforma
          </div>

          <div className="space-y-1.5">
            {menu
            .filter(item => !item.adminOnly || ['SUPER_ADMIN', 'ADMIN'].includes(user?.role))
            .map((item) => {
              const active = location.pathname === item.p;
              const Icon = item.i;

              return (
                <Link
                  key={item.p}
                  to={item.p}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group relative flex items-center gap-3 overflow-hidden
                    rounded-2xl px-3 py-3
                    transition-all duration-300
                    ${active
                      ? `
                        border border-emerald-400/20
                        bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent
                        text-emerald-300
                        shadow-[0_8px_30px_rgba(16,185,129,0.10)]
                      `
                      : `
                        border border-transparent
                        text-slate-300
                        hover:border-white/[0.06]
                        hover:bg-white/[0.035]
                        hover:text-slate-200
                      `
                    }
                  `}
                >

                  {active && (
                    <div className="
                      absolute left-0 top-1/2 h-7 w-0.5
                      -translate-y-1/2
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_12px_rgba(52,211,153,0.9)]
                    " />
                  )}

                  <div className={`
                    relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                    transition-all duration-300
                    ${active
                      ? 'bg-emerald-400/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.025] group-hover:bg-white/[0.06]'
                    }
                  `}>
                    <Icon size={17} />
                  </div>

                  <span className="flex-1 text-sm font-medium">
                    {item.l}
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      className="text-emerald-400/70"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="
            mb-3 rounded-2xl
            border border-white/[0.07]
            bg-white/[0.025]
            p-3
            shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
          ">
            <div className="flex items-center gap-3">

              <div className="
                relative flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-emerald-400 to-cyan-500
                text-sm font-black text-slate-950
                shadow-[0_0_25px_rgba(16,185,129,0.25)]
              ">
                {initials}
                <span className="
                  absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5
                  rounded-full border-2 border-slate-950
                  bg-emerald-400
                " />
              </div>

              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-slate-200">
                  {user?.email || 'MIA User'}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-emerald-400/70">
                  {user?.role || 'USER'}
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={handleLogout}
            className="
              group flex w-full items-center justify-center gap-2
              rounded-xl border border-red-400/10
              bg-red-500/[0.03]
              px-3 py-2.5
              text-xs font-medium text-red-400/70
              transition-all duration-300
              hover:border-red-400/20
              hover:bg-red-500/[0.08]
              hover:text-red-300
            "
          >
            <LogOut
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Cerrar Sesión
          </button>


      </aside>
      {/* MAIN */}
      <div className="relative flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <header className="
          relative z-30 flex h-[76px] shrink-0 items-center justify-between
          border-b border-white/[0.07]
          bg-slate-950/50
          px-5 sm:px-8
          backdrop-blur-2xl
        ">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setMobileOpen(true)}
              className="
                rounded-xl border border-white/[0.07]
                bg-white/[0.03] p-2.5
                text-slate-400
                transition hover:bg-white/[0.07] hover:text-white
                lg:hidden
              "
            >
              <Menu size={19} />
            </button>

            <div className="hidden sm:block">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                MIA Infrastructure
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-300">
                {menu.find(x => x.p === location.pathname)?.l || 'Dashboard'}
              </div>
            </div>

          </div>

          {/* Online status */}
          <div className="
            flex items-center gap-2.5
            rounded-full
            border border-emerald-400/15
            bg-emerald-400/[0.05]
            px-3.5 py-2
            shadow-[0_0_25px_rgba(16,185,129,0.06)]
          ">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              System Online
            </span>
          </div>


        {/* GLOBAL LANGUAGE SWITCH — CENTER */}
        <div
          className="
            relative z-50 flex items-center gap-2
            rounded-2xl
            border border-white/[0.10]
            bg-slate-950/95
            px-2 py-2
            shadow-[0_10px_40px_rgba(0,0,0,0.40)]
            backdrop-blur-xl
          "
        >
          <button
            type="button"
            onClick={() => changeGlobalLanguage('es')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              activeLanguage === 'en'
                ? 'bg-cyan-400/20 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl leading-none">🇺🇸</span>
            <span>ENGLISH</span>
          </button>
        </div>

      </header>

        {/* CONTENT */}
        <main className="relative flex-1 overflow-y-auto">

          {/* Decorative grid */}
          <div className="
            pointer-events-none fixed inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
            [background-size:60px_60px]
          " />

          <div className="relative mx-auto w-full max-w-[1500px] p-5 sm:p-8 lg:p-10">
            <Outlet />
          </div>

        </main>

      </div>
    </div>
  );
}
