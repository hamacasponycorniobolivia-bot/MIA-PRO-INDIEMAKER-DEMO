import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, ArrowUpRight, ArrowDownLeft, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function normalizeTransactions(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function getId(tx, index) {
  return tx.id ?? tx.transaction_id ?? tx.tx_id ?? tx.hash ?? index;
}

function getType(tx) {
  return String(
    tx.type ??
    tx.transaction_type ??
    tx.action ??
    tx.operation ??
    'transaction'
  ).toLowerCase();
}

function getStatus(tx) {
  return String(tx.status ?? tx.state ?? 'completed').toLowerCase();
}

function getAmount(tx) {
  const value =
    tx.amount ??
    tx.value ??
    tx.total ??
    tx.price ??
    tx.quantity;

  if (value === undefined || value === null || value === '') return '—';

  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString('en-US', {
        maximumFractionDigits: 8,
      })
    : String(value);
}

function getAsset(tx) {
  return (
    tx.asset ??
    tx.asset_name ??
    tx.currency ??
    tx.token_symbol ??
    tx.token ??
    '—'
  );
}

function getAddress(tx) {
  return (
    tx.tx_hash ??
    tx.transaction_hash ??
    tx.hash ??
    tx.wallet_address ??
    tx.address ??
    '—'
  );
}

function StatusBadge({ status }) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('cancel')
  ) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: '#fca5a5',
        background: 'rgba(239,68,68,.10)',
        border: '1px solid rgba(239,68,68,.20)',
        borderRadius: 999,
        padding: '5px 9px',
        fontSize: 15,
        fontWeight: 700,
      }}>
        <XCircle size={13} />
        {status}
      </span>
    );
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('process')
  ) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: '#fcd34d',
        background: 'rgba(245,158,11,.10)',
        border: '1px solid rgba(245,158,11,.20)',
        borderRadius: 999,
        padding: '5px 9px',
        fontSize: 15,
        fontWeight: 700,
      }}>
        <Clock3 size={13} />
        {status}
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: '#6ee7b7',
      background: 'rgba(16,185,129,.10)',
      border: '1px solid rgba(16,185,129,.20)',
      borderRadius: 999,
      padding: '5px 9px',
      fontSize: 15,
      fontWeight: 700,
    }}>
      <CheckCircle2 size={13} />
      {status}
    </span>
  );
}

export default function Transactions() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadTransactions = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      const token = localStorage.getItem('mia_token');

      const response = await fetch(`${API}/api/transactions`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setTransactions(normalizeTransactions(data));
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(
        t('No se pudieron cargar las transacciones desde el servidor.')
      );
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => loadTransactions(), 0);
    return () => clearTimeout(timer);
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return transactions;

    return transactions.filter((tx) => {
      const haystack = [
        tx.id,
        tx.transaction_id,
        tx.transaction_hash,
        tx.tx_hash,
        tx.hash,
        tx.type,
        tx.transaction_type,
        tx.status,
        tx.state,
        tx.asset,
        tx.asset_name,
        tx.currency,
        tx.token_symbol,
        tx.wallet_address,
        tx.address,
        tx.amount,
        tx.value,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [transactions, search]);

  return (
    <div style={{
      minHeight: '100%',
      padding: '32px',
      color: 'var(--mia-text, #f8fafc)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
        marginBottom: 28,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            color: '#94a3b8',
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            MIA Infrastructure
          </div>

          <h1 style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-.03em',
          }}>
            {t('Historial de Transacciones')}
          </h1>

          <p style={{
            margin: '8px 0 0',
            color: '#94a3b8',
            fontSize: 15,
          }}>
            {t('Consulta y supervisa las operaciones registradas en MIA Pro.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadTransactions(true)}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(16,185,129,.22)',
            background: 'rgba(16,185,129,.08)',
            color: '#6ee7b7',
            borderRadius: 12,
            padding: '10px 14px',
            fontWeight: 700,
            cursor: refreshing ? 'wait' : 'pointer',
            opacity: refreshing ? .65 : 1,
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? 'miaSpin 1s linear infinite' : 'none',
            }}
          />
          Actualizar
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 22,
      }}>
        <div className="mia-glass" style={{
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 15 }}>
            {t('Total registradas')}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            marginTop: 6,
          }}>
            {transactions.length}
          </div>
        </div>

        <div className="mia-glass" style={{
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 15 }}>
            {t('Mostrando')}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            marginTop: 6,
          }}>
            {filteredTransactions.length}
          </div>
        </div>

        <div className="mia-glass" style={{
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 15 }}>
            {t('Estado')}
          </div>
          <div style={{
            color: error ? '#fca5a5' : '#6ee7b7',
            fontSize: 15,
            fontWeight: 800,
            marginTop: 10,
          }}>
            {error ? t('API no disponible') : t('Conectado')}
          </div>
        </div>
      </div>

      <div className="mia-glass" style={{
        borderRadius: 20,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: 18,
          borderBottom: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
          }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Buscar transacción, hash, asset, estado...')}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px 11px 40px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(2,6,23,.55)',
                color: '#f8fafc',
                outline: 'none',
                fontSize: 15,
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{
            padding: '70px 20px',
            textAlign: 'center',
            color: '#94a3b8',
          }}>
            <RefreshCw
              size={24}
              style={{
                animation: 'miaSpin 1s linear infinite',
                marginBottom: 12,
              }}
            />
            <div>{t('Cargando transacciones...')}</div>
          </div>
        ) : error ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
          }}>
            <XCircle
              size={36}
              style={{
                color: '#f87171',
                marginBottom: 12,
              }}
            />

            <h3 style={{
              margin: '0 0 8px',
              color: '#f8fafc',
            }}>
              {t('No se pudieron cargar las transacciones')}
            </h3>

            <p style={{
              margin: '0 auto 18px',
              maxWidth: 560,
              color: '#94a3b8',
              fontSize: 15,
            }}>
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadTransactions(true)}
              style={{
                border: '1px solid rgba(16,185,129,.25)',
                background: 'rgba(16,185,129,.08)',
                color: '#6ee7b7',
                borderRadius: 10,
                padding: '9px 14px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {t('Reintentar')}
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{
            padding: '70px 20px',
            textAlign: 'center',
          }}>
            <Clock3
              size={36}
              style={{
                color: '#64748b',
                marginBottom: 12,
              }}
            />

            <h3 style={{
              margin: '0 0 8px',
              color: '#f8fafc',
            }}>
              {search
                ? t('No hay resultados')
                : t('Sin transacciones registradas')}
            </h3>

            <p style={{
              margin: 0,
              color: '#94a3b8',
              fontSize: 15,
            }}>
              {search
                ? t('Prueba con otro término de búsqueda.')
                : t('Las transacciones aparecerán aquí cuando existan operaciones registradas.')}
            </p>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 760,
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid rgba(255,255,255,.07)',
                  color: '#64748b',
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>{t('Tipo')}</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>{t('Asset')}</th>
                  <th style={{ textAlign: 'right', padding: '14px 18px' }}>{t('Cantidad')}</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>{t('Estado')}</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>{t('Referencia')}</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>{t('Fecha')}</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((tx, index) => {
                  const type = getType(tx);
                  const status = getStatus(tx);
                  const outgoing =
                    type.includes('send') ||
                    type.includes('sell') ||
                    type.includes('withdraw') ||
                    type.includes('debit') ||
                    type.includes('transfer_out');

                  return (
                    <tr
                      key={getId(tx, index)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,.05)',
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 7,
                          color: outgoing ? '#fda4af' : '#6ee7b7',
                          fontWeight: 800,
                          fontSize: 15,
                        }}>
                          {outgoing
                            ? <ArrowUpRight size={15} />
                            : <ArrowDownLeft size={15} />}
                          {type}
                        </span>
                      </td>

                      <td style={{
                        padding: '16px 18px',
                        fontWeight: 700,
                        color: '#e2e8f0',
                      }}>
                        {getAsset(tx)}
                      </td>

                      <td style={{
                        padding: '16px 18px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        color: '#f8fafc',
                      }}>
                        {getAmount(tx)}
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <StatusBadge status={status} />
                      </td>

                      <td style={{
                        padding: '16px 18px',
                        maxWidth: 220,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        fontSize: 15,
                      }}>
                        {getAddress(tx)}
                      </td>

                      <td style={{
                        padding: '16px 18px',
                        color: '#94a3b8',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                      }}>
                        {formatDate(
                          tx.created_at ??
                          tx.createdAt ??
                          tx.timestamp ??
                          tx.date ??
                          tx.updated_at
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes miaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
