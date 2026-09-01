import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MarketplacePreview() {
  const { i18n } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEs = i18n.language === 'es';

  useEffect(() => {
    let mounted = true;

    const fetchListings = async () => {
      try {
        const res = await fetch(`${API}/api/listings`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (mounted) {
          setListings(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('connection_failed');
          setListings([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchListings();
    return () => { mounted = false; };
  }, []);

  return (
    <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>
          {isEs ? 'ACTIVOS DISPONIBLES' : 'AVAILABLE ASSETS'}
        </span>
        <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>
          {isEs ? 'Marketplace' : 'Marketplace'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          {isEs
            ? 'Explora los activos digitales disponibles en la plataforma.'
            : 'Explore digital assets available on the platform.'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          {isEs ? 'Cargando listings...' : 'Loading listings...'}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          {isEs ? 'No se pudieron cargar los listings.' : 'Could not load listings.'}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            {isEs ? 'No hay listings activos' : 'No active listings'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {isEs ? 'Los próximos activos aparecerán aquí.' : 'Upcoming assets will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {listings.slice(0, 6).map((listing, idx) => (
              <div key={listing.id ?? idx} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s' }}>
                <div style={{ height: '160px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  🥷
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    MIA #{listing.token_id ?? idx}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {listing.seller_address ? `${listing.seller_address.slice(0, 6)}...${listing.seller_address.slice(-4)}` : 'Unknown'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600' }}>
                      {listing.price_wei ? `${(Number(listing.price_wei) / 1e6).toFixed(2)} USDC` : '—'}
                    </span>
                  </div>
                  <Link
                    to="/marketplace"
                    style={{ display: 'block', textAlign: 'center', padding: '0.5rem', backgroundColor: 'var(--accent)', color: '#000', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}
                  >
                    {isEs ? 'Ver detalle' : 'View details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/marketplace"
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}
            >
              {isEs ? 'Ver todos los listings' : 'View all listings'} →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
