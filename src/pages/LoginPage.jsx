// Login / role-picker screen - Beautiful original design
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Button, Avatar, AvatarStack, ProgressBar, Sparkline, Ic } from '../components/ui';

const ROLES = [
  { id: 'admin', label: 'Admin', sub: 'Full system access', color: '#15348a' },
  { id: 'manager', label: 'Manager', sub: 'Team oversight', color: '#65bb3c' },
  { id: 'resource', label: 'Resource', sub: 'Delivery focus', color: '#d97706' },
  { id: 'sales', label: 'Sales', sub: 'Revenue & pipeline', color: '#2f5fd3' },
  { id: 'client', label: 'Client', sub: 'Portal access', color: '#6b7280' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [email, setEmail] = React.useState('priya@vyntrox.com');
  const [password, setPassword] = React.useState('password123');

  // Redirect if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = (roleId) => {
    const roleEmails = {
      admin: 'priya@vyntrox.com',
      manager: 'daniel@vyntrox.com',
      resource: 'aarav@vyntrox.com',
      sales: 'riley@vyntrox.com',
      client: 'mara@northwind.io'
    };
    setEmail(roleEmails[roleId] || 'priya@vyntrox.com');
    setPassword('password123');
    // Auto login after setting credentials
    setTimeout(() => {
      dispatch(loginUser({ email: roleEmails[roleId] || 'priya@vyntrox.com', password: 'password123' }));
    }, 100);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <Logo size={36}/>
        </div>
        <div className="login-form-wrap">
          <div className="login-eyebrow">Sign in to your workspace</div>
          <h1 className="login-title">Welcome back to Vyntrox CRM.</h1>
          <div className="login-sub">Manage clients, projects, support, and revenue — all in one place.</div>

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px 16px', 
              borderRadius: 8, 
              marginBottom: 16,
              fontSize: 14 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-row">
              <label>Work email</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="form-row">
              <label>Password <a className="link-inline">Forgot?</a></label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            <Button variant="primary" size="lg" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="login-or"><span>or continue with</span></div>

            <div className="sso-row">
              <button className="sso-btn" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3v2.6C4.7 19.7 8.1 22 12 22Z"/><path fill="#FBBC05" d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3a10 10 0 0 0 0 8.8l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.7 4.3 3 7.6l3.4 2.6c.8-2.3 3-4.3 5.6-4.3Z"/></svg>
                Google
              </button>
              <button className="sso-btn" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#0078D4"><path d="M11 11H2V2h9v9Zm0 11H2v-9h9v9ZM22 11h-9V2h9v9Zm0 11h-9v-9h9v9Z"/></svg>
                Microsoft
              </button>
              <button className="sso-btn" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4a4 4 0 0 1 4 4v3h1.5a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-6A2.5 2.5 0 0 1 6.5 11H8V8a4 4 0 0 1 4-4Zm2 7V8a2 2 0 1 0-4 0v3h4Z"/></svg>
                SSO / SAML
              </button>
            </div>
          </form>

          <div className="login-foot muted small">
            Don't have an account? <a className="link-inline">Talk to your admin.</a>
          </div>
        </div>

        <div className="login-demo">
          <div className="login-demo-title">Demo — sign in as any role</div>
          <div className="login-demo-grid">
            {ROLES.map(r => (
              <button key={r.id} className="demo-card" onClick={() => handleQuickLogin(r.id)} type="button">
                <span className="demo-card-dot" style={{ background: r.color }}/>
                <div className="demo-card-text">
                  <div className="demo-card-label">{r.label}</div>
                  <div className="demo-card-sub">{r.sub}</div>
                </div>
                <Ic.chevR width={12} height={12} className="muted"/>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-art">
          <div className="login-art-cards">
            <div className="art-card art-card-1">
              <div className="art-card-head">
                <span className="art-card-dot" style={{ background: '#dc2626' }}/>
                <span className="muted small">VT-2418 · Urgent</span>
              </div>
              <div className="art-card-title">Login throws 503 after SSO redirect</div>
              <div className="art-card-foot">
                <Avatar initials="TB" hue={12} size={20}/>
                <span className="muted small">In progress · 4h SLA left</span>
              </div>
            </div>
            <div className="art-card art-card-2">
              <div className="muted small">Pipeline · This quarter</div>
              <div className="art-card-big mono">$1.74M</div>
              <div className="art-card-trend">
                <Sparkline data={[1.1,1.2,1.3,1.4,1.5,1.6,1.74]} color="#65bb3c" width={120} height={28}/>
                <span className="tone-green small">+12.4%</span>
              </div>
            </div>
            <div className="art-card art-card-3">
              <div className="art-card-head">
                <span className="art-card-dot" style={{ background: '#65bb3c' }}/>
                <span>Northwind Portal v2</span>
              </div>
              <div className="art-card-bar"><ProgressBar value={68} tone="navy" height={6}/></div>
              <div className="art-card-foot art-card-foot-spread">
                <AvatarStack ids={['u1','u2','u4']} size={20}/>
                <span className="muted small">68% · due Jul 12</span>
              </div>
            </div>
            <div className="art-card art-card-4">
              <div className="art-card-head">
                <span className="art-card-dot" style={{ background: '#2f5fd3' }}/>
                <span className="muted small">Closing this month</span>
              </div>
              <div className="art-card-title-sm">Brightline — Loyalty platform</div>
              <div className="mono"><strong>$215k</strong> <span className="muted small">· 80% confidence</span></div>
            </div>
          </div>
        </div>
        <div className="login-quote">
          <div className="login-quote-text">"One workspace replaced our helpdesk, our deal tracker, and three spreadsheets. Onboarding new managers takes a morning, not a week."</div>
          <div className="login-quote-author">
            <Avatar initials="DO" hue={220} size={28}/>
            <div>
              <div>Daniel Okafor</div>
              <div className="muted small">Delivery Manager · Vyntrox</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Logo component
function Logo({ size = 36 }) {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #15348a, #2f5fd3)', 
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: size * 0.5
    }}>
      V
    </div>
  );
}

export default LoginPage;
