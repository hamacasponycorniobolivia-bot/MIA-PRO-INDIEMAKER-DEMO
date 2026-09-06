import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Activity,
  Box,
  Wallet,
  ShoppingBag,
  Zap,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [marketplace, setMarketplace] = useState([]);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [stats, setStats] = useState({
    balance: '0.00',
    assets: 0,
    listings: 0,
    transactions: 0,
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    const API =
      import.meta.env.VITE_API_URL ||
      'http://localhost:3000';

    try {
      const [, walletResponse] = await Promise.all([
        axios.get(`${API}/api/listings`),
        axios.get(`${API}/api/wallet/me`).catch(() => null),
      ]);

      const realBalance =
        walletResponse?.data?.wallet?.usdc_balance ?? '0.00';

      setMarketplace([]);

      setStats({
        balance: realBalance,
        assets: 0,
        listings: 0,
        transactions: 0,
      });
    } catch (err) {
      console.error('Marketplace error:', err);

      setMarketplace([]);

      setStats({
        balance: '0.00',
        assets: 0,
        listings: 0,
        transactions: 0,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadDashboard(), 0);
    return () => clearTimeout(timer);
  }, []);

  const username =
    user?.email?.split('@')[0] || 'User';

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
  }).format(currentDateTime);

  const formattedTime = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
  }).format(currentDateTime);

  return (
    <div className="relative min-h-full pb-12">

      {/* =====================================================
          AMBIENT LIGHTING
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="
          absolute -left-32 top-0
          h-[420px] w-[420px]
          rounded-full
          bg-emerald-500/[0.07]
          blur-[130px]
        " />

        <div className="
          absolute right-[-100px] top-[180px]
          h-[480px] w-[480px]
          rounded-full
          bg-cyan-500/[0.06]
          blur-[150px]
        " />

        <div className="
          absolute bottom-[-180px] left-[40%]
          h-[500px] w-[500px]
          rounded-full
          bg-violet-500/[0.045]
          blur-[160px]
        " />
      </div>

      <div className="relative z-10">

        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="mb-10">

          <div className="mb-4 flex flex-wrap items-center gap-3">

            <div className="
              rounded-2xl
              border border-white/[0.07]
              bg-white/[0.025]
              px-4 py-3
              backdrop-blur-xl
            ">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {'📅 '}{t('Fecha')}
              </div>

              <div className="mt-1 text-sm font-semibold text-white">
                {formattedDate}
              </div>
            </div>

            <div className="
              rounded-2xl
              border border-white/[0.07]
              bg-white/[0.025]
              px-4 py-3
              backdrop-blur-xl
            ">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {'🕐 '}{t('Hora local')}
              </div>

              <div className="mt-1 text-sm font-semibold text-emerald-300">
                {formattedTime}
              </div>
            </div>

          </div>

          <div className="
            relative overflow-hidden
            rounded-[28px]
            border border-white/[0.08]
            bg-gradient-to-br
            from-white/[0.055]
            via-white/[0.025]
            to-emerald-500/[0.025]
            p-6 sm:p-8 lg:p-10
            shadow-[0_35px_90px_rgba(0,0,0,0.38)]
            backdrop-blur-2xl
          ">

            {/* top reflection */}
            <div className="
              pointer-events-none absolute inset-x-8 top-0 h-px
              bg-gradient-to-r
              from-transparent
              via-emerald-300/50
              to-transparent
            " />

            {/* decorative orb */}
            <div className="
              pointer-events-none absolute
              -right-24 -top-24
              h-64 w-64
              rounded-full
              border border-emerald-400/[0.06]
              bg-emerald-400/[0.025]
              shadow-[0_0_100px_rgba(16,185,129,0.08)]
            " />

            <div className="
              pointer-events-none absolute
              right-8 top-8
              h-20 w-20
              rounded-full
              bg-cyan-400/[0.035]
              blur-2xl
            " />

            <div className="
              relative flex flex-col
              justify-between gap-8
              lg:flex-row lg:items-center
            ">

              <div>
                <div className="
                  mb-3 flex items-center gap-2
                  text-sm font-black uppercase
                  tracking-[0.25em] text-emerald-400/70
                ">
                  <span className="
                    h-1.5 w-1.5 rounded-full
                    bg-emerald-400
                    shadow-[0_0_10px_rgba(52,211,153,0.9)]
                  " />
                  {t('MIA PRO CONTROL CENTER')}
                </div>

                <h1 className="
                  text-3xl font-black tracking-tight
                  text-white sm:text-4xl lg:text-5xl
                ">
                  {t('Hola,')}{' '}
                  <span className="
                    bg-gradient-to-r
                    from-emerald-300
                    via-cyan-300
                    to-white
                    bg-clip-text text-transparent
                  ">
                    {username}
                  </span>
                </h1>

                <p className="
                  mt-3 max-w-2xl
                  text-sm leading-6 text-slate-400 sm:text-base
                ">
                  {t('Tu infraestructura Web3 está operativa.')}
                  {t('Gestiona activos, wallet, marketplace y')}
                  {t('actividad desde un solo centro de control.')}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                  <div className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-emerald-400/15
                    bg-emerald-400/[0.045]
                    px-3 py-1.5
                    text-sm font-black uppercase
                  drop-shadow-[0_0_7px_rgba(103,232,249,0.35)]
                  ">
                    <ShieldCheck size={13} />
                    {t('Infraestructura protegida')}
                  </div>

                  <div className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-cyan-400/10
                    bg-cyan-400/[0.035]
                    px-3 py-1.5
                    tracking-wider text-white
                  drop-shadow-[0_0_7px_rgba(255,255,255,0.28)]
                  ">
                    <Zap size={13} />
                    {t('Sistema activo')}
                  </div>

                </div>
              </div>

              <Link
                to="/wallet"
                className="
                  group relative inline-flex shrink-0
                  items-center justify-center gap-3
                  overflow-hidden
                  rounded-2xl
                  border border-emerald-300/20
                  bg-gradient-to-br
                  from-emerald-400
                  via-emerald-500
                  to-cyan-500
                  px-6 py-4
                  text-sm font-black text-slate-950
                  shadow-[0_15px_45px_rgba(16,185,129,0.22)]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_25px_60px_rgba(16,185,129,0.32)]
                "
              >
                <span className="
                  absolute inset-x-0 top-0 h-px
                  bg-white/60
                " />

                <Wallet size={18} />

                <span>{t('Gestionar Wallet')}</span>

                <ArrowUpRight
                  size={17}
                  className="
                    transition-transform duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>

            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}
        <section className="mb-10">

          <div className="
            mb-4 flex items-end justify-between
          ">
            <div>
              <div className="
                text-sm font-black uppercase
                tracking-[0.22em] text-slate-600
              ">
                {t('Overview')}
              </div>

              <h2 className="
                mt-1 text-xl font-bold text-white
              ">
                {t('Resumen de cuenta')}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                hidden sm:inline-flex items-center gap-2
                rounded-xl
                border border-emerald-400/20
                bg-emerald-400/[0.06]
                px-4 py-2
                text-sm font-semibold text-emerald-300
                shadow-[0_0_18px_rgba(16,185,129,0.06)]
                transition-all duration-200
                hover:border-emerald-400/40
                hover:bg-emerald-400/[0.12]
                hover:text-emerald-200
                hover:shadow-[0_0_22px_rgba(16,185,129,0.10)]
                disabled:cursor-wait disabled:opacity-60
              "
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? t('Actualizando') : t('Actualizar')}</span>
            </button>
          </div>

          <div className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          ">

            <StatCard
              icon={Wallet}
              label={t("Balance Total")}
              value="—"
              suffix=""
              color="emerald"
            />

            <StatCard
              icon={Box}
              label={t("Mis Activos")}
              value={stats.assets}
              suffix="NFTs"
              color="cyan"
            />

            <StatCard
              icon={ShoppingBag}
              label={t("Listings Activos")}
              value={stats.listings}
              suffix={t("activos")}
              color="violet"
            />

            <StatCard
              icon={Activity}
              label={t("Transacciones")}
              value={stats.transactions}
              suffix={t("total")}
              color="blue"
            />

          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}
        <section className="
          grid grid-cols-1 gap-5
          xl:grid-cols-[1.55fr_0.85fr]
        ">

          {/* ===================================================
              ACTIVITY
          =================================================== */}
          <div className="
            relative overflow-hidden
            rounded-[26px]
            border border-white/[0.075]
            bg-white/[0.025]
            shadow-[0_30px_70px_rgba(0,0,0,0.28)]
            backdrop-blur-xl
          ">

            <div className="
              absolute inset-x-0 top-0 h-px
              bg-gradient-to-r
              from-transparent
              via-white/10
              to-transparent
            " />

            <div className="
              flex items-center justify-between
              border-b border-white/[0.06]
              px-6 py-5
            ">
              <div>
                <div className="
                  flex items-center gap-2
                  text-sm font-bold text-white
                ">
                  <Activity
                    size={16}
                    className="text-emerald-400"
                  />
                  {t('Actividad Reciente')}
                </div>

                <p className="
                  mt-1 text-xs text-slate-600
                ">
                  {t('Últimos movimientos de tu cuenta')}
                </p>
              </div>

              <Link
                to="/activity"
                className="
                  flex items-center gap-1.5
                  rounded-xl
                  border border-white/[0.06]
                  bg-white/[0.025]
                  px-3 py-2
                  text-sm font-black uppercase
                  tracking-wider text-slate-500
                  transition
                  hover:border-emerald-400/15
                  hover:bg-emerald-400/[0.04]
                  hover:text-emerald-300
                "
              >
                {t('Ver todo')}
                <ExternalLink size={12} />
              </Link>
            </div>

            <div className="p-4 sm:p-5">
            <div className="py-8 text-center">
              <div className="text-base font-semibold text-slate-200">
                {t('No hay actividad reciente')}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {t('Las operaciones reales aparecerán aquí cuando existan.')}
              </div>
            </div>

            </div>
          </div>

          {/* ===================================================
              SYSTEM STATUS
          =================================================== */}
          <div className="
            relative overflow-hidden
            rounded-[26px]
            border border-white/[0.075]
            bg-gradient-to-br
            from-white/[0.035]
            to-white/[0.015]
            p-6
            shadow-[0_30px_70px_rgba(0,0,0,0.28)]
            backdrop-blur-xl
          ">

            <div className="
              absolute -right-20 -top-20
              h-52 w-52 rounded-full
              bg-emerald-400/[0.035]
              blur-3xl
            " />

            <div className="
              relative flex items-center justify-between
            ">
              <div>
                <div className="
                  text-sm font-black uppercase
                  tracking-[0.2em] text-slate-600
                ">
                  {t('Infrastructure')}
                </div>

                <h2 className="
                  mt-1 text-lg font-bold text-white
                ">
                  {t('Estado del sistema')}
                </h2>
              </div>

              <div className="
                flex items-center gap-2
                rounded-full
                border border-emerald-400/15
                bg-emerald-400/[0.045]
                px-3 py-1.5
              ">
                <span className="
                  h-1.5 w-1.5 rounded-full
                  bg-emerald-400
                  shadow-[0_0_10px_rgba(52,211,153,0.9)]
                " />
                <span className="
                  text-[9px] font-bold uppercase
                  tracking-wider text-emerald-300
                ">
                  {t('Operational')}
                </span>
              </div>
            </div>

            <div className="
              relative mt-7 space-y-3
            ">

              <SystemRow
                name={t("API Gateway")}
                value={t("Operational")}
              />

              <SystemRow
                name={t("Database")}
                value={t("Operational")}
              />

              <SystemRow
                name={t("Blockchain")}
                value={t("Operational")}
              />

              <SystemRow
                name={t("Marketplace")}
                value={t("Operational")}
              />

            </div>

          </div>

        </section>

      <section className="mt-5">
        <div className="
          relative overflow-hidden
          rounded-[26px]
          border border-white/[0.075]
          bg-white/[0.025]
          p-6
          shadow-[0_30px_70px_rgba(0,0,0,0.28)]
          backdrop-blur-xl
        ">

          <div className="
            flex items-center justify-between
            border-b border-white/[0.06]
            pb-5
          ">
            <div>
              <div className="
                flex items-center gap-2
                text-sm font-bold text-white
              ">
                <ShoppingBag
                  size={16}
                  className="text-emerald-400"
                />
                Marketplace
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {t('Activos publicados actualmente')}
              </p>
            </div>

            <div className="
              rounded-full
              border border-emerald-400/15
              bg-emerald-400/[0.045]
              px-3 py-1.5
              text-[9px] font-bold uppercase
              tracking-wider text-emerald-300
            ">
              {marketplace.length} ACTIVO{marketplace.length === 1 ? '' : 'S'}
            </div>
          </div>

          {marketplace.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag
                size={30}
                className="mx-auto text-slate-600"
              />
              <div className="mt-3 text-sm font-semibold text-slate-400">
                {t('No hay listings disponibles')}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {t('El marketplace no tiene activos publicados.')}
              </div>
            </div>
          ) : (
            <div className="
              relative mt-5 grid grid-cols-1
              gap-4 sm:grid-cols-2 lg:grid-cols-3
            ">
              {marketplace.slice(0, 6).map((listing, index) => (
                <div
                  key={listing.id || listing.token_id || index}
                  className="
                    group relative overflow-hidden
                    rounded-2xl
                    border border-white/[0.075]
                    bg-black/20
                    p-5
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-emerald-400/20
                    hover:shadow-[0_20px_50px_rgba(16,185,129,0.10)]
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl
                      bg-emerald-400/[0.08]
                      text-xs font-black
                      text-emerald-300
                    ">
                      NFT
                    </div>

                    <span className="
                      rounded-full
                      border border-emerald-400/15
                      bg-emerald-400/[0.045]
                      px-2.5 py-1
                      text-[9px] font-bold uppercase
                      tracking-wider text-emerald-300
                    ">
                      {t('Activo')}
                    </span>
                  </div>

                  <div className="
                    mt-5 text-sm font-bold uppercase
                    tracking-[0.18em] text-slate-200
                    drop-shadow-[0_0_6px_rgba(255,255,255,0.18)]
                  ">
                    Token
                  </div>

                  <div className="
                    mt-1 truncate text-lg font-black text-white
                  ">
                    {listing.token_name ||
                     listing.token_id ||
                     listing.name ||
                     `#${listing.token_id}`}
                  </div>

                  <div className="
                    mt-4 border-t border-white/[0.06]
                    pt-4
                  ">
                    <div className="
                      text-[9px] uppercase
                      tracking-wider text-slate-600
                    ">
                      {t('Precio')}
                    </div>

                    <div className="
                      mt-1 text-2xl font-black
                      text-emerald-300
                    ">
                      {listing.price ||
                       listing.price_usdc ||
                       listing.price_wei ||
                       '—'}
                      <span className="
                        ml-1 text-[10px] font-bold
                        uppercase text-slate-500
                      ">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="
                    mt-4 truncate
                    text-[9px] text-slate-600
                  ">
                    {t('Seller:')} {listing.seller_address || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
color,
}) {
  const colors = {
    emerald: {
      icon: 'text-emerald-300',
      iconBg: 'bg-emerald-400/[0.08]',
      glow: 'hover:shadow-[0_30px_70px_rgba(16,185,129,0.12)]',
      line: 'from-emerald-400/50',
    },
    cyan: {
      icon: 'text-cyan-300',
      iconBg: 'bg-cyan-400/[0.08]',
      glow: 'hover:shadow-[0_30px_70px_rgba(6,182,212,0.12)]',
      line: 'from-cyan-400/50',
    },
    violet: {
      icon: 'text-violet-300',
      iconBg: 'bg-violet-400/[0.08]',
      glow: 'hover:shadow-[0_30px_70px_rgba(139,92,246,0.12)]',
      line: 'from-violet-400/50',
    },
    blue: {
      icon: 'text-blue-300',
      iconBg: 'bg-blue-400/[0.08]',
      glow: 'hover:shadow-[0_30px_70px_rgba(59,130,246,0.12)]',
      line: 'from-blue-400/50',
    },
  };

  const c = colors[color];

  return (
    <div className={`
      group relative overflow-hidden
      rounded-[24px]
      border border-white/[0.075]
      bg-white/[0.025]
      p-5
      shadow-[0_20px_50px_rgba(0,0,0,0.24)]
      backdrop-blur-xl
      transition-all duration-400
      hover:-translate-y-1
      ${c.glow}
    `}>

      <div className={`
        absolute left-0 right-0 top-0 h-px
        bg-gradient-to-r ${c.line}
        via-transparent
      `} />

      <div className="
        flex items-start justify-between
      ">
        <div className={`
          flex h-10 w-10
          items-center justify-center
          rounded-xl
          ${c.iconBg}
          ${c.icon}
          transition-transform duration-300
          group-hover:scale-110
          group-hover:-rotate-3
        `}>
          <Icon size={18} />
        </div>
      </div>

      <div className="
        mt-5 text-[11px]
        font-bold uppercase
        tracking-[0.18em]
        text-cyan-300
      ">
        {label}
      </div>

      <div className="
        mt-1 flex items-baseline gap-2
      ">
        <span className="
          text-4xl font-black
          tracking-tight text-white
        ">
          {value}
        </span>

        <span className="
          text-xs font-bold
          uppercase tracking-wider
          text-white
        ">
          {suffix}
        </span>
      </div>

    </div>
  );
}

function SystemRow({ name, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-slate-300">{name}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
        {value}
      </span>
    </div>
  );
}
