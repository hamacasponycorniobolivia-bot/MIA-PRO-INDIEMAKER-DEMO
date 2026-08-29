import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Activity as ActivityIcon, CheckCircle2, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function normalize(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.activity)) return data.activity;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.logs)) return data.logs;
  return [];
}

function dateOf(item) {
  const value =
    item.created_at ??
    item.createdAt ??
    item.timestamp ??
    item.date ??
    item.updated_at;

  if (!value) return '—';

  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
}

function textOf(item) {
  return (
    item.action ??
    item.event ??
    item.activity ??
    item.description ??
    item.message ??
    item.type ??
    'Actividad'
  );
}

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadActivity = async (manual = false) => {
    manual ? setRefreshing(true) : setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('mia_token');

      const response = await fetch(`${API}/api/activity`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setItems(normalize(data));
    } catch (err) {
      console.error('Error loading activity:', err);
      setError('No se pudo cargar la actividad desde el servidor.');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }, [items, search]);

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
            fontSize: 11,
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
          }}>
            Actividad Reciente
          </h1>

          <p style={{
            margin: '8px 0 0',
            color: '#94a3b8',
            fontSize: 14,
          }}>
            Registro de actividad y eventos del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadActivity(true)}
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
            cursor: 'pointer',
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
          <div style={{ color: '#94a3b8', fontSize: 12 }}>
            Eventos registrados
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            marginTop: 6,
          }}>
            {items.length}
          </div>
        </div>

        <div className="mia-glass" style={{
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>
            Mostrando
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 900,
            marginTop: 6,
          }}>
            {filtered.length}
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
        }}>
          <div style={{ position: 'relative' }}>
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
              placeholder="Buscar actividad, usuario, evento..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px 11px 40px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(2,6,23,.55)',
                color: '#f8fafc',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{
            padding: 70,
            textAlign: 'center',
            color: '#94a3b8',
          }}>
            <RefreshCw
              size={26}
              style={{
                animation: 'miaSpin 1s linear infinite',
              }}
            />
            <div style={{ marginTop: 12 }}>
              Cargando actividad...
            </div>
          </div>
        ) : error ? (
          <div style={{
            padding: 60,
            textAlign: 'center',
          }}>
            <XCircle
              size={36}
              style={{ color: '#f87171' }}
            />

            <h3 style={{ margin: '12px 0 8px' }}>
              No se pudo cargar la actividad
            </h3>

            <p style={{
              color: '#94a3b8',
              fontSize: 14,
            }}>
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadActivity(true)}
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
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: 70,
            textAlign: 'center',
            color: '#94a3b8',
          }}>
            <ActivityIcon
              size={38}
              style={{ marginBottom: 12 }}
            />

            <h3 style={{
              margin: '0 0 8px',
              color: '#f8fafc',
            }}>
              {search
                ? 'No hay resultados'
                : 'Sin actividad registrada'}
            </h3>

            <p style={{ margin: 0 }}>
              {search
                ? 'Prueba con otro término de búsqueda.'
                : 'Los eventos aparecerán aquí cuando el sistema los registre.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 700,
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid rgba(255,255,255,.07)',
                  color: '#64748b',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  <th style={{ textAlign: 'left', padding: 16 }}>
                    Actividad
                  </th>
                  <th style={{ textAlign: 'left', padding: 16 }}>
                    Usuario
                  </th>
                  <th style={{ textAlign: 'left', padding: 16 }}>
                    Estado
                  </th>
                  <th style={{ textAlign: 'left', padding: 16 }}>
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, index) => {
                  const status = String(
                    item.status ??
                    item.state ??
                    'completed'
                  );

                  return (
                    <tr
                      key={item.id ?? item.activity_id ?? index}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,.05)',
                      }}
                    >
                      <td style={{
                        padding: 16,
                        color: '#e2e8f0',
                        fontWeight: 700,
                      }}>
                        {textOf(item)}
                      </td>

                      <td style={{
                        padding: 16,
                        color: '#94a3b8',
                      }}>
                        {item.user_email ??
                          item.email ??
                          item.user ??
                          item.user_id ??
                          '—'}
                      </td>

                      <td style={{ padding: 16 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: status.toLowerCase().includes('fail')
                            ? '#fca5a5'
                            : '#6ee7b7',
                          background: status.toLowerCase().includes('fail')
                            ? 'rgba(239,68,68,.10)'
                            : 'rgba(16,185,129,.10)',
                          borderRadius: 999,
                          padding: '5px 9px',
                          fontSize: 12,
                          fontWeight: 700,
                        }}>
                          {status.toLowerCase().includes('fail')
                            ? <XCircle size={13} />
                            : <CheckCircle2 size={13} />}
                          {status}
                        </span>
                      </td>

                      <td style={{
                        padding: 16,
                        color: '#94a3b8',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}>
                        {dateOf(item)}
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
