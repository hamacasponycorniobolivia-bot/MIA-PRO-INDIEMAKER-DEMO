import { useState, useEffect } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';

const mockAssets = [
  { id: 1, name: 'Cyber Punk #001', collection: 'Cyber Collection', price: '1.2 ETH', image: null, likes: 124 },
  { id: 2, name: 'Neon City #042', collection: 'City Series', price: '0.8 ETH', image: null, likes: 89 },
  { id: 3, name: 'Abstract Mind', collection: 'Art Block', price: '2.5 ETH', image: null, likes: 256 },
  { id: 4, name: 'Digital Dream', collection: 'Dreamscape', price: '0.5 ETH', image: null, likes: 45 },
  { id: 5, name: 'Future Vision', collection: 'Visionary', price: '3.0 ETH', image: null, likes: 312 },
  { id: 6, name: 'Pixel World', collection: 'Retro Bits', price: '0.3 ETH', image: null, likes: 67 },
  { id: 7, name: 'Galactic Hero', collection: 'Space Ops', price: '1.5 ETH', image: null, likes: 190 },
  { id: 8, name: 'Quantum Cat', collection: 'Crypto Pets', price: '0.9 ETH', image: null, likes: 420 },
];

export default function Assets() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    // Simular carga
    setTimeout(() => setAssets(mockAssets), 500);
  }, []);

  const cardStyle = { background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mis Activos Digitales</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }}>
            <option>Todos</option>
            <option>NFTs</option>
            <option>Tokens</option>
          </select>
          <select style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }}>
            <option>Ordenar por: Precio</option>
            <option>Ordenar por: Reciente</option>
          </select>
        </div>
      </div>

      {assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Cargando tu colección...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
          {assets.map((asset) => (
            <div key={asset.id || `asset-${asset.name}`} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.6)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <button style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MoreHorizontal size={16} /></button>
              </div>
              <div style={{ aspectRatio: '1/1', background: '#1e293b', overflow: 'hidden', position: 'relative' }}>
                <img src={asset.image} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={12} color="#ec4899" fill="#ec4899" /> {asset.likes}
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>{asset.collection}</p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ec4899', fontWeight: 'bold', fontSize: '1.1rem' }}>{asset.price}</span>
                  <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}>Vender</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
