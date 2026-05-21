// Projects list + detail
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useAppState } from './app-state'
import { Button, Card, SectionHead, Tabs, ProgressBar, Badge, Avatar, Ic, AvatarStack, StatusPill } from './ui'
import { fetchWithAuth, API_BASE } from '../utils/api';
import { fetchDashboardProjects } from '../store/slices/dashboardSlice';
import { fetchClientProjects } from '../store/slices/projectsSlice';
// Note: All data now comes from API, no dummy data imports

function ProjectsScreen({ role, selectedProject, setSelectedProject, authUser }) {
  const dispatch = useDispatch();
  const [view, setView] = React.useState('grid');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [newProjectDescription, setNewProjectDescription] = React.useState('');
  const [selectedClient, setSelectedClient] = React.useState('');
  const [newProjectDueDate, setNewProjectDueDate] = React.useState('');
  const [newProjectBudget, setNewProjectBudget] = React.useState('');
  const [clients, setClients] = React.useState([]);
  const [creating, setCreating] = React.useState(false);

  // Fetch clients when create modal opens (for admin/manager)
  React.useEffect(() => {
    if (showCreateModal && role !== 'client') {
      async function fetchClients() {
        try {
          const res = await fetchWithAuth(`${API_BASE}/auth/users?role=client`);
          if (!res) return;
          const data = await res.json();
          if (data.users) {
            setClients(data.users);
          }
        } catch (err) {
          console.error('Failed to fetch clients:', err);
        }
      }
      fetchClients();
    }
  }, [showCreateModal, role]);

  // Redux selectors
  const dashboardProjects = useSelector(state => state.dashboard.projects);
  const clientProjects = useSelector(state => state.projects.items);
  const loading = useSelector(state => state.dashboard.loading || state.projects.loading);

  // Fetch projects via Redux
  React.useEffect(() => {
    if (!authUser) return;
    
    if (role === 'client') {
      dispatch(fetchClientProjects({ clientId: authUser.email }));
    } else {
      dispatch(fetchDashboardProjects({ 
        role, 
        userId: authUser.id || authUser._id,
        limit: 20 
      }));
    }
  }, [dispatch, role, authUser]);

  // Listen for projects-updated event to refresh list
  React.useEffect(() => {
    const handleProjectsUpdated = () => {
      if (role === 'client') {
        dispatch(fetchClientProjects({ clientId: authUser.email }));
      } else {
        dispatch(fetchDashboardProjects({ 
          role, 
          userId: authUser.id || authUser._id,
          limit: 20 
        }));
      }
    };
    window.addEventListener('projects-updated', handleProjectsUpdated);
    return () => window.removeEventListener('projects-updated', handleProjectsUpdated);
  }, [dispatch, role, authUser]);

  // Use Redux projects - no dummy data fallback
  const projects = role === 'client' ? (clientProjects || []) : (dashboardProjects || [])
  const [singleProject, setSingleProject] = React.useState(null);
  const [singleProjectLoading, setSingleProjectLoading] = React.useState(false);

  // Fetch single project if selected but not found in local projects
  React.useEffect(() => {
    if (selectedProject && role === 'client' && authUser && !loading) {
      const found = projects.find(p => p.id === selectedProject || p._id === selectedProject);
      if (!found && !singleProject && !singleProjectLoading) {
        setSingleProjectLoading(true);
        async function fetchSingleProject() {
          try {
            const res = await fetchWithAuth(`${API_BASE}/client/projects/${selectedProject}`);
            if (!res) return; // 401 handled
            const data = await res.json();
            if (data.project) {
              setSingleProject(data.project);
            }
          } catch (err) {
            console.error('Failed to fetch single project:', err);
          } finally {
            setSingleProjectLoading(false);
          }
        }
        fetchSingleProject();
      }
    }
  }, [selectedProject, role, authUser, projects, loading, singleProject, singleProjectLoading]);

  if (selectedProject) {
    const p = projects.find(p => p.id === selectedProject || p._id === selectedProject) || singleProject;
    if (p) return <ProjectDetail project={p} role={role} onBack={() => setSelectedProject(null)}/>;
    // Show loading while either the projects list or single project is loading
    if (loading || singleProjectLoading) return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading project...</div>
        </div>
      </div>
    );
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <div className="text-gray-500">Project not found</div>
          <Button variant="secondary" onClick={() => setSelectedProject(null)}>Back to projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'grid',label:'Grid'},{id:'list',label:'List'}]} active={view} onChange={setView}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>Status: all</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>} onClick={() => setShowCreateModal(true)}>New project</Button>
        </div>
      </div>

      {loading && role === 'client' ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '18px' }}>No projects yet</h3>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Create your first project to get started</p>
        </div>
      ) : view === 'grid' ? (
        <div className="projects-grid">
          {projects.map(p => {
            const projectId = p._id || p.id;
            const clientName = p.clientName || p.client;
            const projectName = p.name || p.projectName;
            const status = p.status || 'active';
            const progress = p.progress || 0;
            const due = p.dueDate ? new Date(p.dueDate).toLocaleDateString() : p.due;
            const budget = p.budget || 0;
            const spent = p.spent || 0;
            const tags = p.tags || [];
            const team = p.team || [];
            return (
              <Card key={projectId} className="proj-card" onClick={() => setSelectedProject(projectId)}>
                <div className="proj-card-head">
                  <div>
                    <div className="proj-card-client muted small">{clientName}</div>
                    <div className="proj-card-name">{projectName}</div>
                  </div>
                  <StatusPill status={status}/>
                </div>
                <div className="proj-card-tags">
                  {tags.map(t => <span key={t} className="proj-tag">{t}</span>)}
                </div>
                <div className="proj-card-bar">
                  <ProgressBar value={progress} tone={status === 'At risk' ? 'amber' : status === 'On hold' ? 'neutral' : 'navy'} height={6}/>
                  <div className="proj-card-bar-meta">
                    <span className="mono">{progress}%</span>
                    <span className="muted">due {due}</span>
                  </div>
                </div>
                <div className="proj-card-foot">
                  <AvatarStack ids={team} size={24}/>
                  <div className="proj-card-spend mono">${(spent/1000).toFixed(0)}k <span className="muted">/ ${(budget/1000).toFixed(0)}k</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card pad={false} className="big-table">
          <div className="bt-head proj-head">
            <div>Project</div><div>Client</div><div>Status</div><div>Progress</div><div>Team</div><div>Budget</div><div>Due</div>
          </div>
          {projects.map(p => {
            const projectId = p._id || p.id;
            const clientName = p.clientName || p.client;
            const projectName = p.name || p.projectName;
            const status = p.status || 'active';
            const progress = p.progress || 0;
            const due = p.dueDate ? new Date(p.dueDate).toLocaleDateString() : p.due;
            const budget = p.budget || 0;
            const spent = p.spent || 0;
            const team = p.team || [];
            return (
              <div key={projectId} className="bt-row" onClick={() => setSelectedProject(projectId)}>
                <div className="bt-title-text">{projectName}</div>
                <div>{clientName}</div>
                <div><StatusPill status={status}/></div>
                <div className="proj-prog-cell">
                  <ProgressBar value={progress} tone={status === 'At risk' ? 'amber' : 'navy'} height={5}/>
                  <span className="mono small">{progress}%</span>
                </div>
                <div><AvatarStack ids={team} size={22}/></div>
                <div className="mono">${(spent/1000).toFixed(0)}k / ${(budget/1000).toFixed(0)}k</div>
                <div>{due}</div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{
            width: '540px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>Create new project</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Fill in the details to create a new project</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Project Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                  Project name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Client Selection */}
              {role === 'client' ? (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Client</label>
                  <input 
                    value={authUser?.email || ''} 
                    disabled 
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                    Client <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c._id || c.id} value={c.email}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Two Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Due Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Due date</label>
                  <input
                    type="date"
                    value={newProjectDueDate}
                    onChange={e => setNewProjectDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                </div>
                {/* Budget */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Budget ($)</label>
                  <input
                    type="number"
                    value={newProjectBudget}
                    onChange={e => setNewProjectBudget(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                  placeholder="Describe the project goals, requirements, and deliverables..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newProjectName.trim()) return;
                  if (role !== 'client' && !selectedClient) {
                    alert('Please select a client');
                    return;
                  }
                  setCreating(true);
                  try {
                    const clientId = role === 'client' ? authUser?.email : selectedClient;
                    const clientName = role === 'client' ? authUser?.name || authUser?.email : clients.find(c => c.email === selectedClient)?.name || selectedClient;
                    const res = await fetchWithAuth(`${API_BASE}/client/projects`, {
                      method: 'POST',
                      body: {
                        name: newProjectName,
                        description: newProjectDescription,
                        clientId,
                        clientName,
                        status: 'active',
                        dueDate: newProjectDueDate || null,
                        budget: parseInt(newProjectBudget) || 0,
                      },
                    });
                    if (!res) return;
                    const data = await res.json();
                    if (data.project) {
                      setNewProjectName('');
                      setNewProjectDescription('');
                      setSelectedClient('');
                      setNewProjectDueDate('');
                      setNewProjectBudget('');
                      setShowCreateModal(false);
                      window.dispatchEvent(new CustomEvent('projects-updated'));
                    }
                  } catch (err) {
                    console.error('Failed to create project:', err);
                    alert('Failed to create project');
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={!newProjectName.trim() || creating}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  background: !newProjectName.trim() || creating ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !newProjectName.trim() || creating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {creating && <span style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>}
                {creating ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, role, onBack }) {
  const [tab, setTab] = React.useState('overview');
  const [projectTickets, setProjectTickets] = React.useState([]);
  const [projectTasks, setProjectTasks] = React.useState([]);
  
  // Fetch project tickets and tasks from API
  React.useEffect(() => {
    if (!project) return;
    const projectId = project._id || project.id;
    
    async function fetchData() {
      try {
        // Fetch tickets for this project
        const ticketsRes = await fetchWithAuth(`${API_BASE}/tickets?projectId=${projectId}`);
        if (ticketsRes) {
          const ticketsData = await ticketsRes.json();
          setProjectTickets(ticketsData.tickets || []);
        }
        
        // Fetch tasks for this project  
        const tasksRes = await fetchWithAuth(`${API_BASE}/tasks?projectId=${projectId}`);
        if (tasksRes) {
          const tasksData = await tasksRes.json();
          setProjectTasks(tasksData.tasks || []);
        }
      } catch (err) {
        console.error('Failed to fetch project data:', err);
      }
    }
    
    fetchData();
  }, [project]);
  
  // Handle both API and demo formats
  const projectId = project._id || project.id;
  const clientName = project.clientName || project.client;
  const projectName = project.name || project.projectName;
  const status = project.status || 'active';
  const tags = project.tags || [];
  const due = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : project.due;
  const budget = project.budget || 0;
  const spent = project.spent || 0;
  const progress = project.progress || 0;
  const description = project.description || '';
  
  const lead = project.manager ? { name: project.manager, initials: project.manager.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(), hue: 220 } : { name: 'TBD', initials: 'TB', hue: 220 };

  return (
    <div className="page detail-page">
      <div className="detail-crumbs">
        <button className="crumb-back" onClick={onBack}><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/> Projects</button>
        <span className="crumb-sep">/</span>
        <span className="muted">{clientName}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-eyebrow">{clientName}</div>
          <h1 className="detail-title">{projectName}</h1>
          <div className="detail-tags">
            <StatusPill status={status}/>
            {tags.map(t => <Badge key={t} tone="neutral" soft>{t}</Badge>)}
            <span className="muted small">Due {due}</span>
          </div>
        </div>
        <div className="detail-actions">
          <Button variant="ghost" size="sm" icon={<Ic.attach width={14} height={14}/>}>Files</Button>
          <Button variant="ghost" size="sm" icon={<Ic.invite width={14} height={14}/>}>Add member</Button>
          {role !== 'client' && <Button variant="secondary" size="sm">Edit</Button>}
          {role !== 'client' && <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New task</Button>}
        </div>
      </div>

      <div className="kpi-grid kpi-grid-4">
        <KPI label="Progress" value={`${project.progress}%`} sub={`${100-project.progress}% remaining`} color="#15348a"/>
        <KPI label="Budget burn" value={`$${(project.spent/1000).toFixed(0)}k`} sub={`of $${(project.budget/1000).toFixed(0)}k`} color={project.spent/project.budget > 0.85 ? '#d97706' : '#65bb3c'}/>
        <KPI label="Open tickets" value={String(projectTickets.filter(t => t.status !== 'Resolved').length)} sub={`${projectTickets.length} total`} color="#d97706"/>
        <KPI label="Team members" value={String(project.team.length)} sub={`led by ${lead?.name.split(' ')[0]}`} color="#65bb3c"/>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'tasks', label: 'Tasks', badge: projectTasks.length },
          { id: 'tickets', label: 'Tickets', badge: projectTickets.length },
          { id: 'timeline', label: 'Timeline' },
          { id: 'files', label: 'Files' },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="detail-grid">
          <div className="detail-main">
            <Card>
              <SectionHead title="Project brief"/>
              <p>Rebuild of Northwind's shipper-facing portal: real-time tracking, bulk operations, multi-tenant dashboards, and a redesigned dispatcher inbox. Targets a 35% reduction in dispatcher handling time by Q3.</p>
              <div className="brief-stats">
                <div><div className="muted small">Start date</div><div>Mar 04, 2026</div></div>
                <div><div className="muted small">Target launch</div><div>Jul 12, 2026</div></div>
                <div><div className="muted small">Methodology</div><div>2-week sprints</div></div>
                <div><div className="muted small">Hours logged</div><div className="mono">1,284h</div></div>
              </div>
            </Card>
            <Card>
              <SectionHead title="Milestones"/>
              <div className="milestone-list">
                {[
                  { name: 'Design system locked',  date: 'Mar 28', state: 'done' },
                  { name: 'Auth + tenancy live',   date: 'Apr 18', state: 'done' },
                  { name: 'Dashboard MVP',         date: 'May 09', state: 'done' },
                  { name: 'Bulk operations',       date: 'May 30', state: 'cur', progress: 64 },
                  { name: 'Dispatcher inbox',      date: 'Jun 20', state: 'next' },
                  { name: 'Beta with 3 customers', date: 'Jul 04', state: 'next' },
                  { name: 'GA launch',             date: 'Jul 12', state: 'next' },
                ].map((m,i) => (
                  <div key={i} className={`mile-row mile-${m.state}`}>
                    <div className="mile-dot"/>
                    <div className="mile-body">
                      <div className="mile-name">{m.name}</div>
                      <div className="muted small">{m.date}</div>
                    </div>
                    {m.state === 'cur' && <div className="mile-bar"><ProgressBar value={m.progress} tone="amber" height={5}/></div>}
                    {m.state === 'done' && <Ic.ok width={16} height={16} className="ok-icon"/>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="detail-side">
            <Card>
              <SectionHead title="Team"/>
              <div className="team-list">
                <div className="team-row">
                  <Avatar initials={lead.initials} hue={lead.hue} size={32}/>
                  <div><div>{lead.name}</div><div className="muted small">Project lead</div></div>
                </div>
                {(project.team || []).map((member, i) => {
                  const name = typeof member === 'string' ? member : (member.name || 'Team member');
                  const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                  return (
                    <div key={i} className="team-row">
                      <Avatar initials={initials} hue={200} size={32}/>
                      <div><div>{name}</div><div className="muted small">Team member</div></div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionHead title="Risk & flags"/>
              <div className="risk-list">
                <div className="risk-row"><Ic.warn width={14} height={14} className="warn-icon"/><div><div>Dispatcher inbox dependency on 3rd-party messaging</div><div className="muted small">Open · medium</div></div></div>
                <div className="risk-row"><Ic.warn width={14} height={14} className="warn-icon"/><div><div>QA capacity drops 30% week of Jun 9</div><div className="muted small">Mitigation pending</div></div></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <Card pad={false}>
          <div className="bt-head task-head">
            <div></div><div>Task</div><div>Assignee</div><div>Status</div><div>Priority</div><div>Due</div><div>Estimate</div>
          </div>
          {projectTasks.length === 0 && <div className="bt-row"><EmptyState title="No tasks yet" sub="Create the first task to start tracking work."/></div>}
          {projectTasks.map(t => {
            const assigneeName = t.assigneeName || t.assignee || 'Unassigned';
            const assigneeInitials = assigneeName !== 'Unassigned' 
              ? assigneeName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
              : 'NA';
            return (
              <div key={t._id || t.id} className="bt-row task-row-detail">
                <div><span className="check-empty"/></div>
                <div className="bt-title-text">{t.title}</div>
                <div>{assigneeName !== 'Unassigned' && <div className="assignee-cell"><Avatar initials={assigneeInitials} hue={200} size={22}/><span>{assigneeName.split(' ')[0]}</span></div>}</div>
                <div><StatusPill status={t.status}/></div>
                <div><PriorityChip priority={t.priority}/></div>
                <div>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</div>
                <div className="mono">{t.estimatedHours ? `${t.estimatedHours}h` : '-'}</div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'tickets' && (
        <Card pad={false} className="big-table">
          <div className="bt-head">
            <div className="bt-c-id">ID</div>
            <div className="bt-c-title">Title</div>
            <div className="bt-c-client">Reporter</div>
            <div className="bt-c-prio">Priority</div>
            <div className="bt-c-status">Status</div>
            <div className="bt-c-assignee">Assignee</div>
            <div className="bt-c-sla">SLA</div>
            <div className="bt-c-opened">Opened</div>
          </div>
          {projectTickets.map(t => {
            const ticketId = t._id || t.id;
            const assigneeName = t.assigneeName || t.assignee || 'Unassigned';
            const assigneeInitials = assigneeName !== 'Unassigned' 
              ? assigneeName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
              : 'NA';
            const openedText = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : (t.opened || 'Recently');
            return (
              <div key={ticketId} className="bt-row">
                <div className="bt-c-id mono">{typeof ticketId === 'string' ? ticketId.slice(-6).toUpperCase() : ticketId}</div>
                <div className="bt-c-title bt-title-text">{t.title}</div>
                <div className="bt-c-client">{t.reporter || t.clientName || 'Unknown'}</div>
                <div className="bt-c-prio"><PriorityChip priority={t.priority}/></div>
                <div className="bt-c-status"><StatusPill status={t.status}/></div>
                <div className="bt-c-assignee">{assigneeName !== 'Unassigned' && <div className="assignee-cell"><Avatar initials={assigneeInitials} hue={200} size={22}/><span>{assigneeName.split(' ')[0]}</span></div>}</div>
                <div className="bt-c-sla">{t.sla || 'N/A'}</div>
                <div className="bt-c-opened muted">{openedText}</div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'timeline' && <GanttTimeline project={project}/>}

      {tab === 'files' && (
        <Card>
          <SectionHead title="Files & artifacts"/>
          <div className="files-grid">
            {[
              { name: 'Statement of Work — Northwind v3.pdf', size: '218 KB', who: 'Daniel Okafor', when: '3d ago' },
              { name: 'Architecture diagram.png',             size: '1.4 MB', who: 'Marcus Webb',   when: '5d ago' },
              { name: 'Dispatcher inbox — wireframes.fig',    size: '4.2 MB', who: 'Sofia Reyes',   when: '1w ago' },
              { name: 'Performance audit.xlsx',               size: '92 KB',  who: 'Aarav Mehta',   when: '2w ago' },
            ].map((f,i) => (
              <div key={i} className="file-card">
                <Ic.paper width={28} height={28} className="file-icon"/>
                <div>
                  <div className="file-name">{f.name}</div>
                  <div className="muted small">{f.size} · {f.who} · {f.when}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function GanttTimeline({ project }) {
  // Lightweight Gantt with 7 swimlanes
  const lanes = [
    { name: 'Discovery',         start: 0,  len: 6,  color: '#94a3b8' },
    { name: 'Design system',     start: 5,  len: 8,  color: '#7c3aed' },
    { name: 'Auth + tenancy',    start: 10, len: 10, color: '#15348a' },
    { name: 'Dashboard MVP',     start: 16, len: 12, color: '#2f5fd3' },
    { name: 'Bulk operations',   start: 24, len: 10, color: '#d97706', current: true },
    { name: 'Dispatcher inbox',  start: 32, len: 12, color: '#65bb3c' },
    { name: 'Beta + GA',         start: 42, len: 8,  color: '#dc2626' },
  ];
  const weeks = 52;
  return (
    <Card>
      <SectionHead title="Timeline" sub="Weeks · Mar – Jul"/>
      <div className="gantt">
        <div className="gantt-head">
          <div className="gantt-lane-name"></div>
          <div className="gantt-weeks">
            {['Mar','Apr','May','Jun','Jul'].map((m,i) => (
              <div key={m} className="gantt-month" style={{ flex: 1 }}>{m}</div>
            ))}
          </div>
        </div>
        {lanes.map((l,i) => (
          <div key={i} className={`gantt-lane ${l.current ? 'is-current' : ''}`}>
            <div className="gantt-lane-name">{l.name}</div>
            <div className="gantt-track">
              <div className="gantt-bar" style={{ left: `${(l.start/weeks)*100}%`, width: `${(l.len/weeks)*100}%`, background: l.color }}>
                <span className="gantt-bar-label">{l.name}</span>
              </div>
              {l.current && <div className="gantt-today" style={{ left: `${((l.start + l.len*0.6)/weeks)*100}%` }}/>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

Object.assign(window, { ProjectsScreen });

export default ProjectsScreen;
