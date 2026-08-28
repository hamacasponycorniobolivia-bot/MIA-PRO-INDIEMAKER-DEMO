import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ListingDetail() {
  const { tokenId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;

    const fetchListing = async () => {
      try {
        const res = await fetch(`${API}/api/listings`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const found = Array.isArray(data) ? data.find(l => l.token_id === tokenId) : null;
        if (mounted) {
          setListing(found || null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setListing(null);
          setLoading(false);
        }
      }
    };

    fetchListing();
    return () => { mounted = false; };
  }, [tokenId]);

  const handleBuy = async () => {
    if (!token) {
      return navigate('/login');
    }

    setMsg({ type: '', text: '' });
    setBuying(true);

    try {
      await axios.post(`${API}/api/marketplace/buy`, { tokenId });
      setMsg({ type: 'success', text: isEs ? 'Compra realizada con éxito' : 'Purchase completed successfully' });
      setTimeout(() => navigate('/assets'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error en la compra' : 'Purchase error') });
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {isEs ? 'Cargando detalle...' : 'Loading details...'}
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{isEs ? 'Listing no encontrado' : 'Listing not found'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{isEs ? 'El listing que buscas no existe o ya no está activo.' : 'The listing you are looking for does not exist or is no longer active.'}</p>
        <Link to="/marketplace" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← {isEs ? 'Volver al Marketplace' : 'Back to Marketplace'}</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/marketplace" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← {isEs ? 'Volver al Marketplace' : 'Back to Marketplace'}
      </Link>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Image */}
        <div style={{ height: '300px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
          🥷
        </div>

        {/* Details */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: 'var(--text-primary)' }}>
                MIA #{listing.token_id}
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {isEs ? 'Vendido por' : 'Sold by'}: {listing.seller_address ? `${listing.seller_address.slice(0, 10)}...${listing.seller_address.slice(-8)}` : 'Unknown'}
              </p>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
              UNAVAILABLE: GET /api/listings/:tokenId
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'Precio' : 'Price'}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {listing.price_wei ? `${(Number(listing.price_wei) / 1e6).toFixed(2)} USDC` : '—'}
            </div>
          </div>

          {/* Messages */}
          {msg.text && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: msg.type === 'error' ? 'var(--danger)' : 'var(--accent)', border: `1px solid ${msg.type === 'error' ? 'var(--danger)' : 'var(--accent)'}` }}>
              {msg.text}
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={buying}
            style={{ width: '100%', padding: '1rem', backgroundColor: buying ? '#525252' : 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: buying ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem' }}
          >
            {buying ? (isEs ? 'Procesando compra...' : 'Processing purchase...') : (isEs ? 'Comprar ahora' : 'Buy now')}
          </button>

          {!token && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isEs ? 'Debes iniciar sesión para comprar' : 'You must log in to purchase'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
