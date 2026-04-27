import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Menu from './pages/Menu';
import Kitchen from './pages/Kitchen';
import Messages from './pages/Messages';
import Bills from './pages/Bills';
import POS from './pages/POS';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SettingsProvider>
            <SearchProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="menu" element={<Menu />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="kitchen" element={<Kitchen />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="bills" element={<Bills />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </SearchProvider>
          </SettingsProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
