import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

export default function Marketplace() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        setError('');

        await axios.get(`${API}/api/listings`);

        setListings([]);
      } catch (err) {
        console.error('Marketplace error:', err);
        setError(
          err.response?.data?.error ||
          t('No se pudieron cargar los activos del marketplace.')
        );
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [t]);

  return (
    <div
      style={{
        minHeight: '100%',
        padding: '2rem',
        color: 'white',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 0 0 12%',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            MIA PRO
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: '900',
            }}
          >
            {t('Marketplace')}
          </h1>

          <p
            style={{
              marginTop: '0.5rem',
              color: '#94a3b8',
            }}
          >
            {t('Activos publicados actualmente')}
          </p>
        </div>

        {loading && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            Cargando activos...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: '1.25rem',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '16px',
              background: 'rgba(239,68,68,0.06)',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              NFT
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
              }}
            >
              {t('No hay activos publicados')}
            </h2>

            <p
              style={{
                color: '#64748b',
                marginTop: '0.5rem',
              }}
            >
              {t('Los próximos activos aparecerán aquí')}
            </p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {listings.map((listing) => {
              const tokenId =
                listing.token_id ||
                listing.tokenId ||
                listing.id ||
                null;

              const price =
                listing.price_usdc ||
                listing.price ||
                listing.price_wei ||
                '0';

              const seller =
                listing.seller_address ||
                listing.seller ||
                t('Seller no disponible');

              const name =
                listing.token_name ||
                listing.name ||
                listing.token_id ||
                t('Asset sin nombre');

              return (
                <div
                  key={tokenId}
                  style={{
                    overflow: 'hidden',
                    border:
                      '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '22px',
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
                    boxShadow:
                      '0 25px 60px rgba(0,0,0,0.28)',
                  }}
                >
                  <div
                    style={{
                      height: '210px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'radial-gradient(circle at center, rgba(16,185,129,0.16), rgba(6,182,212,0.05) 45%, rgba(0,0,0,0.35))',
                      borderBottom:
                        '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                  <img
                    src={listing.image_url || listing.image || ''}
                    alt={name}
                    style={{
                      width: '100%',
                      height: '100%',
                      margin: '0 auto',
                      objectFit: 'contain',
                      objectPosition: 'center center',
                      display: 'block',
                    }}
                  />
                    <div
                      style={{
                        width: '110px',
                        height: '110px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '28px',
                        border:
                          '1px solid rgba(52,211,153,0.25)',
                        background:
                          'rgba(52,211,153,0.08)',
                        color: '#6ee7b7',
                        fontSize: '1.25rem',
                        fontWeight: '900',
                        boxShadow:
                          '0 0 60px rgba(16,185,129,0.12)',
                      }}
                    >
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          letterSpacing: '0.12em',
                          color: '#64748b',
                          textTransform: 'uppercase',
                        }}
                      >
                        Token
                      </span>

                      <span
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: '999px',
                          background:
                            'rgba(52,211,153,0.08)',
                          border:
                            '1px solid rgba(52,211,153,0.18)',
                          color: '#6ee7b7',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                        }}
                      >
                        ACTIVO
                      </span>
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: '900',
                        wordBreak: 'break-word',
                      }}
                    >
                      {name}
                    </h2>

                    <div
                      style={{
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop:
                          '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Precio
                      </div>

                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '1.75rem',
                          fontWeight: '900',
                          color: '#6ee7b7',
                        }}
                      >
                        {price}
                        <span
                          style={{
                            marginLeft: '0.4rem',
                            fontSize: '0.7rem',
                            color: '#94a3b8',
                          }}
                        >
                          USDC
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        color: '#64748b',
                        fontSize: '0.7rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      Seller: {seller}
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/marketplace/${tokenId}`
                        )
                      }
                      style={{
                        width: '100%',
                        marginTop: '1.25rem',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        border:
                          '1px solid rgba(52,211,153,0.25)',
                        background:
                          'rgba(52,211,153,0.08)',
                        color: '#6ee7b7',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      Ver Detalles
                    </button>
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
