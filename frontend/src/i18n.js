import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "app.title": "MIA Marketplace",
      "app.connect_wallet": "Conectar Wallet",
      "app.disconnect": "Desconectar",

      "nav.marketplace": "Marketplace",
      "nav.wallet": "Wallet",
      "nav.assets": "Activos",
      "nav.transactions": "Transacciones",
      "nav.activity": "Actividad",
      "nav.profile": "Perfil",
      "nav.settings": "Configuración",
      "nav.admin": "Administración",

      "auth.login": "Iniciar sesión",
      "auth.register": "Crear cuenta",
      "auth.email": "Correo electrónico",
      "auth.password": "Contraseña",
      "auth.no_account": "¿No tienes cuenta?",
      "auth.have_account": "¿Ya tienes cuenta?",
      "auth.register_here": "Regístrate aquí",
      "auth.login_here": "Inicia sesión",
      "auth.access_infrastructure": "Accede a tu infraestructura Web3",
      "auth.join_today": "Únete a MIA Pro hoy",

      "marketplace.title": "Marketplace",
      "marketplace.empty": "No hay listings activos",
      "marketplace.empty_sub": "Los próximos activos aparecerán aquí.",
      "marketplace.token_id": "Token ID",
      "marketplace.seller": "Vendedor",
      "marketplace.price": "Precio",
      "marketplace.status": "Estado",
      "marketplace.listing_available": "Listing disponible",
      "marketplace.asset_published": "Activo publicado",
      "marketplace.operational": "Marketplace operativo",

      "inventory.title": "Mi Inventario",
      "inventory.empty": "Tu inventario está vacío",

      "assets.title": "Mis Activos Digitales",
      "assets.all": "Todos",
      "assets.nfts": "NFTs",
      "assets.tokens": "Tokens",
      "assets.sort_price": "Ordenar por: Precio",
      "assets.sort_recent": "Ordenar por: Reciente",
      "assets.loading": "Cargando tu colección...",
      "assets.sell": "Vender",
      "assets.owner": "Propietario",

      "wallet.title": "Wallet",
      "wallet.manage": "Gestionar Wallet",
      "wallet.balance": "Balance USDC",
      "wallet.address": "Address",

      "transactions.title": "Transacciones",
      "transactions.search": "Buscar transacción, hash, asset, estado...",
      "transactions.loading": "Cargando transacciones...",
      "transactions.type": "Tipo",
      "transactions.asset": "Asset",
      "transactions.amount": "Cantidad",
      "transactions.status": "Estado",
      "transactions.reference": "Referencia",
      "transactions.date": "Fecha",
      "transactions.tx_hash": "Tx Hash",

      "activity.title": "Actividad",
      "activity.search": "Buscar actividad, usuario, evento...",

      "profile.title": "Perfil",
      "profile.role": "Rol",

      "settings.title": "Configuración",
      "settings.language": "Idioma",
      "settings.spanish": "Español",
      "settings.english": "English",

      "admin.title": "Panel de Administración",
      "admin.control_panel": "Panel de Control",
      "admin.welcome": "Bienvenido de nuevo, Administrador.",
      "admin.console": "Consola de Administración",
      "admin.main_management": "Gestión Principal",
      "admin.super_admin": "Super Administrador",
      "admin.logout": "Cerrar Sesión Segura",
      "admin.system_operational": "Sistema Operativo",
      "admin.users": "Gestión de Usuarios",
      "admin.registered_users": "Usuarios Registrados",
      "admin.server_status": "Estado del Servidor",
      "admin.all_systems_operational": "Todos los sistemas operativos normalmente.",
      "admin.tenants": "Tenants",
      "admin.backups": "Backups",
      "admin.create_backup": "Crear Backup",
      "admin.restore_backup": "Restaurar Backup",

      "admin.user": "Usuario",
      "admin.tenant_id": "Tenant ID",
      "admin.owner": "Owner",
      "admin.name": "Nombre",

      "common.loading": "Cargando...",
      "common.search": "Buscar",
      "common.status": "Estado",
      "common.type": "Tipo",
      "common.user": "Usuario",
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.close": "Cerrar",
      "common.confirm": "Confirmar",

      "errors.load_listings": "No se pudieron cargar los listings.",
      "errors.wallet_not_found": "MetaMask o una wallet compatible no está instalada."
    }
  },

  en: {
    translation: {
      "app.title": "MIA Marketplace",
      "app.connect_wallet": "Connect Wallet",
      "app.disconnect": "Disconnect",

      "nav.marketplace": "Marketplace",
      "nav.wallet": "Wallet",
      "nav.assets": "Assets",
      "nav.transactions": "Transactions",
      "nav.activity": "Activity",
      "nav.profile": "Profile",
      "nav.settings": "Settings",
      "nav.admin": "Administration",

      "auth.login": "Login",
      "auth.register": "Create Account",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.no_account": "Don't have an account?",
      "auth.have_account": "Already have an account?",
      "auth.register_here": "Register here",
      "auth.login_here": "Log in",
      "auth.access_infrastructure": "Access your Web3 infrastructure",
      "auth.join_today": "Join MIA Pro today",

      "marketplace.title": "Marketplace",
      "marketplace.empty": "No active listings",
      "marketplace.empty_sub": "Upcoming assets will appear here.",
      "marketplace.token_id": "Token ID",
      "marketplace.seller": "Seller",
      "marketplace.price": "Price",
      "marketplace.status": "Status",
      "marketplace.listing_available": "Listing available",
      "marketplace.asset_published": "Asset published",
      "marketplace.operational": "Marketplace operational",

      "inventory.title": "My Inventory",
      "inventory.empty": "Your inventory is empty",

      "assets.title": "My Digital Assets",
      "assets.all": "All",
      "assets.nfts": "NFTs",
      "assets.tokens": "Tokens",
      "assets.sort_price": "Sort by: Price",
      "assets.sort_recent": "Sort by: Recent",
      "assets.loading": "Loading your collection...",
      "assets.sell": "Sell",
      "assets.owner": "Owner",

      "wallet.title": "Wallet",
      "wallet.manage": "Manage Wallet",
      "wallet.balance": "USDC Balance",
      "wallet.address": "Address",

      "transactions.title": "Transactions",
      "transactions.search": "Search transaction, hash, asset, status...",
      "transactions.loading": "Loading transactions...",
      "transactions.type": "Type",
      "transactions.asset": "Asset",
      "transactions.amount": "Amount",
      "transactions.status": "Status",
      "transactions.reference": "Reference",
      "transactions.date": "Date",
      "transactions.tx_hash": "Tx Hash",

      "activity.title": "Activity",
      "activity.search": "Search activity, user, event...",

      "profile.title": "Profile",
      "profile.role": "Role",

      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.spanish": "Spanish",
      "settings.english": "English",

      "admin.title": "Administration Panel",
      "admin.control_panel": "Control Panel",
      "admin.welcome": "Welcome back, Administrator.",
      "admin.console": "Administration Console",
      "admin.main_management": "Main Management",
      "admin.super_admin": "Super Administrator",
      "admin.logout": "Secure Logout",
      "admin.system_operational": "System Operational",
      "admin.users": "User Management",
      "admin.registered_users": "Registered Users",
      "admin.server_status": "Server Status",
      "admin.all_systems_operational": "All systems are operating normally.",
      "admin.tenants": "Tenants",
      "admin.backups": "Backups",
      "admin.create_backup": "Create Backup",
      "admin.restore_backup": "Restore Backup",

      "admin.user": "User",
      "admin.tenant_id": "Tenant ID",
      "admin.owner": "Owner",
      "admin.name": "Name",

      "common.loading": "Loading...",
      "common.search": "Search",
      "common.status": "Status",
      "common.type": "Type",
      "common.user": "User",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.close": "Close",
      "common.confirm": "Confirm",

      "errors.load_listings": "Could not load listings.",
      "errors.wallet_not_found": "MetaMask or a compatible wallet is not installed."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
