import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import LocationsPage from './pages/LocationsPage';
import TransportationsPage from './pages/TransportationsPage';
import RoutesPage from './pages/RoutesPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/routes" replace />} />
            <Route
              path="locations"
              element={
                <ProtectedRoute adminOnly>
                  <LocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="transportations"
              element={
                <ProtectedRoute adminOnly>
                  <TransportationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="routes" element={<RoutesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/routes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;