import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Wallet() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState({ deposit: false, withdraw: false });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleDeposit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!depositAmount || Number(depositAmount) <= 0) {
      return setMsg({ type: 'error', text: isEs ? 'Monto inválido' : 'Invalid amount' });
    }
    setLoading({ ...loading, deposit: true });
    try {
      await axios.post(`${API}/api/wallet/deposit`, { amount: Number(depositAmount) });
      setMsg({ type: 'success', text: isEs ? 'Depósito procesado' : 'Deposit processed' });
      setDepositAmount('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error en depósito' : 'Deposit error') });
    } finally {
      setLoading({ ...loading, deposit: false });
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      return setMsg({ type: 'error', text: isEs ? 'Monto inválido' : 'Invalid amount' });
    }
    setLoading({ ...loading, withdraw: true });
    try {
      await axios.post(`${API}/api/wallet/withdraw`, { amount: Number(withdrawAmount) });
      setMsg({ type: 'success', text: isEs ? 'Retiro procesado' : 'Withdraw processed' });
      setWithdrawAmount('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error en retiro' : 'Withdraw error') });
    } finally {
      setLoading({ ...loading, withdraw: false });
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 2rem 0' }}>
        {isEs ? 'Mi Wallet' : 'My Wallet'}
      </h1>

      {/* Balance Card - Regla 125: Estado honesto */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{isEs ? 'Balance USDC' : 'USDC Balance'}</span>
          <span style={{ fontSize: '0.65rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>UNAVAILABLE</span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>—</div>
        <div style={{ fontSize: '0.75rem', color: '#525252', marginTop: '0.5rem' }}>GET /api/wallet/:address</div>
      </div>

      {/* Messages */}
      {msg.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: msg.type === 'error' ? 'var(--danger)' : 'var(--accent)', border: `1px solid ${msg.type === 'error' ? 'var(--danger)' : 'var(--accent)'}` }}>
          {msg.text}
        </div>
      )}

      {/* Forms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Deposit Form */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{isEs ? 'Depositar USDC' : 'Deposit USDC'}</h3>
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem' }}
            />
            <button type="submit" disabled={loading.deposit} className="btn-primary" style={{ width: '100%' }}>
              {loading.deposit ? (isEs ? 'Procesando...' : 'Processing...') : (isEs ? 'Depositar' : 'Deposit')}
            </button>
          </form>
        </div>

        {/* Withdraw Form */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{isEs ? 'Retirar USDC' : 'Withdraw USDC'}</h3>
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem' }}
            />
            <button type="submit" disabled={loading.withdraw} className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--danger)' }}>
              {loading.withdraw ? (isEs ? 'Procesando...' : 'Processing...') : (isEs ? 'Retirar' : 'Withdraw')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
