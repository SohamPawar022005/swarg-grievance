import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="saffron-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }} />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">भा</div>
          <h1 className="login-title">AI-Powered Governance System</h1>
          <p className="login-subtitle">Government of India — Officer Login Portal</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
            Sign In
          </button>
        </form>

        <div className="credentials-box">
          <h4>🔑 Demo Credentials (Who can access this portal)</h4>
          <ul className="credentials-list">
            <li>
              <span className="role">🏘️ Local Officer (Ward Level)</span>
              <span className="cred">local_officer / pass123</span>
            </li>
            <li>
              <span className="role">🏛️ District Officer (Supervises Local)</span>
              <span className="cred">district_officer / pass123</span>
            </li>
            <li>
              <span className="role">🏗️ State Officer (Supervises District)</span>
              <span className="cred">state_officer / pass123</span>
            </li>
            <li>
              <span className="role">⚖️ Compliance Officer (Supervises All)</span>
              <span className="cred">compliance_officer / pass123</span>
            </li>
          </ul>
          <p style={{ fontSize: '11px', color: 'var(--gov-text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            <strong>Hierarchy:</strong> Local → District → State → Compliance<br />
            Each higher level supervises the level below and has access to broader analytics.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <a href="/" style={{ color: 'var(--gov-navy)', fontSize: '13px' }}>← Back to Citizen Portal</a>
      </div>

      <div className="green-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} />
    </div>
  );
};

export default LoginPage;
