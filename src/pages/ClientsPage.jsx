import React from 'react';
import { useSelector } from 'react-redux';
import ClientsScreen from '../components/clients';

const ClientsPage = () => {
  const { user } = useSelector((state) => state.auth);

  return <ClientsScreen role={user?.role} authUser={user} />;
};

export default ClientsPage;
