import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MintNFT() {
  const { token } = useAuth();
  const { account, isConnected } = useWallet();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [metadataUri, setMetadataUri] = useState('');
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
        <p style={{ color: 'var(--text-secondary)' }}>{isEs ? 'Debes conectar tu wallet para mintear NFTs.' : 'You must connect your wallet to mint NFTs.'}</p>
        <Link to="/connect-wallet" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{isEs ? 'Conectar wallet' : 'Connect wallet'}</Link>
      </div>
    );
  }

  const handleMint = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!metadataUri) {
      return setMsg({ type: 'error', text: isEs ? 'URI de metadatos requerido' : 'Metadata URI required' });
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/web3/mint`,
        { metadataUri, recipientAddress: account },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMsg({ type: 'success', text: isEs ? 'NFT minteado con éxito' : 'NFT minted successfully' });
      setTimeout(() => navigate('/assets'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error al mintear NFT' : 'Error minting NFT') });
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
        {isEs ? 'Mintear Nuevo NFT' : 'Mint New NFT'}
      </h1>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {isEs ? 'Wallet conectada' : 'Connected wallet'}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {account}
          </div>
        </div>

        <form onSubmit={handleMint} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'URI de Metadatos' : 'Metadata URI'}
            </label>
            <input
              type="text"
              placeholder="ipfs://Qm... o https://..."
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {isEs ? 'URL IPFS o HTTPS con los metadatos del NFT (JSON)' : 'IPFS or HTTPS URL with NFT metadata (JSON)'}
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
            {loading ? (isEs ? 'Minteando...' : 'Minting...') : (isEs ? 'Mintear NFT' : 'Mint NFT')}
          </button>
        </form>
      </div>
    </div>
  );
}
