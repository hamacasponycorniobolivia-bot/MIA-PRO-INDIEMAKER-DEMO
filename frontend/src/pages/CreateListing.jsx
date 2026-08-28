import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CreateListing() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';

  const [tokenId, setTokenId] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!token) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{isEs ? 'Acceso denegado' : 'Access denied'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{isEs ? 'Debes iniciar sesión para crear un listing.' : 'You must log in to create a listing.'}</p>
        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{isEs ? 'Iniciar sesión' : 'Login'}</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!tokenId || !price || Number(price) <= 0) {
      return setMsg({ type: 'error', text: isEs ? 'Token ID y precio son requeridos' : 'Token ID and price are required' });
    }

    setLoading(true);

    try {
      await axios.post(`${API}/api/marketplace/list`, { tokenId, price: Number(price) });
      setMsg({ type: 'success', text: isEs ? 'Listing creado con éxito' : 'Listing created successfully' });
      setTimeout(() => navigate('/marketplace'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || (isEs ? 'Error al crear listing' : 'Error creating listing') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/marketplace" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← {isEs ? 'Volver al Marketplace' : 'Back to Marketplace'}
      </Link>

      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '1rem 0 2rem 0' }}>
        {isEs ? 'Crear Nuevo Listing' : 'Create New Listing'}
      </h1>

      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'Token ID' : 'Token ID'}
            </label>
            <input
              type="text"
              placeholder="ej: 1234"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isEs ? 'Precio (USDC)' : 'Price (USDC)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          {msg.text && (
            <div style={{ padding: '1rem', borderRadius: '4px', backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: msg.type === 'error' ? 'var(--danger)' : 'var(--accent)', border: `1px solid ${msg.type === 'error' ? 'var(--danger)' : 'var(--accent)'}` }}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '1rem', backgroundColor: loading ? '#525252' : 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem' }}
          >
            {loading ? (isEs ? 'Creando...' : 'Creating...') : (isEs ? 'Crear Listing' : 'Create Listing')}
          </button>
        </form>
      </div>
    </div>
  );
}
