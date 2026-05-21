import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../components/shell';
import { ModalHost } from '../components/modals';
import { logoutUser } from '../store/slices/authSlice';

const MainLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const handleLogout = () => {
    // Clear localStorage first
    localStorage.removeItem('vyntrox_token');
    localStorage.removeItem('vyntrox_user');
    // Try to call logout API (fire and forget)
    dispatch(logoutUser());
    // Navigate to login with full page reload to clear all state
    window.location.href = '/login';
  };

  // Determine current route from URL
  const currentRoute = location.pathname.split('/')[1] || 'dashboard';

  const handleRouteChange = (routeId) => {
    const routeMap = {
      'dashboard': '/dashboard',
      'tickets': '/tickets',
      'projects': '/projects',
      'tasks': '/tasks',
      'resources': '/resources',
      'sales': '/sales',
      'settings': '/settings'
    };
    navigate(routeMap[routeId] || `/${routeId}`);
  };

  return (
    <div className="app">
      <Sidebar 
        role={user?.role} 
        route={currentRoute} 
        setRoute={handleRouteChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="app-main">
        <Topbar 
          role={user?.role}
          route={currentRoute}
          setRoute={handleRouteChange}
          search={search}
          setSearch={setSearch}
          authUser={{
            name: user?.name || 'User',
            title: user?.title || user?.role || 'Member',
            initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
          }}
          onLogout={() => {
            // Emergency logout - clear everything and redirect
            localStorage.removeItem('vyntrox_token');
            localStorage.removeItem('vyntrox_user');
            sessionStorage.clear();
            window.location.replace('/login');
          }}
        />
        <div className="app-scroll">
          <Outlet />
        </div>
      </div>
      <ModalHost user={user} />
    </div>
  );
};

export default MainLayout;
