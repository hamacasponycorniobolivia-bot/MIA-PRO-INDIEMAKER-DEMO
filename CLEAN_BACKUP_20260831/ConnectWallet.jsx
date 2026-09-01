import { useWallet } from '../hooks/useWallet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ConnectWallet() {
  const { account, chainId, isConnecting, error, isConnected, connectWallet, disconnectWallet, isMetaMaskInstalled } = useWallet();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEs = i18n.language === 'es';

  const getNetworkName = (id) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
      56: 'BSC',
      97: 'BSC Testnet'
    };
    return networks[id] || `Chain ID: ${id}`;
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isMetaMaskInstalled) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
            {isEs ? 'MetaMask no detectado' : 'MetaMask not detected'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
            {isEs
              ? 'Para interactuar con MIA Marketplace necesitas instalar MetaMask.'
              : 'To interact with MIA Marketplace you need to install MetaMask.'}
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent)', color: '#000', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}
          >
            {isEs ? 'Instalar MetaMask' : 'Install MetaMask'}
          </a>
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isEs ? 'Volver al Dashboard' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 2rem 0' }}>
        {isEs ? 'Conectar Wallet' : 'Connect Wallet'}
      </h1>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
        {!isConnected ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦊</div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              {isEs ? 'Conecta tu wallet MetaMask' : 'Connect your MetaMask wallet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
              {isEs
                ? 'Necesitas conectar tu wallet para comprar, vender y administrar tus activos digitales.'
                : 'You need to connect your wallet to buy, sell, and manage your digital assets.'}
            </p>
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: isConnecting ? '#525252' : 'var(--accent)',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {isConnecting
                ? (isEs ? 'Conectando...' : 'Connecting...')
                : (isEs ? 'Conectar MetaMask' : 'Connect MetaMask')}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: 'var(--accent)', margin: '0 0 0.5rem 0' }}>
                {isEs ? 'Wallet Conectada' : 'Wallet Connected'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isEs ? 'Dirección' : 'Address'}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: '600' }}>
                  {account}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isEs ? 'Red' : 'Network'}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {getNetworkName(chainId)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {isEs ? 'Ir al Dashboard' : 'Go to Dashboard'}
              </button>
              <button
                onClick={disconnectWallet}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {isEs ? 'Desconectar' : 'Disconnect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
