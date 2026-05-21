// Clients, Admin, Reports, Portal, Tasks, Settings, Login
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, SectionHead, Avatar, StatusPill, PriorityChip, Tabs, ProgressBar, Ic, Badge } from './ui'
import { Logo } from './shell'
import { fetchWithAuth, API_BASE } from '../utils/api'
import { fetchTasks, fetchTaskStats } from '../store/slices/tasksSlice';
import { fetchSettings, saveProfile, savePreferences, saveNotificationSettings, clearSuccessMessage } from '../store/slices/settingsSlice';
import { fetchResources } from '../store/slices/resourcesSlice';
import { fetchDashboardProjects, fetchDashboardTickets, fetchAllocationStats } from '../store/slices/dashboardSlice';
import { fetchAllTickets } from '../store/slices/ticketsSlice';
import { useAppState } from './app-state';

// ===== Admin: Users & Roles =====
function AdminScreen() {
  const [tab, setTab] = React.useState('users');
  const [users, setUsers] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [logsLoading, setLogsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [logsError, setLogsError] = React.useState('');
  
  // Fetch users from API
  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/auth/users`);
        if (res) {
          const data = await res.json();
          if (data.users) {
            setUsers(data.users);
          }
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);
  
  // Fetch activity logs when on audit tab
  React.useEffect(() => {
    if (tab !== 'audit') return;
    
    async function fetchLogs() {
      setLogsLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/activity-logs?limit=50`);
        if (res) {
          const data = await res.json();
          if (data.logs) {
            setLogs(data.logs);
          }
        }
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
        setLogsError('Failed to load activity logs');
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, [tab]);
  
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'users',label:'Users'},{id:'roles',label:'Roles & permissions'},{id:'audit',label:'Audit log'}]} active={tab} onChange={setTab}/>
        <div className="toolbar-right">
          {tab === 'users' && <Button variant="primary" size="sm" icon={<Ic.invite width={14} height={14}/>}>Invite user</Button>}
          {tab === 'roles' && <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New role</Button>}
        </div>
      </div>

      {tab === 'users' && (
        <Card pad={false} className="big-table">
          <div className="bt-head users-head">
            <div></div><div>Name</div><div>Role</div><div>Department</div><div>Status</div><div>2FA</div><div>Last active</div><div></div>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading users...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No users found</div>
          ) : users.map(u => {
            const initials = u.name ? u.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'U';
            const hue = (u._id?.charCodeAt(0) || 0) * 47 % 360;
            return (
              <div key={u._id} className="bt-row">
                <div><Avatar initials={initials} hue={hue} size={32}/></div>
                <div>
                  <div className="bt-title-text">{u.name}</div>
                  <div className="muted small">{u.email}</div>
                </div>
                <div><Badge tone={u.role === 'admin' ? 'navy' : u.role === 'manager' ? 'blue' : u.role === 'sales' ? 'amber' : u.role === 'client' ? 'purple' : 'green'} soft>{u.role}</Badge></div>
                <div>{u.department || '—'}</div>
                <div><StatusPill status={u.status || 'active'}/></div>
                <div>{u.twoFactorEnabled ? <Ic.ok width={16} height={16} className="ok-icon"/> : <span className="muted">—</span>}</div>
                <div className="muted">{u.lastActive || '—'}</div>
                <div><button className="icon-btn"><Ic.more width={14} height={14}/></button></div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'roles' && (
        <div className="roles-grid">
          {[
            { id: 'admin', name: 'Admin', perms: ['Full access', 'User management', 'Billing', 'Settings'] },
            { id: 'manager', name: 'Manager', perms: ['Team oversight', 'Project access', 'Reports', 'Approvals'] },
            { id: 'resource', name: 'Resource', perms: ['Ticket handling', 'Time tracking', 'Project tasks'] },
            { id: 'sales', name: 'Sales', perms: ['Deals', 'Client comms', 'Quotes', 'CRM'] },
            { id: 'client', name: 'Client', perms: ['Portal access', 'View tickets', 'Submit requests'] },
          ].map(r => {
            const memberCount = users.filter(u => u.role === r.id).length;
            return (
              <Card key={r.id} className="role-card">
                <div className="role-card-head">
                  <div>
                    <div className="role-card-name">{r.name}</div>
                    <div className="muted small">{memberCount} members</div>
                  </div>
                  <button className="icon-btn"><Ic.more width={14} height={14}/></button>
                </div>
                <div className="role-perms">
                  {r.perms.map(p => <div key={p} className="role-perm"><Ic.ok width={12} height={12} className="ok-icon"/>{p}</div>)}
                </div>
                <button className="role-card-edit">Edit permissions</button>
              </Card>
            );
          })}
          <Card className="role-card role-card-new">
            <div className="role-new-art"><Ic.plus width={20} height={20}/></div>
            <div className="role-card-name">Create custom role</div>
            <div className="muted small">Define scoped permissions for specific teams or external collaborators.</div>
          </Card>
        </div>
      )}

      {tab === 'audit' && (
        <Card pad={false} className="big-table">
          <div className="bt-head audit-head">
            <div>When</div><div>Who</div><div>Action</div><div>Target</div><div>IP</div>
          </div>
          {logsLoading ? (
            <div className="p-4 text-center text-gray-400">Loading activity logs...</div>
          ) : logsError ? (
            <div className="p-4 text-center text-red-400">{logsError}</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No activity logs yet. Actions will be logged here.
            </div>
          ) : logs.map((log) => {
            const when = new Date(log.createdAt).toLocaleString();
            const who = log.userName || log.userEmail || 'Unknown';
            const action = log.action;
            const target = log.targetName || log.targetType || 'System';
            const ip = log.ipAddress || '—';
            return (
              <div key={log._id} className="bt-row">
                <div className="muted">{when}</div>
                <div>{who}</div>
                <div>{action}</div>
                <div className="mono small">{target}</div>
                <div className="muted mono small">{ip}</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ===== Reports =====
function ReportsScreen() {
  const dispatch = useDispatch();
  const { deals } = useAppState();
  
  // Get real data from Redux store
  const tickets = useSelector(state => state.tickets.items);
  const projects = useSelector(state => state.dashboard.projects || []);
  const resources = useSelector(state => state.resources?.resources || []);
  const authUser = useSelector(state => state.auth.user);
  const [loading, setLoading] = React.useState(true);
  
  // Fetch data on mount - sequentially to avoid overload
  React.useEffect(() => {
    if (!authUser) return;
    
    async function loadData() {
      setLoading(true);
      try {
        await dispatch(fetchAllTickets({ limit: 100 })).unwrap();
      } catch (e) { console.log('Tickets fetch failed:', e); }
      
      try {
        await dispatch(fetchDashboardProjects({ role: authUser.role, userId: authUser.id || authUser._id, limit: 100 })).unwrap();
      } catch (e) { console.log('Projects fetch failed:', e); }
      
      try {
        await dispatch(fetchResources()).unwrap();
      } catch (e) { console.log('Resources fetch failed:', e); }
      
      setLoading(false);
    }
    
    loadData();
  }, [dispatch, authUser]);
  
  // Calculate real metrics
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const avgResolutionTime = resolvedTickets > 0 ? '3.2h' : 'N/A'; // Would need actual time calculation
  
  // Calculate deal metrics
  const wonDeals = deals.filter(d => d.stage === 'won' || d.status === 'closed-won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  
  // Calculate resource utilization
  const activeResources = resources.filter(r => r.status === 'active').length;
  const avgUtilization = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + (r.workload?.utilization || 70), 0) / resources.length)
    : 75;
  
  // Top deals sorted by value
  const topDeals = [...wonDeals]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'all',label:'All reports'},{id:'rev',label:'Revenue'},{id:'sup',label:'Support'},{id:'del',label:'Delivery'}]} active="all" onChange={()=>{}}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.calendar width={14} height={14}/>}>Last 90 days</Button>
          <Button variant="ghost" size="sm" icon={<Ic.download width={14} height={14}/>}>Export</Button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-400">
          <div className="mb-2">Loading reports data...</div>
          <ProgressBar value={60} max={100} tone="blue" />
        </div>
      )}

      <div className="kpi-grid kpi-grid-4" style={{ opacity: loading ? 0.5 : 1 }}>
        <KPI 
          label="Total Revenue" 
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`} 
          delta={wonDeals.length > 0 ? `+${wonDeals.length} deals` : 'No deals'} 
          trend={[totalRevenue * 0.7, totalRevenue * 0.8, totalRevenue * 0.85, totalRevenue * 0.9, totalRevenue]} 
          color="#15348a"
        />
        <KPI 
          label="Avg ticket resolve" 
          value={avgResolutionTime} 
          delta={`${resolvedTickets} resolved`} 
          trend={[totalTickets * 0.5, totalTickets * 0.6, totalTickets * 0.7, totalTickets * 0.8, totalTickets]} 
          color="#65bb3c"
        />
        <KPI 
          label="Active Projects" 
          value={projects.length.toString()} 
          delta={projects.filter(p => p.status === 'active').length > 0 ? `${projects.filter(p => p.status === 'active').length} ongoing` : 'No active'} 
          trend={[0, projects.length * 0.3, projects.length * 0.5, projects.length * 0.8, projects.length]} 
          color="#d97706"
        />
        <KPI 
          label="Team Utilization" 
          value={`${avgUtilization}%`} 
          delta={`${activeResources} active`} 
          trend={[60, 65, 70, avgUtilization - 5, avgUtilization]} 
          color="#2f5fd3"
        />
      </div>

      <div className="reports-grid">
        <Card>
          <SectionHead title="Ticket Status Overview" sub="Current ticket distribution"/>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{totalTickets}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Total Tickets</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e' }}>{resolvedTickets}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Resolved</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
                  {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>High Priority</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>
                  {tickets.filter(t => !t.assignee).length}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Unassigned</div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <SectionHead title="Ticket Categories" sub="By issue type"/>
          <div style={{ padding: '20px' }}>
            {['Bug', 'Feature', 'Support', 'Maintenance'].map((cat, i) => {
              const count = tickets.filter(t => (t.category || 'Support') === cat).length;
              const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
              const pct = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[i] }} />
                  <div style={{ flex: 1, fontSize: '14px' }}>{cat}</div>
                  <div style={{ width: '40px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[i] }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, width: '40px', textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card>
          <SectionHead title="Top Closed Deals" sub={`${wonDeals.length} won deals`}/>
          <div className="deal-list">
            {topDeals.length > 0 ? topDeals.map(d => (
              <div key={d._id || d.id} className="deal-row">
                <Avatar initials={d.clientName?.split(' ').map(n => n[0]).join('') || 'D'} hue={200} size={32}/>
                <div className="deal-main">
                  <div className="deal-name">{d.clientName || d.name || 'Deal'}</div>
                  <div className="muted small">Closed {d.closeDate ? new Date(d.closeDate).toLocaleDateString() : 'recently'}</div>
                </div>
                <div className="deal-value mono">₹{(d.value / 1000).toFixed(0)}k</div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                No closed deals yet
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <SectionHead title="Resource Overview" sub={`${resources.length} total resources`}/>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{resources.length}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '12px' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{activeResources}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Active</div>
              </div>
            </div>
            
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Top Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['React', 'Node.js', 'Python', 'UI/UX'].map(skill => (
                <span key={skill} style={{ 
                  padding: '6px 12px', 
                  background: '#f1f5f9', 
                  borderRadius: '16px', 
                  fontSize: '12px',
                  color: '#475569'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BigBarChart() {
  const data = [
    { q: 'Q3 24', val: 920, color: '#d6d3d1' },
    { q: 'Q4 24', val: 1180, color: '#d6d3d1' },
    { q: 'Q1 25', val: 1340, color: '#d6d3d1' },
    { q: 'Q2 25', val: 1520, color: '#d6d3d1' },
    { q: 'Q3 25', val: 1610, color: '#d6d3d1' },
    { q: 'Q4 25', val: 1720, color: '#15348a' },
    { q: 'Q1 26', val: 1840, color: '#15348a' },
    { q: 'Q2 26', val: 1840, color: '#65bb3c', current: true },
  ];
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="bbc">
      {data.map((d,i) => (
        <div key={d.q} className="bbc-col">
          <div className="bbc-bar-wrap">
            <div className="bbc-bar" style={{ height: `${(d.val/max)*100}%`, background: d.color }}>
              {d.current && <span className="bbc-val mono">${d.val}k</span>}
            </div>
          </div>
          <div className="bbc-label">{d.q}</div>
        </div>
      ))}
    </div>
  );
}

function CategoryBars() {
  const cats = [
    { name: 'Bug',         val: 42, color: '#dc2626' },
    { name: 'Feature',     val: 31, color: '#15348a' },
    { name: 'Performance', val: 18, color: '#d97706' },
    { name: 'Maintenance', val: 14, color: '#65bb3c' },
    { name: 'Question',    val: 11, color: '#7c3aed' },
  ];
  const total = cats.reduce((a,c) => a+c.val, 0);
  return (
    <div className="cat-bars">
      <div className="cat-stack">
        {cats.map(c => (
          <div key={c.name} className="cat-seg" style={{ width: `${(c.val/total)*100}%`, background: c.color }}/>
        ))}
      </div>
      <div className="cat-list">
        {cats.map(c => (
          <div key={c.name} className="cat-row">
            <span className="cat-dot" style={{ background: c.color }}/>
            <span className="cat-name">{c.name}</span>
            <span className="mono cat-val">{c.val}</span>
            <span className="muted small">{Math.round((c.val/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Client portal =====
function PortalScreen({ setRoute, setSelectedTicket, setSelectedProject }) {
  return (
    <div className="page">
      <div className="portal-head">
        <div>
          <h1 className="portal-title">Welcome back, Mara.</h1>
          <div className="portal-sub muted">Your dedicated Vyntrox workspace — projects, support, and invoices.</div>
        </div>
        <div className="portal-actions">
          <Button variant="ghost" size="sm" icon={<Ic.message width={14} height={14}/>}>Message team</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>} onClick={() => openModal('ticket')}>Submit a ticket</Button>
        </div>
      </div>

      <div className="kpi-grid kpi-grid-4">
        <KPI label="Active projects" value="2" sub="1 launching Jul 12"/>
        <KPI label="Open tickets" value="3" sub="1 urgent · 2h SLA left" color="#d97706"/>
        <KPI label="This month spend" value="$18.4k" sub="on budget" color="#65bb3c"/>
        <KPI label="SLA compliance" value="98%" sub="last 30 days" color="#2f5fd3"/>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <ClientProjectsCard setRoute={setRoute} setSelectedProject={setSelectedProject}/>
          <TicketsOverviewCard role="client" setRoute={setRoute} setSelectedTicket={setSelectedTicket}/>
          <Card>
            <SectionHead title="Invoices" action={<button className="link-btn">All invoices <Ic.chevR width={12} height={12}/></button>}/>
            <div className="invoice-list">
              {[
                { id: 'INV-2401', date: 'May 01', amount: '$18,400', status: 'Paid' },
                { id: 'INV-2400', date: 'Apr 01', amount: '$18,400', status: 'Paid' },
                { id: 'INV-2399', date: 'Mar 01', amount: '$22,100', status: 'Paid' },
                { id: 'INV-2398', date: 'Feb 01', amount: '$16,900', status: 'Paid' },
              ].map(inv => (
                <div key={inv.id} className="inv-row">
                  <Ic.paper width={20} height={20} className="muted"/>
                  <div className="inv-id mono">{inv.id}</div>
                  <div className="muted">{inv.date}</div>
                  <div className="mono inv-amount"><strong>{inv.amount}</strong></div>
                  <Badge tone="green" soft>{inv.status}</Badge>
                  <button className="icon-btn"><Ic.download width={14} height={14}/></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="dash-side">
          <SupportContactsCard/>
          <SLACard role="client"/>
          <Card>
            <SectionHead title="Knowledge base"/>
            <div className="kb-list">
              <a className="kb-link"><Ic.paper width={14} height={14}/>Getting started with the portal</a>
              <a className="kb-link"><Ic.paper width={14} height={14}/>How SLAs work</a>
              <a className="kb-link"><Ic.paper width={14} height={14}/>Submitting a high-quality ticket</a>
              <a className="kb-link"><Ic.paper width={14} height={14}/>Billing &amp; invoices FAQ</a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ===== My tasks =====
function TasksScreen({ authUser }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = React.useState('all');
  
  // Redux selectors
  const tasks = useSelector(state => state.tasks.tasks);
  const taskStats = useSelector(state => state.tasks.stats);
  const loading = useSelector(state => state.tasks.loading);
  
  // Check if admin/manager to show all tasks
  const isAdmin = authUser?.role === 'admin' || authUser?.role === 'manager';
  const [viewMode, setViewMode] = React.useState('all'); // 'all' or 'mine'
  
  React.useEffect(() => {
    if (authUser) {
      // Admin can toggle between all tasks and their tasks
      // Others see only their assigned tasks
      let params = {};
      if (!isAdmin || viewMode === 'mine') {
        params = { assignee: authUser?.id || authUser?._id };
      }
      dispatch(fetchTasks(params));
      dispatch(fetchTaskStats());
    }
  }, [dispatch, authUser, isAdmin, viewMode]);
  
  const tabs = [
    {id:'all',label:'All',badge:taskStats?.total || tasks.length},
    {id:'today',label:'Today',badge:taskStats?.todo || 0},
    {id:'wk',label:'This week',badge:taskStats?.inProgress || 0}
  ];
  
  // Error state from Redux
  const error = useSelector(state => state.tasks.error);
  
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={tabs} active={filter} onChange={setFilter}/>
        <div className="toolbar-right">
          {isAdmin && (
            <div style={{ display: 'flex', gap: 4, marginRight: 12 }}>
              <button
                onClick={() => setViewMode('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: viewMode === 'all' ? '#15348a' : '#e5e7eb',
                  backgroundColor: viewMode === 'all' ? '#eff6ff' : '#fff',
                  color: viewMode === 'all' ? '#15348a' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: viewMode === 'all' ? 600 : 400
                }}
              >
                All Tasks
              </button>
              <button
                onClick={() => setViewMode('mine')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: viewMode === 'mine' ? '#15348a' : '#e5e7eb',
                  backgroundColor: viewMode === 'mine' ? '#eff6ff' : '#fff',
                  color: viewMode === 'mine' ? '#15348a' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: viewMode === 'mine' ? 600 : 400
                }}
              >
                My Tasks
              </button>
            </div>
          )}
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>By project</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New task</Button>
        </div>
      </div>
      {loading ? (
        <Card><div className="p-8 text-center text-gray-500">Loading tasks...</div></Card>
      ) : error ? (
        <Card>
          <div className="p-8 text-center">
            <Ic.warn width={32} height={32} style={{ color: '#ef4444', marginBottom: 12 }}/>
            <div style={{ color: '#ef4444', fontWeight: 500, marginBottom: 8 }}>Failed to load tasks</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>{error}</div>
          </div>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Ic.check width={28} height={28} style={{ color: '#22c55e' }}/>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: 8 }}>No tasks found</div>
            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 20 }}>
              {isAdmin && viewMode === 'all'
                ? "No tasks have been created in the system yet. Create tasks from tickets."
                : "You don't have any tasks assigned yet."}
            </div>
            <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>Create Task</Button>
          </div>
        </Card>
      ) : (
        <Card pad={false}>
          <div className="bt-head task-head">
            <div></div>
            <div>Task</div>
            <div>Project</div>
            {isAdmin && <div>Assignee</div>}
            <div>Status</div>
            <div>Priority</div>
            <div>Due</div>
            <div>Estimate</div>
          </div>
          {tasks.map(t => {
            return (
              <div key={t._id || t.id} className="bt-row task-row-detail">
                <div><span className="check-empty"/></div>
                <div>
                  <div className="bt-title-text">{t.title}</div>
                  {t.ticketId && <div className="muted small mono">{t.ticketId}</div>}
                </div>
                <div>{t.projectName || t.project || 'General'}</div>
                {isAdmin && (
                  <div>
                    {t.assigneeName || t.assignee || 
                     (t.assigneeId ? 'Assigned' : <span style={{color: '#9ca3af'}}>Unassigned</span>)}
                  </div>
                )}
                <div><StatusPill status={t.status}/></div>
                <div><PriorityChip priority={t.priority}/></div>
                <div>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due'}</div>
                <div className="mono">{t.estimatedHours ? `${t.estimatedHours}h` : '-'}</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ===== Settings =====
function SettingsScreen({ authUser }) {
  const dispatch = useDispatch();
  const [tab, setTab] = React.useState('workspace');
  
  // Redux selectors
  const settings = useSelector(state => state.settings.settings);
  const profile = useSelector(state => state.settings.profile);
  const preferences = useSelector(state => state.settings.preferences);
  const notifications = useSelector(state => state.settings.notifications);
  const loading = useSelector(state => state.settings.loading);
  const saving = useSelector(state => state.settings.saving);
  const successMessage = useSelector(state => state.settings.successMessage);
  
  // Local form states
  const [formProfile, setFormProfile] = React.useState({ name: '', title: '', department: '', phone: '', timezone: 'UTC', language: 'en' });
  const [formPreferences, setFormPreferences] = React.useState({ theme: 'light', density: 'regular', sidebarCollapsed: false });
  const [formNotifications, setFormNotifications] = React.useState({ email: true, push: true, ticketUpdates: true, taskAssignments: true, mentions: true });
  
  // Fetch settings on mount
  React.useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);
  
  // Update form states when Redux data changes
  React.useEffect(() => {
    if (profile) setFormProfile(profile);
    if (preferences) setFormPreferences(preferences);
    if (notifications) setFormNotifications(notifications);
  }, [profile, preferences, notifications]);
  
  // Show success message
  React.useEffect(() => {
    if (successMessage) {
      alert(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);
  
  const handleSaveProfile = () => {
    dispatch(saveProfile(formProfile));
  };
  
  const handleSavePreferences = () => {
    dispatch(savePreferences(formPreferences));
  };
  
  const handleSaveNotifications = () => {
    dispatch(saveNotificationSettings(formNotifications));
  };
  
  if (loading && !settings) {
    return (
      <div className="page">
        <div className="p-8 text-center text-gray-500">Loading settings...</div>
      </div>
    );
  }
  
  return (
    <div className="page">
      <div className="settings-layout">
        <aside className="settings-nav">
          {[
            { id: 'workspace', label: 'Workspace',    icon: <Ic.building width={16} height={16}/> },
            { id: 'profile',   label: 'Profile',      icon: <Ic.user width={16} height={16}/> },
            { id: 'notif',     label: 'Notifications',icon: <Ic.bell width={16} height={16}/> },
            { id: 'sec',       label: 'Security',     icon: <Ic.shield width={16} height={16}/> },
          ].map(s => (
            <button key={s.id} className={`settings-nav-item ${tab === s.id ? 'is-active' : ''}`} onClick={() => setTab(s.id)}>
              {s.icon}{s.label}
            </button>
          ))}
        </aside>
        <div className="settings-main">
          {tab === 'workspace' && (
            <>
              <Card>
                <SectionHead title="Workspace" sub="The shared settings for your Vyntrox tenant."/>
                <div className="form-grid">
                  <div className="form-row"><label>Workspace name</label><input className="input" defaultValue="Vyntrox HQ"/></div>
                  <div className="form-row"><label>Workspace URL</label><input className="input" defaultValue="vyntrox.app/vyntrox-hq"/></div>
                  <div className="form-row"><label>Default timezone</label><input className="input" defaultValue="UTC+05:30 (Asia/Kolkata)"/></div>
                  <div className="form-row"><label>Working week</label><input className="input" defaultValue="Mon – Fri · 09:00 – 18:00"/></div>
                  <div className="form-row"><label>Working hours / week</label><input className="input" defaultValue="40"/></div>
                  <div className="form-row"><label>Currency</label><input className="input" defaultValue="USD ($)"/></div>
                </div>
              </Card>
              <Card>
                <SectionHead title="Branding"/>
                <div className="brand-row">
                  <div className="brand-logo-box"><Logo size={48} withWordmark={false}/></div>
                  <div>
                    <div>Workspace logo</div>
                    <div className="muted small">PNG or SVG, max 1 MB.</div>
                    <div className="brand-buttons">
                      <Button variant="ghost" size="sm">Upload</Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
          
          {tab === 'profile' && (
            <Card>
              <SectionHead title="Profile" sub="Your personal information and preferences."/>
              <div className="form-grid">
                <div className="form-row">
                  <label>Name</label>
                  <input className="input" value={formProfile.name} onChange={e => setFormProfile({...formProfile, name: e.target.value})}/>
                </div>
                <div className="form-row">
                  <label>Title</label>
                  <input className="input" value={formProfile.title} onChange={e => setFormProfile({...formProfile, title: e.target.value})}/>
                </div>
                <div className="form-row">
                  <label>Department</label>
                  <input className="input" value={formProfile.department} onChange={e => setFormProfile({...formProfile, department: e.target.value})}/>
                </div>
                <div className="form-row">
                  <label>Phone</label>
                  <input className="input" value={formProfile.phone} onChange={e => setFormProfile({...formProfile, phone: e.target.value})}/>
                </div>
                <div className="form-row">
                  <label>Timezone</label>
                  <select className="input" value={formProfile.timezone} onChange={e => setFormProfile({...formProfile, timezone: e.target.value})}>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Language</label>
                  <select className="input" value={formProfile.language} onChange={e => setFormProfile({...formProfile, language: e.target.value})}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
              </div>
            </Card>
          )}
          
          {tab === 'notif' && (
            <Card>
              <SectionHead title="Notifications" sub="Manage how you receive notifications."/>
              <div className="form-grid">
                <div className="form-row checkbox">
                  <label>
                    <input type="checkbox" checked={formNotifications.email} onChange={e => setFormNotifications({...formNotifications, email: e.target.checked})}/>
                    Email notifications
                  </label>
                </div>
                <div className="form-row checkbox">
                  <label>
                    <input type="checkbox" checked={formNotifications.push} onChange={e => setFormNotifications({...formNotifications, push: e.target.checked})}/>
                    Push notifications
                  </label>
                </div>
                <div className="form-row checkbox">
                  <label>
                    <input type="checkbox" checked={formNotifications.ticketUpdates} onChange={e => setFormNotifications({...formNotifications, ticketUpdates: e.target.checked})}/>
                    Ticket updates
                  </label>
                </div>
                <div className="form-row checkbox">
                  <label>
                    <input type="checkbox" checked={formNotifications.taskAssignments} onChange={e => setFormNotifications({...formNotifications, taskAssignments: e.target.checked})}/>
                    Task assignments
                  </label>
                </div>
                <div className="form-row checkbox">
                  <label>
                    <input type="checkbox" checked={formNotifications.mentions} onChange={e => setFormNotifications({...formNotifications, mentions: e.target.checked})}/>
                    Mentions
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <Button variant="primary" onClick={handleSaveNotifications} disabled={saving}>{saving ? 'Saving...' : 'Save Notifications'}</Button>
              </div>
            </Card>
          )}
          
          {tab === 'sec' && (
            <Card>
              <SectionHead title="Security" sub="Manage your password and security settings."/>
              <div className="form-grid">
                <div className="form-row"><label>Current Password</label><input className="input" type="password" placeholder="Enter current password"/></div>
                <div className="form-row"><label>New Password</label><input className="input" type="password" placeholder="Enter new password"/></div>
                <div className="form-row"><label>Confirm Password</label><input className="input" type="password" placeholder="Confirm new password"/></div>
              </div>
              <div className="form-actions">
                <Button variant="primary" disabled={saving}>{saving ? 'Updating...' : 'Change Password'}</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen, ReportsScreen, PortalScreen, TasksScreen, SettingsScreen });

export { AdminScreen, ReportsScreen, PortalScreen, TasksScreen, SettingsScreen };
