import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { i18n } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const isEs = i18n.language === 'es';

  const faqs = [
    {
      q_es: '¿Qué es MIA?',
      q_en: 'What is MIA?',
      a_es: 'MIA es una infraestructura Web3 SaaS para la gestión, compra y venta de activos digitales con aislamiento multi-tenant y seguridad empresarial.',
      a_en: 'MIA is a Web3 SaaS infrastructure for managing, buying, and selling digital assets with multi-tenant isolation and enterprise-grade security.'
    },
    {
      q_es: '¿Cómo conecto mi wallet?',
      q_en: 'How do I connect my wallet?',
      a_es: 'Puedes conectar tu wallet compatible con EVM (como MetaMask) directamente desde el Dashboard o el Marketplace. La autenticación se realiza de forma segura.',
      a_en: 'You can connect your EVM-compatible wallet (like MetaMask) directly from the Dashboard or Marketplace. Authentication is performed securely.'
    },
    {
      q_es: '¿Qué redes blockchain soporta MIA?',
      q_en: 'Which blockchain networks does MIA support?',
      a_es: 'Actualmente soportamos Ethereum y USDC en redes compatibles. Otras redes están en no disponible en esta versión (UNAVAILABLE).',
      a_en: 'We currently support Ethereum and USDC on compatible networks. Other networks are in the UNAVAILABLE phase.'
    },
    {
      q_es: '¿Cómo funciona la seguridad de mis activos?',
      q_en: 'How does the security of my assets work?',
      a_es: 'Utilizamos autenticación JWT, aislamiento estricto de tenants, logs de auditoría inmutables y rate limiting para proteger todas las operaciones.',
      a_en: 'We use JWT authentication, strict tenant isolation, immutable audit logs, and rate limiting to protect all operations.'
    }
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px' }}>FAQ</span>
        <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--text-primary)' }}>
          {isEs ? 'Centro de Ayuda' : 'Help Center'}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => toggle(index)}
              style={{
                width: '100%',
                padding: '1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {isEs ? faq.q_es : faq.q_en}
              <span style={{ color: 'var(--accent)', fontSize: '1.5rem', lineHeight: '1' }}>
                {openIndex === index ? '-' : '+'}
              </span>
            </button>
            {openIndex === index && (
              <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {isEs ? faq.a_es : faq.a_en}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
