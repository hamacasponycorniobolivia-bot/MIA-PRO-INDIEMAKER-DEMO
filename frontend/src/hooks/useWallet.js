import { useState, useEffect } from 'react';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask no está instalado. Por favor instálalo desde https://metamask.io');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainIdHex, 16);

      setAccount(accounts[0]);
      setChainId(chainIdNum);
    } catch (err) {
      setError(err.message || 'Error al conectar wallet');
      console.error('Error conectando wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const sendTransaction = async ({ to, value = '0x0', data = '0x' }) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask no está instalado.');
    }

    if (!account) {
      throw new Error('Conectá una wallet antes de enviar.');
    }

    if (!to) {
      throw new Error('Falta la dirección de destino.');
    }

    try {
      setError(null);

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to,
            value,
            data,
          },
        ],
      });

      return txHash;
    } catch (err) {
      const message =
        err?.code === 4001
          ? 'La transacción fue rechazada en la wallet.'
          : err?.message || 'No se pudo enviar la transacción.';

      setError(message);
      throw new Error(message);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            setAccount(accounts[0]);
            setChainId(parseInt(chainIdHex, 16));
          }
        } catch (err) {
          console.error('Error verificando conexión:', err);
        }
      }
    };
    checkConnection();
  }, []);

  return {
    account,
    chainId,
    isConnecting,
    error,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };
}
