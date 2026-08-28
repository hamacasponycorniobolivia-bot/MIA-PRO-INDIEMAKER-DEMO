import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SystemStatus from '../components/SystemStatus';
import Networks from '../components/Networks';
import Cryptocurrencies from '../components/Cryptocurrencies';
import Security from '../components/Security';
import FAQ from '../components/FAQ';
import MarketplacePreview from '../components/MarketplacePreview';

export default function Landing() {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Landing */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>MIA</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{ padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Login</Link>
          <Link to="/register" style={{ padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', backgroundColor: 'var(--accent)', color: '#000', fontWeight: '600' }}>Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto', flex: 1 }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>MIA V1.1</span>
        <h2 style={{ fontSize: '3.5rem', margin: '1rem 0', lineHeight: '1.1' }}>Own your MIA.</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Compra, vende y administra tus activos digitales desde un solo lugar.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/marketplace" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', backgroundColor: 'var(--accent)', color: '#000', fontWeight: '600' }}>
            Explore Marketplace
          </Link>
          <Link to="/register" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            Access MIA
          </Link>
        </div>
      </header>

      {/* System Status (Regla 125) */}
      <SystemStatus />

      {/* Networks Section (Regla 8) */}
      <Networks />

      {/* Cryptocurrencies Section (Regla 9) */}
      <Cryptocurrencies />

      {/* Security Section (Regla 14 y 83) */}
      <Security />

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0 }}>Marketplace</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Trade digital assets securely on the blockchain.</p>
        </div>
        <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0 }}>Wallet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your USDC balance and digital inventory.</p>
        </div>
        <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0 }}>Security</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Enterprise-grade protection and multi-tenant isolation.</p>
        </div>
      </section>

      {/* Marketplace Preview (Regla 10 y 125) */}
      <MarketplacePreview />

      {/* FAQ Section (Regla 97) */}
      <FAQ />

      <Footer />
    </div>
  );
}
