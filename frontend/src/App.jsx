import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Assets from './pages/Assets';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Settings from './pages/Settings';
import ConnectWallet from './pages/ConnectWallet';
import MintNFT from './pages/MintNFT';
import TransferNFT from './pages/TransferNFT';
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
import AdminSystem from './pages/admin/AdminSystem';
import AdminExports from './pages/admin/AdminExports';
import AdminSettings from './pages/admin/AdminSettings';
import './i18n';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/create" element={<CreateListing />} />
                <Route path="/marketplace/:tokenId" element={<ListingDetail />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/assets/mint" element={<MintNFT />} />
                <Route path="/assets/transfer" element={<TransferNFT />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/security" element={<Security />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/connect-wallet" element={<ConnectWallet />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/tenants" element={<AdminTenants />} />
                <Route path="/admin/wallets" element={<AdminWallets />} />
                <Route path="/admin/assets" element={<AdminAssets />} />
                <Route path="/admin/marketplace" element={<AdminMarketplace />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/ledger" element={<AdminLedger />} />
                <Route path="/admin/audit" element={<AdminAudit />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/system" element={<AdminSystem />} />
                <Route path="/admin/exports" element={<AdminExports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
