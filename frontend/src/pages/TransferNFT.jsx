import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TransferNFT() {
  const { token } = useAuth();
  const { account, isConnected } = useWallet();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [tokenId, setTokenId] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!token) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{isEs ? 'Acceso denegado' : 'Access denied'}</h2>
        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{isEs ? 'Iniciar sesión' : 'Login'}</Link>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{isEs ? 'Wallet no conectada' : 'Wallet not connected'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{isEs ? 'Debes conectar tu wallet para transferir NFTs.' : 'You must connect your wallet to transfer NFTs.'}</p>
        <Link to="/connect-wallet" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{isEs ? 'Conectar wallet' : 'Connect wallet'}</Link>
      </div>
    );
  }

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!tokenId || !toAddress) {
      return setMsg({ type: 'error', text: isEs ? 'Token ID y dirección destino requeridos' : 'Token ID and destination address required' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      return setMsg({ type: 'error', text: isEs ? 'Dirección Ethereum inválida' : 'Invalid Ethereum address' });
    }

    setLoading(true);

    try {
      await axios.post(`${API}/api/web3/transfer`,
        { tokenId, fromAddress: account, toAddress },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMsg({ type: 'success', text: isEs ? 'NFT transferido con éxito' : 'NFT transferred successfully' });
      setTimeout(() => navigate('/assets'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error al transferir NFT' : 'Error transferring NFT') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/assets" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← {isEs ? 'Volver a Assets' : 'Back to Assets'}
      </Link>

      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '1rem 0 2rem 0' }}>
        {isEs ? 'Transferir NFT' : 'Transfer NFT'}
      </h1>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {isEs ? 'Wallet origen' : 'From wallet'}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {account}
          </div>
        </div>

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'Token ID' : 'Token ID'}
            </label>
            <input
              type="text"
              placeholder="ej: 1234"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'Dirección destino' : 'To address'}
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {isEs ? 'Dirección Ethereum válida (0x...)' : 'Valid Ethereum address (0x...)'}
            </p>
          </div>

          {msg.text && (
            <div style={{ padding: '1rem', borderRadius: '4px', backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: msg.type === 'error' ? 'var(--danger)' : 'var(--accent)', border: `1px solid ${msg.type === 'error' ? 'var(--danger)' : 'var(--accent)'}` }}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '1rem', backgroundColor: loading ? '#525252' : 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem' }}
          >
            {loading ? (isEs ? 'Transfiriendo...' : 'Transferring...') : (isEs ? 'Transferir NFT' : 'Transfer NFT')}
          </button>
        </form>
      </div>
    </div>
  );
}
