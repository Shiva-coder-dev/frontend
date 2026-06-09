import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [portal, setPortal] = useState('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(identifier, password, portal);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    if (portal === 'admin') { setIdentifier('admin@fingroup.com'); setPassword('admin123'); }
    else { setIdentifier('MEM001'); setPassword('pass1234'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="logo-icon"><i className="ti ti-shield-dollar" /></div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>FinGroup Pro</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>Finance Management System</div>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="portal-tabs">
          <div className={`portal-tab${portal === 'admin' ? ' active' : ''}`} onClick={() => { setPortal('admin'); setIdentifier(''); setPassword(''); setError(''); }}>
            <i className="ti ti-shield" /> Admin
          </div>
          <div className={`portal-tab${portal === 'member' ? ' active' : ''}`} onClick={() => { setPortal('member'); setIdentifier(''); setPassword(''); setError(''); }}>
            <i className="ti ti-user" /> Member
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="auth-err"><i className="ti ti-alert-circle" /> {error}</div>}

          <div className="form-group">
            <label className="form-label">{portal === 'admin' ? 'Admin Email' : 'Member ID'}</label>
            <input
              className="auth-input"
              type={portal === 'admin' ? 'email' : 'text'}
              placeholder={portal === 'admin' ? 'admin@fingroup.com' : 'MEM001'}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label className="form-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <><i className="ti ti-loader-2 spin" /> Signing in...</> : <>Sign In Securely <i className="ti ti-arrow-right" /></>}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="auth-demo" style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Demo Credentials</div>
            <button className="btn btn-ghost btn-sm" onClick={fillDemo} style={{ fontSize: 11, padding: '3px 8px' }}>Auto-fill</button>
          </div>
          {portal === 'admin' ? (
            <>
              <div className="demo-row"><span className="demo-key">Email</span><span className="demo-val">admin@fingroup.com</span></div>
              <div className="demo-row"><span className="demo-key">Password</span><span className="demo-val">admin123</span></div>
            </>
          ) : (
            <>
              <div className="demo-row"><span className="demo-key">Member ID</span><span className="demo-val">MEM001 – MEM005</span></div>
              <div className="demo-row"><span className="demo-key">Password</span><span className="demo-val">pass1234</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
