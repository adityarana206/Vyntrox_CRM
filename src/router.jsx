import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginScreenRedux from './components/login-redux';
import Dashboard from './components/dashboard';
import TicketsScreen from './components/tickets';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Public route wrapper (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRouter({ onLogin, setRoute, setSelectedTicket, setSelectedProject }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginScreenRedux onLogin={onLogin} />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard 
              role={user?.role || 'client'} 
              setRoute={setRoute}
              setSelectedTicket={setSelectedTicket}
              setSelectedProject={setSelectedProject}
              authUser={user}
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tickets" 
        element={
          <ProtectedRoute>
            <TicketsScreen 
              role={user?.role || 'client'}
              authUser={user}
            />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* 404 */}
      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default AppRouter;
