import { Users, DollarSign, Activity, Server } from 'lucide-react';

export default function AdminOverview() {
  const statCard = (title, value, Icon, color) => ({
    background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${color}40`, borderRadius: '16px', padding: '2rem', boxShadow: `0 0 20px ${color}20`
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#ef4444' }}>Panel de Administración</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={statCard('Total Usuarios', '0', Users, '#3b82f6')}>
          <Users size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>0</h3>
          <p style={{ color: '#94a3b8' }}>Usuarios Registrados</p>
        </div>
        <div style={statCard('Volumen Total', '$0', DollarSign, '#10b981')}>
          <DollarSign size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>$0</h3>
          <p style={{ color: '#94a3b8' }}>En Transacciones</p>
        </div>
        <div style={statCard('Actividad', '0%', Activity, '#f59e0b')}>
          <Activity size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>0%</h3>
          <p style={{ color: '#94a3b8' }}>Uptime del Sistema</p>
        </div>
      </div>

      <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Estado del Servidor</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981' }}>
          <Server size={24} />
          <span style={{ fontWeight: 'bold' }}>Todos los sistemas operativos normalmente.</span>
        </div>
      </div>
    </div>
  );
}
