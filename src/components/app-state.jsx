// AppState: shared mutable state for tickets, deals, and allocations.
// Initial values come from data.jsx; create + move ops live here so any screen can call them.
import React from 'react'

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

// Generate initial allocations once (was random in resources.jsx; now seeded + persisted in state)
function initialAllocations() {
  const projectTones = { p1:'#15348a', p2:'#d97706', p3:'#65bb3c', p4:'#7c3aed', p5:'#2f5fd3' };
  const projs = Object.keys(projectTones);
  const all = {};
  TEAM.forEach(person => {
    all[person.id] = [[],[],[],[],[]]; // 5 days
    for (let di = 0; di < 5; di++) {
      const seed = (person.id.charCodeAt(1) * 31 + di * 7) % 100;
      const chips = [];
      if (seed % 7 < 5) chips.push({ id: `${person.id}-${di}-a`, projectId: projs[(seed) % projs.length], hours: 4 + (seed % 3) });
      if (seed % 5 < 3) chips.push({ id: `${person.id}-${di}-b`, projectId: projs[(seed+2) % projs.length], hours: 2 + (seed % 3) });
      if (seed % 11 < 2) chips.push({ id: `${person.id}-${di}-pto`, projectId: 'pto', hours: 8, label: 'PTO' });
      all[person.id][di] = chips;
    }
  });
  return all;
}

function AppStateProvider({ children }) {
  const [tickets, setTickets] = React.useState(TICKETS);
  const [deals, setDeals] = React.useState(DEALS);
  const [allocations, setAllocations] = React.useState(initialAllocations);

  const addTicket = React.useCallback((t) => {
    setTickets(prev => {
      const id = makeId('VT-', prev);
      const client = CLIENTS.find(c => c.id === t.client);
      const next = {
        id,
        title: t.title,
        client: client?.name || '—',
        clientId: t.client,
        project: t.project,
        priority: t.priority,
        status: 'Open',
        assignee: t.assignee || 'u1',
        reporter: CURRENT_USER.admin.name,
        opened: 'just now',
        sla: t.priority === 'Urgent' ? '4h left' : t.priority === 'High' ? '1d left' : '3d left',
        category: t.category,
        comments: 0,
      };
      toast({ title: `Created ${id}`, body: t.title, tone: 'green' });
      return [next, ...prev];
    });
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
    tickets, addTicket,
    deals, addDeal, moveDeal,
    allocations, moveAllocation,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

Object.assign(window, { AppStateContext, AppStateProvider, useAppState });
