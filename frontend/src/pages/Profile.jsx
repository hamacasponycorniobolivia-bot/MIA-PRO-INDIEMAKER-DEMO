import { Shield, User, Mail, Globe } from 'lucide-react';

export default function Profile() {
  const section = {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem'
  };

  const item = {
    background: 'rgba(2, 6, 23, 0.45)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '1rem'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Preferencias
      </h1>

      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Información y configuración de tu perfil dentro de MIA Pro.
      </p>

      <div style={section}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          <User size={22} className="text-indigo-400" />
          Perfil
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            L
          </div>

          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              Leonardo Atilio Aquino
            </div>
            <div style={{ color: '#94a3b8' }}>
              @leo_aquino
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={item}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              Nombre completo
            </div>
            <div>Leonardo Atilio Aquino</div>
          </div>

          <div style={item}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              Nombre de usuario
            </div>
            <div>@leo_aquino</div>
          </div>
        </div>
      </div>

      <div style={section}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          <Mail size={22} className="text-indigo-400" />
          Cuenta
        </h2>

        <div style={item}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            Correo electrónico
          </div>
          <div>leonardoaqui05@gmail.com</div>
          <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.4rem' }}>
            ✓ Correo verificado
          </div>
        </div>
      </div>

      <div style={section}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          <Shield size={22} className="text-emerald-400" />
          Acceso
        </h2>

        <div style={item}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            Rol de cuenta
          </div>
          <div style={{ fontWeight: 'bold' }}>SUPER_ADMIN</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Cuenta con privilegios administrativos del sistema.
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.8rem',
        marginTop: '2rem'
      }}>
        <Globe size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
        MIA Pro · Perfil de usuario
      </div>
    </div>
  );
}
