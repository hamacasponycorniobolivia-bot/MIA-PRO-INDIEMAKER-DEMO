import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '24px', padding: '3rem', boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)', maxWidth: '450px', width: '100%', margin: '0 auto' };
  const inputStyle = { width: '100%', padding: '1rem', background: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', marginBottom: '1.5rem', outline: 'none', transition: 'all 0.3s ease' };
  const buttonStyle = { width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Crear Cuenta</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>Únete a MIA Pro hoy</p>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 15px rgba(59,130,246,0.3)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 15px rgba(59,130,246,0.3)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />

          <button type="submit" disabled={loading} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.6)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)'; }}>
            {loading ? 'Creando...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
