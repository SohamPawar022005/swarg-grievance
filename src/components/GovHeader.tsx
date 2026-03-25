import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const GovHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      local: 'Local Authority',
      district: 'District Authority',
      state: 'State Authority',
      compliance: 'Compliance Authority',
    };
    return map[role] || role;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="saffron-bar" />
      <div className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-header-brand">
            <div className="gov-header-logo">भा</div>
            <div>
              <div className="gov-header-title">AI-Powered Governance System</div>
              <div className="gov-header-subtitle">Government of India — GIGW Compliant</div>
            </div>
          </div>

          <div className="gov-header-right">
            <div className="gov-header-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by ID, keyword, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {user && (
              <div className="gov-header-user">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{getRoleLabel(user.role)} • {user.department}</div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="gov-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Citizen Services
          </Link>
          {user ? (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              Officer Login
            </Link>
          )}
        </nav>
      </div>
      <div className="green-bar" />
    </header>
  );
};

export default GovHeader;
