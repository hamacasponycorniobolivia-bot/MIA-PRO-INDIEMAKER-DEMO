import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "app.title": "MIA Marketplace",
      "app.connect_wallet": "Conectar Wallet",
      "app.disconnect": "Desconectar",
      "marketplace.title": "Marketplace",
      "marketplace.empty": "No hay listings activos",
      "marketplace.empty_sub": "Los próximos activos aparecerán aquí.",
      "inventory.title": "Mi Inventario",
      "inventory.empty": "Tu inventario está vacío",
      "errors.load_listings": "No se pudieron cargar los listings.",
      "errors.wallet_not_found": "MetaMask o una wallet compatible no está instalada."
    }
  },
  en: {
    translation: {
      "app.title": "MIA Marketplace",
      "app.connect_wallet": "Connect Wallet",
      "app.disconnect": "Disconnect",
      "marketplace.title": "Marketplace",
      "marketplace.empty": "No active listings",
      "marketplace.empty_sub": "Upcoming assets will appear here.",
      "inventory.title": "My Inventory",
      "inventory.empty": "Your inventory is empty",
      "errors.load_listings": "Could not load listings.",
      "errors.wallet_not_found": "MetaMask or a compatible wallet is not installed."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  });

export default i18n;
