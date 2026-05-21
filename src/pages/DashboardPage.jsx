import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const handleRouteChange = (route) => {
    navigate(`/${route}`);
  };

  return (
    <Dashboard 
      role={user?.role || 'client'}
      setRoute={handleRouteChange}
      authUser={user}
    />
  );
};

export default DashboardPage;
