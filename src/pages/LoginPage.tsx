import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = languages.find(l => l.code === lang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(t('login.error'));
    }
  };

  return (
    <div className="login-page">
      <div className="saffron-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }} />

      {/* Language selector on login page */}
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 20 }}>
        <div className="lang-dropdown-wrapper">
          <button
            className="lang-dropdown-trigger lang-trigger-login"
            onClick={() => setLangOpen(!langOpen)}
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
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">भा</div>
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('login.username')}</label>
            <input
              type="text" className="form-input" value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.enterUsername')} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input
              type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.enterPassword')} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
            {t('login.submit')}
          </button>
        </form>

        <div className="credentials-box">
          <h4>{t('login.demo')}</h4>
          <ul className="credentials-list">
            <li>
              <span className="role">{t('login.local')}</span>
              <span className="cred">local_officer / pass123</span>
            </li>
            <li>
              <span className="role">{t('login.district')}</span>
              <span className="cred">district_officer / pass123</span>
            </li>
            <li>
              <span className="role">{t('login.state')}</span>
              <span className="cred">state_officer / pass123</span>
            </li>
            <li>
              <span className="role">{t('login.compliance')}</span>
              <span className="cred">compliance_officer / pass123</span>
            </li>
          </ul>
          <p style={{ fontSize: '11px', color: 'var(--gov-text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            <strong>{t('login.hierarchy')}</strong><br />
            {t('login.hierarchy.desc')}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <a href="/" style={{ color: 'var(--gov-navy)', fontSize: '13px' }}>{t('login.back')}</a>
      </div>

      <div className="green-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} />
    </div>
  );
};

export default LoginPage;
