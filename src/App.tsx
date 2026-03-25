import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import GovHeader from '@/components/GovHeader';
import GovFooter from '@/components/GovFooter';
import CitizenPage from './pages/CitizenPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Login page has its own layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Main layout for all other pages */}
        <Route
          path="*"
          element={
            <div className="app-layout">
              <GovHeader />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<CitizenPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <GovFooter />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
