import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import TicketsScreen from '../components/tickets';

const TicketsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const [selectedTicket, setSelectedTicket] = React.useState(ticketId || null);

  // Sync selectedTicket with URL param when it changes
  React.useEffect(() => {
    setSelectedTicket(ticketId || null);
  }, [ticketId]);

  const handleSelectTicket = (id) => {
    setSelectedTicket(id);
    if (id) {
      navigate(`/tickets/${id}`);
    } else {
      navigate('/tickets');
    }
  };

  return (
    <TicketsScreen 
      role={user?.role}
      selectedTicket={selectedTicket}
      setSelectedTicket={handleSelectTicket}
      authUser={user}
    />
  );
};

export default TicketsPage;
