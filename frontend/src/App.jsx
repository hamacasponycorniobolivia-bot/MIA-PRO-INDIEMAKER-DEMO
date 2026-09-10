import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import Login from './pages/Login';
import Register from './pages/Register';

// User
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Assets from './pages/Assets';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Settings from './pages/Settings';
import ConnectWallet from './pages/ConnectWallet';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import MintNFT from './pages/MintNFT';
import TransferNFT from './pages/TransferNFT';

// Admin
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTenants from './pages/admin/AdminTenants';
import AdminWallets from './pages/admin/AdminWallets';
import AdminAssets from './pages/admin/AdminAssets';
import AdminMarketplace from './pages/admin/AdminMarketplace';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminLedger from './pages/admin/AdminLedger';
import AdminAudit from './pages/admin/AdminAudit';
import AdminLogs from './pages/admin/AdminLogs';
import AdminBackups from './pages/admin/AdminBackups';
import AdminSystem from './pages/admin/AdminSystem';
import AdminExports from './pages/admin/AdminExports';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ==================== PÚBLICAS ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================== ÁREA DE USUARIO ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>

                <Route path="dashboard" element={<Dashboard />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="assets" element={<Assets />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="activity" element={<Activity />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="settings" element={<Settings />} />

              {/* Operaciones Web3 */}
              <Route path="connect-wallet" element={<ConnectWallet />} />
              <Route path="create-listing" element={<CreateListing />} />
              <Route path="listing/:id" element={<ListingDetail />} />
              <Route path="mint-nft" element={<MintNFT />} />
              <Route path="transfer-nft" element={<TransferNFT />} />

            </Route>
          </Route>

          {/* ==================== USUARIOS ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'USER']} />}>
          <Route path="/admin/users" element={<UserLayout />}>
            <AdminUsers />
          </Route>
        </Route>

        {/* ==================== ADMIN ==================== */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>

              <Route index element={<AdminOverview />} />

              <Route path="users" element={<AdminUsers />} />
              <Route path="tenants" element={<AdminTenants />} />
              <Route path="wallets" element={<AdminWallets />} />
              <Route path="assets" element={<AdminAssets />} />
              <Route path="marketplace" element={<AdminMarketplace />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="ledger" element={<AdminLedger />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="logs" element={<AdminLogs />} />
            <Route path="backups" element={<AdminBackups />} />
              <Route path="system" element={<AdminSystem />} />
              <Route path="exports" element={<AdminExports />} />
              <Route path="settings" element={<AdminSettings />} />

            </Route>
          </Route>

          {/* ==================== CATCH ALL ==================== */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
