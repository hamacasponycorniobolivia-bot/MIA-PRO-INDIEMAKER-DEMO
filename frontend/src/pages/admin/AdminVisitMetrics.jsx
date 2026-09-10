import { useEffect, useState } from 'react';
import { Activity, Eye, Users, CalendarDays, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || "";

export default function AdminVisitMetrics() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API}/api/admin/visit-metrics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('No se pudieron cargar las métricas');
      }

      setMetrics(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadMetrics();
  }, [token]);

  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 0 20px rgba(56, 189, 248, 0.08)',
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>
          📊 Métricas de Visitas
        </h1>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>
          📊 Métricas de Visitas
        </h1>
        <div style={{ ...cardStyle, borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          {error}
        </div>
      </div>
    );
  }

  const daily = metrics?.daily || [];
  const maxVisits = Math.max(...daily.map((item) => item.visits), 1);

  return (
    <div style={{ padding: '2rem', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
            📊 Métricas de Visitas
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            Estadísticas públicas del sitio · Solo SUPER_ADMIN
          </p>
        </div>

        <button
          onClick={loadMetrics}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#7dd3fc',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={cardStyle}>
          <Eye size={30} color="#7dd3fc" />
          <h2 style={{ fontSize: '2.3rem', margin: '1rem 0 0.25rem' }}>
            {metrics?.total_visits ?? 0}
          </h2>
          <p style={{ color: '#cbd5e1', margin: 0 }}>Visitas totales</p>
        </div>

        <div style={cardStyle}>
          <Users size={30} color="#a5f3fc" />
          <h2 style={{ fontSize: '2.3rem', margin: '1rem 0 0.25rem' }}>
            {metrics?.unique_visitors ?? 0}
          </h2>
          <p style={{ color: '#cbd5e1', margin: 0 }}>Visitantes únicos</p>
        </div>

        <div style={cardStyle}>
          <CalendarDays size={30} color="#bae6fd" />
          <h2 style={{ fontSize: '2.3rem', margin: '1rem 0 0.25rem' }}>
            {metrics?.today_visits ?? 0}
          </h2>
          <p style={{ color: '#cbd5e1', margin: 0 }}>Visitas hoy</p>
        </div>

        <div style={cardStyle}>
          <Activity size={30} color="#e0f2fe" />
          <h2 style={{ fontSize: '2.3rem', margin: '1rem 0 0.25rem' }}>
            {metrics?.registered_users ?? 0}
          </h2>
          <p style={{ color: '#cbd5e1', margin: 0 }}>Usuarios registrados</p>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.4rem' }}>Períodos</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <strong style={{ fontSize: '1.7rem' }}>{metrics?.last_7_days_visits ?? 0}</strong>
            <div style={{ color: '#94a3b8' }}>Visitas · 7 días</div>
            <div style={{ color: '#cbd5e1' }}>
              {metrics?.last_7_days_unique ?? 0} únicos
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '1.7rem' }}>{metrics?.last_30_days_visits ?? 0}</strong>
            <div style={{ color: '#94a3b8' }}>Visitas · 30 días</div>
            <div style={{ color: '#cbd5e1' }}>
              {metrics?.last_30_days_unique ?? 0} únicos
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: '1.4rem' }}>
          Evolución · últimos 30 días
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '5px',
          height: '220px',
          paddingTop: '1rem',
          overflowX: 'auto',
        }}>
          {daily.map((item) => (
            <div
              key={item.date}
              title={`${item.date}: ${item.visits} visitas · ${item.unique_visitors} únicos`}
              style={{
                minWidth: '14px',
                height: `${Math.max((item.visits / maxVisits) * 180, 4)}px`,
                background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)',
                borderRadius: '5px 5px 2px 2px',
              }}
            />
          ))}
        </div>

        <div style={{
          marginTop: '1rem',
          color: '#64748b',
          fontSize: '0.8rem',
        }}>
          Cada barra representa un día. Coloca el cursor sobre una barra para ver el detalle.
        </div>
      </div>
    </div>
  );
}
