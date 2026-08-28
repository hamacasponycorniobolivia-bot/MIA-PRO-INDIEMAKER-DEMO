import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Assets() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isEs = i18n.language === 'es';
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Regla 125: Estado honesto. Cambiar a 'LIVE' cuando el backend devuelva la wallet en el JWT.
  const dataStatus = 'UNAVAILABLE';

  useEffect(() => {
    // Simulación de carga para mostrar el estado honesto
    const timer = setTimeout(() => {
      setAssets([]); // Sin datos reales aún
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          {isEs ? 'Mis Assets' : 'My Assets'}
        </h1>
        <span style={{ fontSize: '0.75rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
          {dataStatus}
        </span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          {isEs ? 'Cargando inventario...' : 'Loading inventory...'}
        </div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            {isEs ? 'Tu inventario está vacío' : 'Your inventory is empty'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            {isEs ? 'Los NFTs que poseas aparecerán aquí.' : 'The NFTs you own will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {assets.map((asset) => (
            <div key={asset.id} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ height: '150px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🥷</div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>MIA #{asset.token_id}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{asset.name || 'MIA Asset'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
