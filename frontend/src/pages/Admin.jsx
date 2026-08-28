import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <h1>Panel de Administración</h1>
      <p>Administrador: {user?.email || 'Desconocido'}</p>
      <p>Rol: {user?.role || 'USER'}</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Gestión de Usuarios</h2>
        <p>Aquí se cargarán las tablas de usuarios, tenants y auditoría.</p>
      </div>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}
