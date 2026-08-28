import { useWallet } from '../hooks/useWallet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function WalletStatus() {
  const { account, chainId, isConnected } = useWallet();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkColor = (id) => {
    const colors = {
      1: '#627eea', // Ethereum Mainnet
      5: '#627eea', // Goerli
      11155111: '#627eea', // Sepolia
      137: '#8247e5', // Polygon
      80001: '#8247e5', // Mumbai
      56: '#f3ba2f', // BSC
      97: '#f3ba2f' // BSC Testnet
    };
    return colors[id] || '#525252';
  };

  if (!isConnected) {
    return (
      <Link
        to="/connect-wallet"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--accent)',
          color: '#000',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        🦊 {isEs ? 'Conectar Wallet' : 'Connect Wallet'}
      </Link>
    );
  }

  return (
    <Link
      to="/connect-wallet"
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getNetworkColor(chainId)
      }}></span>
      {formatAddress(account)}
    </Link>
  );
}
