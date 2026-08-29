import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  RefreshCw,
} from 'lucide-react';

const API =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API}/api/wallet/me`);

      setWallet(response.data.wallet);
      setTxs(response.data.transactions || []);
    } catch (err) {
      console.error('Wallet error:', err);

      setError(
        err.response?.data?.error ||
        'No se pudo cargar la wallet.'
      );

      setWallet(null);
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const copyAddress = async () => {
    if (wallet?.user_address) {
      await navigator.clipboard.writeText(wallet.user_address);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString();
  };

  const formatType = (type) => {
    const types = {
      deposit: 'Depósito',
      withdraw: 'Retiro',
      buy: 'Compra',
      sale: 'Venta',
    };

    return types[type?.toLowerCase()] || type || 'Transacción';
  };

  const isPositive = (type) => {
    const normalized = type?.toLowerCase();

    return (
      normalized === 'deposit' ||
      normalized === 'sale'
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'white' }}>
        <h1>Cargando wallet...</h1>
      </div>
    );
  }

  const balance = wallet?.usdc_balance ?? '0';

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Mi Billetera Web3
        </h1>

        <button
          onClick={loadWallet}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{
            background: 'rgba(30,41,59,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          }}
        >
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Balance USDC
          </p>

          <h2
            style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              margin: '0.5rem 0',
              lineHeight: 1,
            }}
          >
            {balance}
            <span
              style={{
                fontSize: '1.5rem',
                color: '#f59e0b',
              }}
            >
              {' '}USDC
            </span>
          </h2>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              marginTop: '1rem',
            }}
          >
            Saldo registrado por el backend de MIA.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(30,41,59,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          }}
        >
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
            }}
          >
            Tu Dirección Pública
          </h3>

          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '1.2rem',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.3)',
              wordBreak: 'break-all',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            {wallet?.user_address || 'Sin dirección'}

            {wallet?.user_address && (
              <Copy
                size={16}
                onClick={copyAddress}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              />
            )}
          </div>

          <p
            style={{
              color: '#fbbf24',
              fontSize: '0.85rem',
              background: 'rgba(251,191,36,0.1)',
              padding: '0.7rem',
              borderRadius: '8px',
            }}
          >
            Wallet administrada por MIA.
          </p>
        </div>
      </div>


    <div
      style={{
        background: 'rgba(30,41,59,0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Mis Billeteras
          </h3>

          <p
            style={{
              color: '#64748b',
              fontSize: '0.85rem',
              marginTop: '0.4rem',
            }}
          >
            Direcciones compatibles con MIA
          </p>
        </div>

        <button
          type="button"
          style={{
            padding: '0.7rem 1rem',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '10px',
            background: 'rgba(16,185,129,0.12)',
            color: '#6ee7b7',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          + Agregar billetera
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          ['USDC', 'Ethereum', '💵'],
          ['USDC', 'Polygon', '💵'],
          ['USDT', 'Ethereum', '₮'],
          ['USDT', 'Tron', '₮'],
          ['USDT', 'BNB', '₮'],
          ['ETH', 'Ethereum', 'Ξ'],
          ['BTC', 'Bitcoin', '₿'],
        ].map(([asset, network, icon]) => (
          <div
            key={`${asset}-${network}`}
            style={{
              background: 'rgba(2,6,23,0.45)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '1.1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginBottom: '0.8rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16,185,129,0.1)',
                  fontSize: '1.25rem',
                }}
              >
                {icon}
              </div>

              <div>
                <div style={{ fontWeight: '800', color: 'white' }}>
                  {asset}
                </div>

                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  {network}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '9px',
                padding: '0.75rem',
                color: '#64748b',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                marginBottom: '0.8rem',
              }}
            >
              Sin dirección configurada
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                }}
              >
                Agregar dirección
              </button>

              <button
                type="button"
                style={{
                  padding: '0.55rem 0.7rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.15)',
                  background: 'rgba(239,68,68,0.05)',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

<div
        style={{
          background: 'rgba(30,41,59,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            borderBottom:
              '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '1rem',
          }}
        >
          Historial de Transacciones
        </h3>

        {txs.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '2rem',
            }}
          >
            No hay transacciones registradas.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {txs.map((tx) => {
              const positive = isPositive(tx.type);

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.2rem',
                    background: 'rgba(2,6,23,0.4)',
                    borderRadius: '12px',
                    border:
                      '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2rem',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: positive
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: positive
                          ? '#10b981'
                          : '#ef4444',
                      }}
                    >
                      {positive ? (
                        <ArrowDownLeft size={24} />
                      ) : (
                        <ArrowUpRight size={24} />
                      )}
                    </div>

                    <div>
                      <p
                        style={{
                          fontWeight: '700',
                          fontSize: '1.1rem',
                          color: 'white',
                          margin: 0,
                        }}
                      >
                        {formatType(tx.type)}
                      </p>

                      <p
                        style={{
                          color: '#64748b',
                          fontSize: '0.8rem',
                          marginTop: '0.35rem',
                        }}
                      >
                        {formatDate(tx.created_at)}
                      </p>

                      <p
                        style={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          marginTop: '0.2rem',
                        }}
                      >
                        {tx.tx_hash}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontWeight: '800',
                        fontSize: '1.2rem',
                        color: positive
                          ? '#10b981'
                          : '#ef4444',
                      }}
                    >
                      {positive ? '+' : '-'}
                      {tx.amount} USDC
                    </p>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        background:
                          'rgba(16,185,129,0.15)',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}
                    >
                      Registrado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
