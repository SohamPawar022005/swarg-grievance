import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useState } from 'react';

const GovHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);

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

  const currentLang = languages.find(l => l.code === lang);

  return (
    <header>
      <div className="saffron-bar" />
      <div className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-header-brand">
            <div className="gov-header-logo">भा</div>
            <div>
              <div className="gov-header-title">{t('header.title')}</div>
              <div className="gov-header-subtitle">{t('header.subtitle')}</div>
            </div>
          </div>

          <div className="gov-header-right">
            {/* Language Selector */}
            <div className="lang-dropdown-wrapper">
              <button
                className="lang-dropdown-trigger"
                onClick={() => setLangOpen(!langOpen)}
                title={t('language.select')}
              >
                🌐 {currentLang?.nativeName || 'English'}
                <span className="lang-arrow">▾</span>
              </button>
              {langOpen && (
                <>
                  <div className="lang-backdrop" onClick={() => setLangOpen(false)} />
                  <div className="lang-dropdown-menu">
                    <div className="lang-dropdown-header">{t('language.select')}</div>
                    <div className="lang-dropdown-list">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          className={`lang-dropdown-item ${lang === l.code ? 'active' : ''}`}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                        >
                          <span className="lang-native">{l.nativeName}</span>
                          <span className="lang-english">({l.englishName})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="gov-header-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder={t('header.search')}
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
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="gov-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            {t('nav.citizen')}
          </Link>
          {user ? (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              {t('nav.login')}
            </Link>
          )}
        </nav>
      </div>
      <div className="green-bar" />
    </header>
  );
};

export default GovHeader;
