// Login / role-picker screen
import React from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('vyntrox_token', data.token);
      localStorage.setItem('vyntrox_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - Content (hidden on mobile) */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-1/2 flex-col justify-center items-center p-8 lg:p-12 text-white"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(47,95,211,0.10), transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(101,187,60,0.10), transparent 45%),
            linear-gradient(135deg, #0c1b4a 0%, #15348a 100%)
          `
        }}
      >
        <div className="max-w-md w-full space-y-6">
          {/* Art Card 1 */}
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-500">VT-2418 · Urgent</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">Login throws 503 after SSO redirect</p>
            <div className="flex items-center gap-2 mt-3">
              <Avatar initials="TB" hue={12} size={20}/>
              <span className="text-xs text-gray-400">In progress · 4h SLA left</span>
            </div>
          </div>
          
          {/* Art Card 2 */}
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <p className="text-xs text-gray-500 mb-1">Pipeline · This quarter</p>
            <p className="text-2xl font-bold text-gray-800">$1.74M</p>
            <div className="flex items-center gap-2 mt-2">
              <Sparkline data={[1.1,1.2,1.3,1.4,1.5,1.6,1.74]} color="#65bb3c" width={100} height={20}/>
              <span className="text-xs text-green-600">+12.4%</span>
            </div>
          </div>
          
          {/* Quote */}
          <div className="mt-8">
            <p className="text-base italic text-white/80 leading-relaxed">"One workspace replaced our helpdesk, our deal tracker, and three spreadsheets. Onboarding new managers takes a morning, not a week."</p>
            <div className="flex items-center gap-3 mt-4">
              <Avatar initials="DO" hue={220} size={28}/>
              <div>
                <p className="text-sm font-medium text-white">Daniel Okafor</p>
                <p className="text-xs text-white/60">Delivery Manager · Vyntrox</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="mb-8">
            <Logo size={40}/>
          </div>
          
          {/* Header */}
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Sign in to your workspace</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Welcome back to Vyntrox CRM.</h1>
          <p className="text-sm text-gray-500 mb-6">Manage clients, projects, support, and revenue — all in one place.</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <a href="#" className="text-blue-500 hover:underline">Forgot?</a>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            
            <Button variant="primary" size="lg" type="submit" loading={loading} disabled={loading} className="w-full py-3">
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">or continue with</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3v2.6C4.7 19.7 8.1 22 12 22Z"/><path fill="#FBBC05" d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3a10 10 0 0 0 0 8.8l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.1 2 4.7 4.3 3 7.6l3.4 2.6c.8-2.3 3-4.3 5.6-4.3Z"/></svg>
              <span className="text-sm text-gray-600">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#0078D4"><path d="M11 11H2V2h9v9Zm0 11H2v-9h9v9ZM22 11h-9V2h9v9Zm0 11h-9v-9h9v9Z"/></svg>
              <span className="text-sm text-gray-600">Microsoft</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4a4 4 0 0 1 4 4v3h1.5a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-6A2.5 2.5 0 0 1 6.5 11H8V8a4 4 0 0 1 4-4Zm2 7V8a2 2 0 1 0-4 0v3h4Z"/></svg>
              <span className="text-sm text-gray-600">SSO</span>
            </button>
          </div>

          {/* Demo Quick Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Login (Demo)</p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {Object.entries(CURRENT_USER).map(([role, user]) => {
                const roleLabel = ROLES.find(r => r.id === role)?.label || role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setEmail(user.email); setPassword('password123'); }}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-3"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ROLES.find(r => r.id === role)?.color || '#666' }}></span>
                    <span className="font-medium text-gray-700">{roleLabel}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-600 truncate">{user.name}</span>
                    <span className="ml-auto text-gray-400 bg-white px-2 py-0.5 rounded">{user.initials}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-blue-500 hover:underline">Talk to your admin.</a>
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
