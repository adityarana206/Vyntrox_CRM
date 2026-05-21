import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Redirect if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  // Demo users for quick login
  const demoUsers = [
    { role: 'admin', name: 'Priya Sharma', email: 'priya@vyntrox.com', initials: 'PS' },
    { role: 'manager', name: 'Daniel Okafor', email: 'daniel@vyntrox.com', initials: 'DO' },
    { role: 'resource', name: 'Aarav Mehta', email: 'aarav@vyntrox.com', initials: 'AM' },
    { role: 'sales', name: 'Riley Chen', email: 'riley@vyntrox.com', initials: 'RC' },
    { role: 'client', name: 'Mara Lindqvist', email: 'mara@northwind.io', initials: 'ML' },
  ];

  const handleQuickLogin = (userData) => {
    setEmail(userData.email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - Content */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8 lg:p-12 text-white"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(47,95,211,0.10), transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(101,187,60,0.10), transparent 45%),
            linear-gradient(135deg, #0c1b4a 0%, #15348a 100%)
          `
        }}
      >
        <div className="max-w-md w-full space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-500">VT-2418 · Urgent</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">Login throws 503 after SSO redirect</p>
          </div>
          
          <div className="mt-8">
            <p className="text-base italic text-white/80">"One workspace replaced our helpdesk, our deal tracker, and three spreadsheets."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">DO</div>
              <div>
                <p className="text-sm font-medium text-white">Daniel Okafor</p>
                <p className="text-xs text-white/60">Delivery Manager · Vyntrox</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-8 md:px-12 lg:px-16 bg-white">
        <div className="max-w-sm mx-auto w-full space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">V</div>
            <span className="text-lg font-semibold text-gray-800">{import.meta.env.VITE_APP_NAME || 'Vyntrox CRM'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Welcome back</h1>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick login (demo users)</p>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">{u.initials}</div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{u.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
