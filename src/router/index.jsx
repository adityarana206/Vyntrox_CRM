import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import { MainLayout, AuthLayout } from '../layouts';

// Pages
import {
  LoginPage,
  DashboardPage,
  TicketsPage,
  ProjectsPage,
  ClientsPage,
  TasksPage,
  SalesPage,
  ResourcesPage,
  ReportsPage,
  AdminPage,
  SettingsPage,
  PortalPage,
  NotFoundPage
} from '../pages';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

// Role-based Route Component
const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard - All roles */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Tickets - All roles */}
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:ticketId" element={<TicketsPage />} />
          
          {/* Projects - All roles */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          
          {/* Clients - Admin, Manager only */}
          <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/clients" element={<ClientsPage />} />
          </Route>
          
          {/* Tasks - Admin, Manager, Resource */}
          <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'resource']} />}>
            <Route path="/tasks" element={<TasksPage />} />
          </Route>
          
          {/* Sales - Admin, Manager, Sales */}
          <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'sales']} />}>
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/deals" element={<SalesPage />} />
          </Route>
          
          {/* Resources - Admin, Manager */}
          <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/team" element={<ResourcesPage />} />
          </Route>
          
          {/* Reports - Admin, Manager, Sales */}
          <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'sales']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          
          {/* Admin - Admin only */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          
          {/* Settings - All roles */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<SettingsPage />} />
          
          {/* Client Portal */}
          <Route path="/portal" element={<PortalPage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
