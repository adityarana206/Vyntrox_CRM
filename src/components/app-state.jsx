// AppState: shared mutable state for tickets, deals, and allocations.
// Fetches real data from API; create + move ops live here so any screen can call them.
import React from 'react'
import { fetchWithAuth, API_BASE } from '../utils/api'

const AppStateContext = React.createContext(null);
function useAppState() { return React.useContext(AppStateContext); }

function makeId(prefix, list) {
  // For tickets, find max numeric suffix
  if (prefix === 'VT-') {
    const max = list.reduce((m, t) => Math.max(m, parseInt(t.id.replace('VT-',''), 10) || 0), 0);
    return 'VT-' + (max + 1);
  }
  if (prefix === 'd') {
    const max = list.reduce((m, t) => Math.max(m, parseInt(t.id.slice(1), 10) || 0), 0);
    return 'd' + (max + 1);
  }
  return prefix + (Date.now() % 100000);
}

// Generate empty initial allocations
function initialAllocations() {
  return {};
}

function AppStateProvider({ children }) {
  const [tickets, setTickets] = React.useState([]);
  const [deals, setDeals] = React.useState([]);
  const [allocations, setAllocations] = React.useState(initialAllocations);
  
  // Fetch real tickets from API on mount (only if authenticated)
  React.useEffect(() => {
    const token = localStorage.getItem('vyntrox_token');
    if (!token) return; // Don't fetch if not logged in
    
    async function fetchTickets() {
      try {
        const res = await fetchWithAuth(`${API_BASE}/tickets`);
        if (res) {
          const data = await res.json();
          if (data.tickets) {
            setTickets(data.tickets);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      }
    }
    fetchTickets();
  }, []);

  const addTicket = React.useCallback((t) => {
    setTickets(prev => {
      const id = makeId('VT-', prev);
      const next = {
        id,
        title: t.title,
        client: t.clientName || '—',
        clientId: t.client,
        project: t.project,
        priority: t.priority,
        status: 'Open',
        assignee: t.assignee || null,
        reporter: t.reporter || 'System',
        opened: 'just now',
        sla: t.priority === 'Urgent' ? '4h left' : t.priority === 'High' ? '1d left' : '3d left',
        category: t.category,
        comments: 0,
      };
      toast({ title: `Created ${id}`, body: t.title, tone: 'green' });
      return [next, ...prev];
    });
  }, []);

  // API version for client users
  const apiAddTicket = React.useCallback(async (ticketData, userEmail) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/client/tickets`, {
        method: 'POST',
        body: {
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority?.toLowerCase() || 'medium',
          category: ticketData.category || 'Support',
          clientId: userEmail,
          clientName: userEmail,
          projectId: ticketData.project,
        },
      });
      
      if (!res) return; // 401 handled by fetchWithAuth
      
      const data = await res.json();
      
      // Check if response was successful (2xx status)
      if (res.ok && data) {
        toast({ title: 'Ticket created', body: ticketData.title, tone: 'green' });
        return data.ticket;
      } else {
        throw new Error(data?.message || `Failed to create ticket: ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      toast({ title: 'Error', body: err.message || 'Failed to create ticket', tone: 'red' });
      throw err;
    }
  }, []);

  const addDeal = React.useCallback((d) => {
    setDeals(prev => {
      const id = makeId('d', prev);
      const initials = d.company.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('') || 'XX';
      const next = {
        id,
        name: d.name,
        company: d.company,
        value: d.value,
        stage: d.stage,
        owner: 'sales',
        confidence: d.confidence,
        closeBy: d.closeBy || '—',
        updated: 'just now',
        initials,
        source: d.source,
        contact: '—',
      };
      toast({ title: `New deal added`, body: `${d.company} · $${(d.value/1000).toFixed(0)}k`, tone: 'green' });
      return [next, ...prev];
    });
  }, []);

  const moveDeal = React.useCallback((dealId, toStage) => {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      if (d.stage === toStage) return d;
      const stage = DEAL_STAGES.find(s => s.id === toStage);
      toast({ title: `Moved to ${stage.label}`, body: d.name, tone: 'green' });
      const newConfidence = toStage === 'won' ? 100 : toStage === 'negotiation' ? Math.max(d.confidence, 75) : toStage === 'sow' ? Math.max(d.confidence, 60) : d.confidence;
      return { ...d, stage: toStage, confidence: newConfidence, updated: 'just now' };
    }));
  }, []);

  const moveAllocation = React.useCallback((chipId, fromPerson, fromDay, toPerson, toDay) => {
    setAllocations(prev => {
      if (fromPerson === toPerson && fromDay === toDay) return prev;
      const next = { ...prev };
      next[fromPerson] = next[fromPerson].map(d => [...d]);
      if (toPerson !== fromPerson) next[toPerson] = next[toPerson].map(d => [...d]);
      const chip = next[fromPerson][fromDay].find(c => c.id === chipId);
      if (!chip) return prev;
      next[fromPerson][fromDay] = next[fromPerson][fromDay].filter(c => c.id !== chipId);
      next[toPerson][toDay] = [...next[toPerson][toDay], chip];
      return next;
    });
  }, []);

  const value = {
    tickets, addTicket, apiAddTicket,
    deals, addDeal, moveDeal,
    allocations, moveAllocation,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

Object.assign(window, { AppStateContext, AppStateProvider, useAppState });

export { AppStateContext, AppStateProvider, useAppState };
