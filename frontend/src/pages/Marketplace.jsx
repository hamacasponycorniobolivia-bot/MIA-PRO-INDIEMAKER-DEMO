import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Marketplace() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredListings = listings.filter(listing =>
    listing.token_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.seller_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          {isEs ? 'Marketplace' : 'Marketplace'}
        </h1>
        <Link
          to="/marketplace/create"
          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent)', color: '#000', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}
        >
          {isEs ? '+ Crear Listing' : '+ Create Listing'}
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder={isEs ? 'Buscar por Token ID o Seller...' : 'Search by Token ID or Seller...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          {isEs ? 'Cargando listings...' : 'Loading listings...'}
        </div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>
          {isEs ? 'No se pudieron cargar los listings.' : 'Could not load listings.'}
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            {isEs ? 'No hay listings activos' : 'No active listings'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {isEs ? 'Los próximos activos aparecerán aquí.' : 'Upcoming assets will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredListings.map((listing, idx) => (
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
                  <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '600' }}>
                    {listing.price_wei ? `${(Number(listing.price_wei) / 1e6).toFixed(2)} USDC` : '—'}
                  </span>
                </div>
                <Link
                  to={`/marketplace/${listing.token_id}`}
                  style={{ display: 'block', textAlign: 'center', padding: '0.5rem', backgroundColor: 'var(--accent)', color: '#000', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}
                >
                  {isEs ? 'Ver detalle' : 'View details'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
