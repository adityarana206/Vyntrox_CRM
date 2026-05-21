// Login screen with Redux + React Router
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';

function LoginScreenRedux({ onLogin }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      onLogin(user);
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, onLogin]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      onLogin(result.payload.user);
    }
  }

  // Demo users for quick login
  const demoUsers = [
    { role: 'admin', name: 'Priya Sharma', email: 'priya@vyntrox.com', initials: 'PS', color: '#15348a' },
    { role: 'manager', name: 'Daniel Okafor', email: 'daniel@vyntrox.com', initials: 'DO', color: '#2f5fd3' },
    { role: 'resource', name: 'Aarav Mehta', email: 'aarav@vyntrox.com', initials: 'AM', color: '#65bb3c' },
    { role: 'sales', name: 'Riley Chen', email: 'riley@vyntrox.com', initials: 'RC', color: '#d97706' },
    { role: 'client', name: 'Mara Lindqvist', email: 'mara@northwind.io', initials: 'ML', color: '#15348a' },
  ];

  const handleQuickLogin = (userData) => {
    setEmail(userData.email);
    setPassword('password123');
  };

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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-xs text-gray-500">Helio · Deal</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">$42k expansion — procurement approval</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
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
      <div className="w-full md:w-1/2 lg:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-8 md:px-12 lg:px-16 bg-white">
        <div className="max-w-sm mx-auto w-full space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">V</div>
            <span className="text-lg font-semibold text-gray-800">Vyntrox CRM</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Welcome back to Vyntrox CRM.</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to your workspace to continue.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</button>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick login (demo users)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                >
                  <Avatar initials={u.initials} hue={220} size={28}/>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SSO Options */}
          <div className="pt-4">
            <p className="text-xs text-gray-400 text-center mb-3">Or continue with</p>
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-xs">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span className="text-xs">Microsoft</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-xs">GitHub</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By continuing, you agree to our <a href="#" className="text-gray-600 hover:underline">Terms</a> and <a href="#" className="text-gray-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for Avatar
function Avatar({ initials, hue, size }) {
  const bgColor = `hsl(${hue}, 70%, 45%)`;
  return (
    <div 
      className="rounded-full flex items-center justify-center text-white font-semibold"
      style={{ 
        backgroundColor: bgColor, 
        width: size, 
        height: size,
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
}

// Assign to window for compatibility with existing app architecture
Object.assign(window, { LoginScreenRedux });

export default LoginScreenRedux;
