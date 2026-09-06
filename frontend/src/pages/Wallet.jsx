import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  RefreshCw,
  X,
  Wallet as WalletIcon,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CircleDollarSign,
  Activity,
  Settings,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ASSETS = [
  { asset: 'USDC', network: 'Sepolia', symbol: 'USDC', name: 'MIA USD Coin' },
  { asset: 'USDT', network: 'Ethereum', symbol: 'USDT', name: 'Tether USD' },
  { asset: 'USDT', network: 'Tron', symbol: 'USDT', name: 'Tether USD' },
  { asset: 'USDT', network: 'BNB', symbol: 'USDT', name: 'Tether USD' },
  { asset: 'ETH', network: 'Sepolia', symbol: 'ETH', name: 'Ethereum' },
  { asset: 'BTC', network: 'Bitcoin', symbol: 'BTC', name: 'Bitcoin' },
];

const card = {
  background: 'rgba(15,23,42,.72)',
  border: '1px solid rgba(148,163,184,.14)',
  borderRadius: 20,
  boxShadow: '0 18px 45px rgba(0,0,0,.18)',
};

const buttonBase = {
  border: 0,
  borderRadius: 12,
  padding: '11px 16px',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export default function Wallet() {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState('Sepolia');
  const [addressForm, setAddressForm] = useState({ asset: 'USDC', network: 'Sepolia', address: '' });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');
  const [addressError, setAddressError] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [walletRes, addressRes] = await Promise.all([
        axios.get(`${API}/api/wallet/me`),
        axios.get(`${API}/api/wallet/addresses`),
      ]);
      setWallet(walletRes.data.wallet || null);
      setTxs([]);
      setWalletAddresses(addressRes.data.addresses || []);
    } catch (err) {
      console.error('Wallet load error:', err);
      setError(err.response?.data?.error || 'No se pudo cargar la Wallet MIA Pro.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWallet();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadWallet]);

  const balance = '0.00';

  const selectedAddress = useMemo(
    () => walletAddresses.find(
      (item) => item.asset === selectedAsset && item.network === selectedNetwork
    )?.address || wallet?.user_address || '',
    [walletAddresses, selectedAsset, selectedNetwork, wallet]
  );

  const copyAddress = async (address) => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setError(t('No se pudo copiar la dirección.'));
    }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressError('');
    setAddressMessage('');

    if (!addressForm.address.trim()) {
      setAddressError(t('Ingresá una dirección.'));
      return;
    }

    try {
      setSavingAddress(true);
      await axios.post(`${API}/api/wallet/addresses`, {
        asset: addressForm.asset,
        network: addressForm.network,
        address: addressForm.address.trim(),
      });
      setAddressForm({ ...addressForm, address: '' });
      setAddressMessage(t('Dirección guardada correctamente.'));
      await loadWallet();
    } catch (err) {
      setAddressError(err.response?.data?.error || t('No se pudo guardar la dirección.'));
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    try {
      await axios.delete(`${API}/api/wallet/addresses/${id}`);
      await loadWallet();
    } catch (err) {
      setAddressError(err.response?.data?.error || t('No se pudo eliminar la dirección.'));
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : '—';

  const formatType = (type) => ({
    deposit: t('Depósito'),
    withdraw: t('Retiro'),
    buy: t('Compra'),
    sale: t('Venta'),
  }[type?.toLowerCase()] || t('Transacción'));

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={30} style={{ animation: 'spin 1s linear infinite' }} />
          <p>{t('Cargando MIA Pro Wallet…')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '28px clamp(16px, 4vw, 48px) 60px',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      maxWidth: 1250,
      margin: '0 auto',
    }}>
      <style>{`
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        .mia-wallet-grid { display:grid; grid-template-columns:1.35fr .65fr; gap:18px; }
        .mia-actions { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .mia-address-row { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .mia-table-row { display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center; }
        .mia-modal { width:min(520px, calc(100vw - 32px)); max-height:90vh; overflow:auto; }
        @media(max-width:800px) {
          .mia-wallet-grid { grid-template-columns:1fr; }
          .mia-address-row { align-items:flex-start; flex-direction:column; }
        }
        @media(max-width:520px) {
          .mia-actions { grid-template-columns:1fr; }
          .mia-table-row { grid-template-columns:1fr; }
        }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 15, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            <WalletIcon size={17} />
            MIA Pro
          </div>
          <h1 style={{ margin: '6px 0 4px', fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-.03em' }}>
            {t('Mi Billetera')}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>{t('Gestioná tus activos digitales desde un solo lugar.')}</p>
        </div>
        <button onClick={loadWallet} disabled={loading} style={{ ...buttonBase, background: 'rgba(148,163,184,.10)', border: '1px solid rgba(148,163,184,.16)' }}>
          <RefreshCw size={17} /> {t('Actualizar')}
        </button>
      </header>

      {error && (
        <div style={{ ...card, padding: 16, marginBottom: 18, borderColor: 'rgba(239,68,68,.35)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <section className="mia-wallet-grid">
        <div style={{ ...card, padding: 'clamp(22px, 4vw, 34px)' }}>
          <div style={{ color: '#94a3b8', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {t('Balance disponible')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '12px 0 25px' }}>
            <strong style={{ fontSize: 'clamp(42px, 7vw, 64px)', letterSpacing: '-.05em' }}>
              {balance}
            </strong>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 20 }}>USDC</span>
          </div>

          <div className="mia-actions">
            <button onClick={() => setShowReceive(true)} style={{ ...buttonBase, background: '#059669' }}>
              <ArrowDownLeft size={19} /> {t('Recibir')}
            </button>
            <button onClick={() => setShowSend(true)} style={{ ...buttonBase, background: '#2563eb' }}>
              <ArrowUpRight size={19} /> {t('Enviar')}
            </button>
          </div>
        </div>

        <div style={{ ...card, padding: 'clamp(22px, 4vw, 30px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 15, fontWeight: 700 }}>{t('ESTADO')}</div>
              <h3 style={{ margin: '5px 0 0', fontSize: 20 }}>Wallet MIA Pro</h3>
            </div>
            <ShieldCheck size={27} color="#34d399" />
          </div>

          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.16)' }}>
            <div style={{ color: '#6ee7b7', fontWeight: 700 }}>{t('Operativa')}</div>
            <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>{t('Balance interno disponible')}</div>
          </div>

          <button onClick={() => setShowAddresses(true)} style={{ ...buttonBase, width: '100%', marginTop: 14, background: 'rgba(148,163,184,.10)', border: '1px solid rgba(148,163,184,.16)' }}>
            <Settings size={17} /> {t('Gestionar direcciones')}
          </button>
        </div>
      </section>

      <section style={{ ...card, marginTop: 18, padding: '24px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{t('Dirección principal')}</h2>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 15 }}>{t('Dirección pública asociada a tu wallet.')}</p>
          </div>
          <CircleDollarSign size={25} color="#f59e0b" />
        </div>

        <div style={{ background: '#020617', border: '1px solid rgba(148,163,184,.12)', borderRadius: 13, padding: 15, fontFamily: 'ui-monospace, monospace', fontSize: 15, wordBreak: 'break-all', color: '#cbd5e1' }}>
          {wallet?.user_address || t('Sin dirección asignada')}
        </div>

        {wallet?.user_address && (
          <button onClick={() => copyAddress(wallet.user_address)} style={{ ...buttonBase, marginTop: 12, background: 'rgba(148,163,184,.08)', border: '1px solid rgba(148,163,184,.14)' }}>
            {copied === wallet.user_address ? <Check size={17} /> : <Copy size={17} />}
            {copied === wallet.user_address ? t('Copiada') : t('Copiar dirección')}
          </button>
        )}
      </section>

      <section style={{ ...card, marginTop: 18, overflow: 'hidden' }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(148,163,184,.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{t('Actividad')}</h2>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 15 }}>{t('Últimas operaciones registradas.')}</p>
          </div>
          <Activity size={22} color="#94a3b8" />
        </div>

        {txs.length === 0 ? (
          <div style={{ padding: 45, textAlign: 'center', color: '#64748b' }}>
            {t('No hay transacciones registradas todavía.')}
          </div>
        ) : (
          <div>
            {txs.map((tx, index) => {
              const positive = ['deposit', 'sale'].includes(tx.type?.toLowerCase());
              return (
                <div key={tx.id || index} className="mia-table-row" style={{ padding: '17px 26px', borderBottom: '1px solid rgba(148,163,184,.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: positive ? 'rgba(16,185,129,.10)' : 'rgba(239,68,68,.10)', color: positive ? '#34d399' : '#f87171' }}>
                      {positive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <strong>{formatType(tx.type)}</strong>
                      <div style={{ color: '#64748b', fontSize: 15, marginTop: 3 }}>{formatDate(tx.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: positive ? '#34d399' : '#f87171' }}>
                      {positive ? '+' : '-'}{tx.amount} USDC
                    </strong>
                    {tx.tx_hash && !String(tx.tx_hash).startsWith('sim_') && (
                      <a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#60a5fa', fontSize: 15, marginTop: 4 }}>
                        {t('Ver transacción')} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showReceive && (
        <Modal title={t('Recibir activos')} icon={<ArrowDownLeft size={21} />} onClose={() => setShowReceive(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label={t('Activo')}>
              <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} style={inputStyle}>
                {ASSETS.map((item) => <option key={`${item.asset}-${item.network}`} value={item.asset}>{item.asset}</option>)}
              </select>
            </Field>
            <Field label={t('Red')}>
              <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} style={inputStyle}>
                {[...new Set(ASSETS.filter((x) => x.asset === selectedAsset).map((x) => x.network))].map((network) => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ background: '#020617', borderRadius: 15, padding: 18, border: '1px solid rgba(16,185,129,.18)' }}>
            <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{t('DIRECCIÓN DE RECEPCIÓN')}</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, lineHeight: 1.6, wordBreak: 'break-all', color: '#6ee7b7' }}>
              {selectedAddress || t('No hay una dirección configurada para esta red.')}
            </div>
          </div>

          {selectedAddress && (
            <button onClick={() => copyAddress(selectedAddress)} style={{ ...buttonBase, width: '100%', marginTop: 13, background: '#059669' }}>
              {copied === selectedAddress ? <Check size={17} /> : <Copy size={17} />}
              {copied === selectedAddress ? t('Dirección copiada') : t('Copiar dirección')}
            </button>
          )}

          <p style={{ color: '#fbbf24', fontSize: 15, lineHeight: 1.5, marginBottom: 0 }}>
            {t('Verificá siempre el activo y la red antes de enviar fondos a esta dirección.')}
          </p>
        </Modal>
      )}

      {showSend && (
        <Modal title={t('Enviar USDC')} icon={<ArrowUpRight size={21} />} onClose={() => setShowSend(false)}>
          <div style={{ padding: 15, borderRadius: 13, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.18)', color: '#fbbf24', fontSize: 15, lineHeight: 1.5, marginBottom: 18 }}>
            {t('El envío on-chain de USDC requiere sincronizar primero la operación MetaMask con el ledger de MIA Pro.')}
          </div>

          <Field label={t('Dirección destino')}>
            <input value={sendAddress} onChange={(e) => setSendAddress(e.target.value)} placeholder="0x..." style={inputStyle} />
          </Field>

          <Field label={t('Monto USDC')}>
            <input value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} inputMode="decimal" placeholder="0.00" style={inputStyle} />
          </Field>

          <button type="button" disabled style={{ ...buttonBase, width: '100%', background: '#334155', cursor: 'not-allowed', marginTop: 6 }}>
            {t('Integración on-chain en validación')}
          </button>
        </Modal>
      )}

      {showAddresses && (
        <Modal title={t('Mis direcciones')} icon={<Settings size={21} />} onClose={() => setShowAddresses(false)}>
          <form onSubmit={saveAddress} style={{ paddingBottom: 20, borderBottom: '1px solid rgba(148,163,184,.10)', marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={t('Activo')}>
                <select value={addressForm.asset} onChange={(e) => setAddressForm({ ...addressForm, asset: e.target.value })} style={inputStyle}>
                  {[...new Set(ASSETS.map((x) => x.asset))].map((asset) => <option key={asset}>{asset}</option>)}
                </select>
              </Field>
              <Field label={t('Red')}>
                <select value={addressForm.network} onChange={(e) => setAddressForm({ ...addressForm, network: e.target.value })} style={inputStyle}>
                  {ASSETS.filter((x) => x.asset === addressForm.asset).map((x) => <option key={x.network}>{x.network}</option>)}
                </select>
              </Field>
            </div>

            <Field label={t('Dirección')}>
              <input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder={t('Dirección pública')} style={inputStyle} />
            </Field>

            {addressError && <div style={{ color: '#fca5a5', fontSize: 15, marginBottom: 10 }}>{addressError}</div>}
            {addressMessage && <div style={{ color: '#6ee7b7', fontSize: 15, marginBottom: 10 }}>{addressMessage}</div>}

            <button disabled={savingAddress} style={{ ...buttonBase, width: '100%', background: '#475569' }}>
              <Plus size={17} /> {savingAddress ? t('Guardando…') : t('Guardar dirección')}
            </button>
          </form>

          {walletAddresses.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>{t('No hay direcciones configuradas.')}</div>
          ) : walletAddresses.map((item) => (
            <div key={item.id} style={{ padding: 14, borderRadius: 13, background: 'rgba(2,6,23,.55)', border: '1px solid rgba(148,163,184,.10)', marginBottom: 10 }}>
              <div className="mia-address-row">
                <div style={{ minWidth: 0 }}>
                  <strong
  style={{
    display: 'inline-block',
    fontSize: 18,
    lineHeight: 1.3,
    fontWeight: 800,
    color: '#67e8f9',
    textShadow: '0 0 8px rgba(103,232,249,.28), 0 0 18px rgba(103,232,249,.12)',
    letterSpacing: '.01em',
  }}
>
  {item.asset} · {item.network}
</strong>
                  <div style={{
  color: '#f8fafc',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 15,
  lineHeight: 1.5,
  fontWeight: 600,
  marginTop: 6,
  wordBreak: 'break-all',
  textShadow: '0 0 7px rgba(248,250,252,.30), 0 0 16px rgba(248,250,252,.12)',
}}>{item.address}</div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <button onClick={() => copyAddress(item.address)} type="button" aria-label={t('Copiar')} style={iconButton}>{copied === item.address ? <Check size={16} /> : <Copy size={16} />}</button>
                  <button onClick={() => deleteAddress(item.id)} type="button" aria-label={t('Eliminar')} style={{ ...iconButton, color: '#f87171' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, icon, onClose, children }) {
  return (
    <div onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2,6,23,.78)',
      backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: 16,
    }}>
      <div className="mia-modal" style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,.18)', borderRadius: 22, padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,.45)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'rgba(59,130,246,.12)', color: '#60a5fa' }}>{icon}</div>
            <h2 style={{ margin: 0, fontSize: 21 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={iconButton}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', color: '#94a3b8', fontSize: 15, fontWeight: 700, marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 13px',
  borderRadius: 11,
  border: '1px solid rgba(148,163,184,.16)',
  background: '#020617',
  color: '#f8fafc',
  outline: 'none',
};

const iconButton = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid rgba(148,163,184,.13)',
  background: 'rgba(148,163,184,.07)',
  color: '#cbd5e1',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};
