// Tickets list + detail
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, SectionHead, Avatar, StatusPill, PriorityChip, ProgressBar, Ic, Badge, Tabs } from './ui'
import { fetchWithAuth, API_BASE } from '../utils/api'
import { fetchAllTickets, fetchClientTickets } from '../store/slices/ticketsSlice';
import { CreateTicketModal, Modal } from './modals';
import { PROJECTS, TEAM } from './data';

// Create Task Modal - Responsive and Modern
function CreateTaskModal({ open, onClose, onCreated, ticketId, projectId, assignees }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [assigneeId, setAssigneeId] = React.useState('');
  const [estimatedHours, setEstimatedHours] = React.useState(4);
  const [priority, setPriority] = React.useState('medium');
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  
  // Priority colors
  const priorityColors = {
    low: '#22c55e',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  };
  
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Task title is required';
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        ticketId,
        projectId,
        assigneeId: assigneeId || undefined,
        estimatedHours: parseInt(estimatedHours) || 4,
        priority,
        status: 'todo'
      };
      console.log('Creating task with data:', taskData);
      
      const res = await fetchWithAuth(`${API_BASE}/tasks`, {
        method: 'POST',
        body: taskData
      });
      if (res) {
        const data = await res.json();
        console.log('Task created response:', data);
        if (data.success && data.task) {
          onCreated(data.task);
          onClose();
          // Reset form
          setTitle('');
          setDescription('');
          setAssigneeId('');
          setEstimatedHours(4);
          setPriority('medium');
          setErrors({});
        } else {
          console.error('Task creation failed:', data.message);
          setErrors({ submit: data.message || 'Failed to create task' });
        }
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      setErrors({ submit: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setErrors({});
    onClose();
  };
  
  if (!open) return null;
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New Task"
      subtitle={`Linked to ticket #${ticketId?.slice(-6).toUpperCase()}`}
      width={560}
      fullscreen={false}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ color: '#ef4444', fontSize: '14px' }}>
            {errors.submit && <span><Ic.warn width={16} height={16}/> {errors.submit}</span>}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              disabled={!title.trim() || loading}
              icon={!loading && <Ic.plus width={16} height={16}/>}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title Field */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
            Task Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input 
            className="input" 
            value={title} 
            onChange={e => {
              setTitle(e.target.value);
              if (errors.title) setErrors(prev => ({ ...prev, title: null }));
            }}
            placeholder="What needs to be done?"
            style={{ 
              width: '100%', 
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: '10px',
              border: errors.title ? '2px solid #ef4444' : '1px solid #e5e7eb',
              backgroundColor: '#fafafa'
            }}
          />
          {errors.title && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: 6 }}>{errors.title}</div>}
        </div>
        
        {/* Description Field */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
            Description
          </label>
          <textarea 
            className="input" 
            rows={4}
            value={description} 
            onChange={e => setDescription(e.target.value)}
            placeholder="Add details about this task..."
            style={{ 
              width: '100%', 
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        </div>
        
        {/* Assignee Field */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
            Assign to
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* Unassigned Option */}
            <button
              onClick={() => setAssigneeId('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: '24px',
                border: assigneeId === '' ? '2px solid #15348a' : '1px solid #e5e7eb',
                backgroundColor: assigneeId === '' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              <Avatar initials="?" hue={200} size={28}/>
              <span>Unassigned</span>
            </button>
            
            {/* Resource Options */}
            {assignees.map(a => (
              <button
                key={a._id || a.id}
                onClick={() => setAssigneeId(a._id || a.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: assigneeId === (a._id || a.id) ? '2px solid #15348a' : '1px solid #e5e7eb',
                  backgroundColor: assigneeId === (a._id || a.id) ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                <Avatar 
                  initials={a.name?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'U'} 
                  hue={(a._id?.charCodeAt(0) || 0) * 47 % 360} 
                  size={28}
                />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Priority and Hours Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {/* Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              Priority
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: priority === p ? `2px solid ${priorityColors[p]}` : '1px solid #e5e7eb',
                    backgroundColor: priority === p ? `${priorityColors[p]}15` : '#fff',
                    color: priority === p ? priorityColors[p] : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: priority === p ? 600 : 400,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: priorityColors[p],
                    display: 'inline-block'
                  }}/>
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          {/* Estimated Hours */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              Estimated Hours
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                type="range" 
                min={1} 
                max={40} 
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                style={{ flex: 1, height: 6, borderRadius: 3 }}
              />
              <div style={{ 
                minWidth: 60, 
                textAlign: 'center', 
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                fontWeight: 600,
                color: '#374151',
                fontSize: '14px'
              }}>
                {estimatedHours}h
              </div>
            </div>
          </div>
        </div>
        
        {/* Ticket Link Info */}
        <div className="ticket-link-info" style={{ 
          padding: '16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ color: '#64748b' }}><Ic.ticket width={20} height={20}/></span>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>This task will be linked to:</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
              Ticket #{ticketId?.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TicketsScreen({ role, selectedTicket, setSelectedTicket, authUser }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [singleTicket, setSingleTicket] = React.useState(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  
  // Redux selectors
  const tickets = useSelector(state => state.tickets.items);
  const loading = useSelector(state => state.tickets.loading);
  
  // Fetch tickets from API based on role
  React.useEffect(() => {
    if (!authUser) return;
    
    if (role === 'client') {
      dispatch(fetchClientTickets(authUser.email));
    } else if (role === 'admin' || role === 'manager') {
      dispatch(fetchAllTickets({ limit: 100 }));
    } else if (role === 'resource') {
      // Resource sees tickets assigned to them
      dispatch(fetchAllTickets({ assignee: authUser.id || authUser._id, limit: 100 }));
    } else if (role === 'sales') {
      // Sales sees all tickets (they need visibility for client communication)
      dispatch(fetchAllTickets({ limit: 100 }));
    }
  }, [dispatch, role, authUser]);

  // Listen for tickets-updated event to refresh list
  React.useEffect(() => {
    const handleTicketsUpdated = () => {
      if (role === 'client') {
        dispatch(fetchClientTickets(authUser.email));
      } else if (role === 'admin' || role === 'manager') {
        dispatch(fetchAllTickets({ limit: 100 }));
      } else if (role === 'resource') {
        dispatch(fetchAllTickets({ assignee: authUser.id || authUser._id, limit: 100 }));
      } else if (role === 'sales') {
        dispatch(fetchAllTickets({ limit: 100 }));
      }
    };
    window.addEventListener('tickets-updated', handleTicketsUpdated);
    return () => window.removeEventListener('tickets-updated', handleTicketsUpdated);
  }, [dispatch, role, authUser]);

  // Use single fetched ticket if needed
  const displayTickets = singleTicket ? [singleTicket] : tickets;

  // Filter rows based on current filter
  let rows = displayTickets;
  if (role === 'resource') rows = rows.filter(t => t.assignee === authUser?.id || t.assignee === 'u1' || t.assignee === 'u3');
  if (filter === 'urgent') rows = rows.filter(t => t.priority === 'Urgent' || t.priority === 'High' || t.priority === 'urgent' || t.priority === 'high');
  if (filter === 'mine' && role !== 'client') rows = rows.filter(t => t.assignee === authUser?.id || t.assignee === 'u1');
  if (filter === 'unassigned') rows = rows.filter(t => t.status === 'Open' || t.status === 'Backlog' || t.status === 'open' || !t.assignee);
  if (search) rows = rows.filter(t => (t.title + (t._id || t.id) + (t.clientName || t.client)).toLowerCase().includes(search.toLowerCase()));
  
  // Pagination - 50 items per page
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const paginatedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // Reset to page 1 when filter/search changes
  React.useEffect(() => {
    setPage(1);
  }, [filter, search, role]);

  const counts = {
    all: displayTickets.length,
    urgent: displayTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High' || t.priority === 'urgent' || t.priority === 'high').length,
    mine: role === 'client' ? 0 : displayTickets.filter(t => t.assignee === 'u1').length,
    unassigned: displayTickets.filter(t => t.status === 'Open' || t.status === 'open').length,
  };

  // Fetch single ticket if selected but not found in local tickets
  React.useEffect(() => {
    if (selectedTicket && !loading) {
      const found = tickets.find(t => t.id === selectedTicket || t._id === selectedTicket);
      if (!found) {
        async function fetchSingleTicket() {
          try {
            let res;
            if (role === 'client') {
              res = await fetchWithAuth(`${API_BASE}/client/tickets/${selectedTicket}`);
            } else {
              res = await fetchWithAuth(`${API_BASE}/tickets/${selectedTicket}`);
            }
            if (!res) return; // 401 handled
            const data = await res.json();
            if (data.ticket) {
              setSingleTicket(data.ticket);
            }
          } catch (err) {
            console.error('Failed to fetch single ticket:', err);
          }
        }
        fetchSingleTicket();
      }
    }
  }, [selectedTicket, role, loading, tickets]);

  // Handle create ticket for admin/manager/client
  const handleCreateTicket = async (ticketData) => {
    if (role !== 'admin' && role !== 'manager' && role !== 'client') return;
    setCreating(true);
    try {
      // Handle both old inline modal format and original modals.jsx format
      const res = await fetchWithAuth(`${API_BASE}/tickets`, {
        method: 'POST',
        body: {
          title: ticketData.title,
          description: ticketData.description,
          priority: (ticketData.priority || 'medium').toLowerCase(),
          status: ticketData.status || 'open',
          category: ticketData.category || 'Support',
          clientId: ticketData.clientId || ticketData.client,
          projectId: ticketData.projectId || ticketData.project,
          assignee: ticketData.assignee,
        },
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        dispatch(fetchAllTickets({ limit: 100 }));
        alert('Ticket created successfully!');
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  if (selectedTicket) {
    const ticket = displayTickets.find(t => t.id === selectedTicket || t._id === selectedTicket);
    if (ticket) return <TicketDetail ticket={ticket} onBack={() => { setSelectedTicket(null); setSingleTicket(null); }} role={role} authUser={authUser} onTicketUpdate={() => {}}/>;
    // Show loading state while fetching ticket
    if (loading) return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading ticket...</div>
        </div>
      </div>
    );
    // Ticket not found
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <div className="text-gray-500">Ticket not found</div>
          <Button variant="secondary" onClick={() => setSelectedTicket(null)}>Back to tickets</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs
          tabs={[
            { id: 'all', label: 'All', badge: counts.all },
            { id: 'urgent', label: 'Urgent + High', badge: counts.urgent },
            ...(role !== 'client' ? [{ id: 'mine', label: 'Assigned to me', badge: counts.mine }] : []),
            ...(role !== 'client' ? [{ id: 'unassigned', label: 'Open', badge: counts.unassigned }] : []),
          ]}
          active={filter} onChange={setFilter}
        />
        <div className="toolbar-right">
          <div className="search search-sm">
            <Ic.search width={14} height={14} className="search-icon"/>
            <input placeholder="Find by ID, title, client…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <Button variant="ghost" icon={<Ic.filter width={14} height={14}/>} size="sm">Filter</Button>
          <Button variant="ghost" icon={<Ic.sort width={14} height={14}/>} size="sm">Sort</Button>
          {(role === 'admin' || role === 'manager' || role === 'client') && (
            <Button variant="primary" icon={<Ic.plus width={14} height={14}/>} size="sm" onClick={() => setShowCreateModal(true)}>New ticket</Button>
          )}
        </div>
      </div>

      <Card pad={false} className="big-table">
        <div className="bt-head">
          <div className="bt-c-id">ID</div>
          <div className="bt-c-title">Title</div>
          <div className="bt-c-client">Client</div>
          <div className="bt-c-prio">Priority</div>
          <div className="bt-c-status">Status</div>
          <div className="bt-c-assignee">Assignee</div>
          <div className="bt-c-sla">SLA</div>
          <div className="bt-c-opened">Opened</div>
        </div>
        {loading ? (
          <div className="bt-row"><div className="bt-c-title p-4 text-center text-gray-500">Loading tickets...</div></div>
        ) : rows.length === 0 ? (
          <div className="bt-row"><div className="bt-c-title p-4 text-center text-gray-400">No tickets found</div></div>
        ) : paginatedRows.map(t => {
          const ticketId = t._id || t.id;
          // DEBUG: Log assignee data
          if (t.assignee) {
            console.log('Ticket', ticketId, 'assignee:', t.assignee, 'assigneeName:', t.assigneeName);
          }
          const assigneeName = t.assigneeName || t.assignee || 'Unassigned';
          const assigneeInitials = assigneeName !== 'Unassigned' 
            ? assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : 'NA';
          const slaText = t.sla || 'N/A';
          const slaUrgent = slaText.includes('h left') && parseInt(slaText) < 6;
          const openedText = t.createdAt 
            ? new Date(t.createdAt).toLocaleDateString() 
            : t.opened || 'Recently';
          return (
            <div key={ticketId} className="bt-row" onClick={() => setSelectedTicket(ticketId)}>
              <div className="bt-c-id mono">{typeof ticketId === 'string' ? ticketId.slice(-6).toUpperCase() : ticketId}</div>
              <div className="bt-c-title">
                <div className="bt-title-text">{t.title}</div>
                <div className="bt-title-meta muted">{t.category || 'Support'} · {t.projectName || 'General'} · {t.comments?.length || t.comments || 0} comments</div>
              </div>
              <div className="bt-c-client">{t.clientName || t.client || 'Unknown'}</div>
              <div className="bt-c-prio"><PriorityChip priority={t.priority}/></div>
              <div className="bt-c-status"><StatusPill status={t.status}/></div>
              <div className="bt-c-assignee">
                {assigneeName !== 'Unassigned' ? (
                  <div className="assignee-cell">
                    <Avatar initials={assigneeInitials} hue={200} size={22}/>
                    <span>{assigneeName.split(' ')[0]}</span>
                  </div>
                ) : <span className="muted">Unassigned</span>}
              </div>
              <div className={`bt-c-sla ${slaUrgent ? 'sla-warn' : ''}`}>
                {slaUrgent && <Ic.warn width={12} height={12}/>}
                {slaText}
              </div>
              <div className="bt-c-opened muted">{openedText}</div>
            </div>
          );
        })}
      </Card>
      
      {/* Debug Info */}
      {console.log('Tickets Debug:', { ticketsCount: tickets.length, rowsCount: rows.length, paginatedCount: paginatedRows.length, loading })}

      {/* Pagination Controls */}
      {rows.length > itemsPerPage && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, rows.length)} of {rows.length}
          </div>
          <div className="pagination-buttons">
            <button 
              className="page-btn" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Ic.chevL width={16} height={16}/>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  key={pageNum}
                  className={`page-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              className="page-btn" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <Ic.chevR width={16} height={16}/>
            </button>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal 
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)} 
          onCreated={handleCreateTicket}
          userRole={role}
          userEmail={authUser?.email}
        />
      )}

    </div>
  );
}

function TicketDetail({ ticket, onBack, role, authUser = {}, onTicketUpdate }) {
  // Handle both demo ticket format (id) and API ticket format (_id)
  const ticketId = ticket._id || ticket.id;
  const [currentTicket, setCurrentTicket] = React.useState(ticket);
  const [activity, setActivity] = React.useState([]);
  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState('activity');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  
  // Task creation state
  const [showCreateTask, setShowCreateTask] = React.useState(false);
  const [linkedTasks, setLinkedTasks] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  const [projects, setProjects] = React.useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    const timer = setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    return () => clearTimeout(timer);
  };
  
  // Fetch resources, projects and linked tasks
  React.useEffect(() => {
    if (role !== 'client' && ticketId) {
      fetchResources();
      fetchProjects();
      fetchLinkedTasks();
    }
  }, [ticketId, role]);
  
  const fetchResources = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/users?role=resource`);
      if (res) {
        const data = await res.json();
        setResources(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };
  
  const fetchProjects = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/projects`);
      if (res) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };
  
  const fetchLinkedTasks = async () => {
    try {
      console.log('Fetching linked tasks for ticket:', ticketId);
      const res = await fetchWithAuth(`${API_BASE}/tasks?ticketId=${ticketId}`);
      if (res) {
        const data = await res.json();
        console.log('Linked tasks fetched:', data);
        setLinkedTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch linked tasks:', err);
    }
  };
  
  const handleTaskCreated = (newTask) => {
    console.log('Task created callback received:', newTask);
    // Add to local state immediately for instant feedback
    setLinkedTasks(prev => {
      const updated = [...prev, newTask];
      console.log('Updated linked tasks:', updated);
      return updated;
    });
    showToast('Task created and linked to ticket', 'success');
    // Also re-fetch to ensure consistency
    setTimeout(() => fetchLinkedTasks(), 500);
  };

  // Derived values with null-safe access
  const ticketData = currentTicket || {};
  const assigneeName = ticketData.assigneeName || 'Unassigned';
  const assignee = { 
    name: assigneeName, 
    initials: assigneeName !== 'Unassigned' 
      ? assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
      : 'NA', 
    hue: 200 
  };
  const project = projects.find(p => (p._id || p.id) === (ticketData.projectId || ticketData.project)) || PROJECTS.find(p => (p._id || p.id) === (ticketData.projectId || ticketData.project));
  const clientName = ticketData.clientName || ticketData.client || '—';
  const reporterName = ticketData.reporter || ticketData.reporterId || '—';
  const openedText = ticketData.createdAt 
    ? new Date(ticketData.createdAt).toLocaleDateString() 
    : ticketData.opened || 'Recently';
  const status = ticketData.status || 'open';
  
  // Check if ticket is closed or resolved - disable editing (except for admin/manager)
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const isClosedOrResolved = (status === 'closed' || status === 'resolved') && !isAdminOrManager;

  // Fetch activity and comments for API tickets
  React.useEffect(() => {
    if (ticketId) {
      fetchActivity();
    }
  }, [ticketId, authUser?.email]);

  const fetchActivity = async () => {
    try {
      let res;
      if (role === 'client') {
        const clientId = authUser?.email;
        res = await fetchWithAuth(`${API_BASE}/client/tickets/${ticketId}/activity?clientId=${clientId}`);
      } else {
        res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/activity`);
      }
      if (!res) return; // 401 handled
      const data = await res.json();
      console.log('Activity API response:', data);
      // Backend returns 'logs', frontend expects 'activity'
      setActivity(data.activity || data.logs || []);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      let res;
      if (role === 'client') {
        const clientId = authUser?.email;
        res = await fetchWithAuth(`${API_BASE}/client/tickets/${ticketId}/comments?clientId=${clientId}`, {
          method: 'POST',
          body: {
            text: newComment,
            author: authUser?.name || authUser?.email,
            authorId: authUser?.id,
          },
        });
      } else {
        res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/comments`, {
          method: 'POST',
          body: {
            text: newComment,
            author: authUser?.name || authUser?.email,
            authorId: authUser?.id,
          },
        });
      }
      if (!res) return; // 401 handled
      setNewComment('');
      showToast('Comment added successfully', 'success');
      await fetchActivity();
    } catch (err) {
      console.error('Failed to add comment:', err);
      showToast('Failed to add comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const previousStatus = ticketData.status;
    // Optimistic update - update UI immediately
    setCurrentTicket({ ...ticketData, status: newStatus });
    setLoading(true);
    try {
      let res;
      if (role === 'client') {
        const clientId = authUser?.email;
        res = await fetchWithAuth(`${API_BASE}/client/tickets/${ticketId}/status?clientId=${clientId}`, {
          method: 'PUT',
          body: {
            status: newStatus,
            changedBy: authUser?.name || authUser?.email,
          },
        });
      } else {
        res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/status`, {
          method: 'PUT',
          body: {
            status: newStatus,
            changedBy: authUser?.name || authUser?.email,
          },
        });
      }
      if (!res) {
        // Revert on auth failure
        setCurrentTicket({ ...ticketData, status: previousStatus });
        return;
      }
      // Keep the optimistic update (API returns success, not full ticket)
      showToast(`Status updated to ${newStatus}`, 'success');
      await fetchActivity();
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert on error
      setCurrentTicket({ ...ticketData, status: previousStatus });
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePriority = async (newPriority) => {
    const previousPriority = ticketData.priority;
    // Optimistic update - update UI immediately
    setCurrentTicket({ ...ticketData, priority: newPriority });
    setLoading(true);
    try {
      let res;
      if (role === 'client') {
        const clientId = authUser?.email;
        res = await fetchWithAuth(`${API_BASE}/client/tickets/${ticketId}/priority?clientId=${clientId}`, {
          method: 'PUT',
          body: {
            priority: newPriority,
            changedBy: authUser?.name || authUser?.email,
          },
        });
      } else {
        res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/priority`, {
          method: 'PUT',
          body: {
            priority: newPriority,
            changedBy: authUser?.name || authUser?.email,
          },
        });
      }
      if (!res) {
        // Revert on auth failure
        setCurrentTicket({ ...ticketData, priority: previousPriority });
        return;
      }
      // Keep the optimistic update (API returns success, not full ticket)
      showToast(`Priority updated to ${newPriority}`, 'success');
      await fetchActivity();
    } catch (err) {
      console.error('Failed to update priority:', err);
      // Revert on error
      setCurrentTicket({ ...ticketData, priority: previousPriority });
      showToast('Failed to update priority', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page detail-page">
      <div className="detail-crumbs">
        <button className="crumb-back" onClick={onBack}><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/> All tickets</button>
        <span className="crumb-sep">/</span>
        <span className="muted mono">{ticketId}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-eyebrow mono">{ticketId} · {ticketData.category || '—'}</div>
          <h1 className="detail-title">{ticketData.title || 'Untitled'}</h1>
          <div className="detail-tags">
            <StatusPill status={status}/>
            <PriorityChip priority={ticketData.priority}/>
            <Badge tone="navy" soft>{clientName}</Badge>
            <span className="muted small">Opened {openedText} by {reporterName}</span>
          </div>
        </div>
        <div className="detail-actions">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Ic.link width={14} height={14}/>}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
          >
            Copy link
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Ic.attach width={14} height={14}/>}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  alert(`File "${file.name}" selected. Upload feature coming soon!`);
                }
              };
              input.click();
            }}
          >
            Attach
          </Button>
          <select 
            className="input" 
            style={{width: 'auto'}}
            value={ticketData.priority || 'medium'}
            onChange={e => updatePriority(e.target.value)}
            disabled={loading || (isClosedOrResolved && !isAdminOrManager)}
            title={isClosedOrResolved && !isAdminOrManager ? 'Ticket is closed - cannot modify priority' : ''}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select 
            className="input" 
            style={{width: 'auto'}}
            value={status}
            onChange={e => updateStatus(e.target.value)}
            disabled={loading || (isClosedOrResolved && !isAdminOrManager)}
            title={isClosedOrResolved && !isAdminOrManager ? 'Ticket is closed - cannot modify status' : 'Change ticket status'}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          {isAdminOrManager && (status === 'resolved' || status === 'closed') ? (
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Ic.refresh width={14} height={14}/>}
              onClick={() => updateStatus('open')}
              disabled={loading}
            >
              Reopen Ticket
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Ic.ok width={14} height={14}/>}
              onClick={() => updateStatus('resolved')}
              disabled={loading || status === 'resolved' || status === 'closed'}
            >
              {status === 'closed' ? 'Ticket Closed' : status === 'resolved' ? 'Resolved' : 'Mark resolved'}
            </Button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <Card>
            <div className="description">
              <div className="desc-title">Description</div>
              {ticketData.description ? (
                <p>{ticketData.description}</p>
              ) : (
                <p className="muted">No description provided.</p>
              )}
            </div>
          </Card>

          <Card>
            <Tabs
              tabs={[{ id: 'activity', label: 'Activity' }, { id: 'comments', label: 'Comments' }, { id: 'linked', label: 'Linked work' }]}
              active={tab} onChange={setTab}
            />
            {tab === 'activity' && (
              <div className="ticket-activity">
                {activity.length === 0 && comments.length === 0 ? (
                  <div className="text-center p-4 text-gray-400">
                    <div className="ta-row">
                      <div className="ta-line">
                        <div className="ta-avatar"><Avatar initials={reporterName?.split(' ').map(n => n[0]).join('') || 'U'} hue={217} size={28}/></div>
                      </div>
                      <div className="ta-body">
                        <div className="ta-text"><strong>{reporterName}</strong> opened this ticket</div>
                        <div className="muted small">{openedText}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Show creation event first */}
                    <div className="ta-row">
                      <div className="ta-line">
                        <div className="ta-avatar"><Avatar initials={reporterName?.split(' ').map(n => n[0]).join('') || 'U'} hue={217} size={28}/></div>
                      </div>
                      <div className="ta-body">
                        <div className="ta-text"><strong>{reporterName}</strong> opened this ticket</div>
                        <div className="muted small">{openedText}</div>
                      </div>
                    </div>
                    {/* Show activity items */}
                    {activity.map((item, i) => (
                      <div key={i} className="ta-row">
                        <div className="ta-line">
                          <div className="ta-avatar"><Avatar initials={item.initials || 'U'} hue={item.hue || 217} size={28}/></div>
                        </div>
                        <div className="ta-body">
                          <div className="ta-text"><strong>{item.who}</strong> {item.action}</div>
                          <div className="muted small">{item.when ? new Date(item.when).toLocaleString() : ''}</div>
                          {item.text && <div className="ta-desc">{item.text}</div>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            {tab === 'comments' && (
              <div className="comments">
                {comments.length > 0 ? (
                  comments.map((comment, i) => (
                    <div key={i} className="comment">
                      <Avatar initials={comment.initials || 'U'} hue={comment.hue || 217} size={32}/>
                      <div className="cmt-body">
                        <div className="cmt-head"><strong>{comment.author}</strong><span className="muted small">{comment.when ? new Date(comment.when).toLocaleString() : ''}</span></div>
                        <div className="cmt-text">{comment.text}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-400">No comments yet</div>
                )}
                {!(isClosedOrResolved && !isAdminOrManager) ? (
                  <div className="comment-input">
                    <Avatar initials={authUser?.name ? authUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'} hue={217} size={32}/>
                    <div className="cmt-input-wrap">
                      <textarea 
                        placeholder="Reply, mention with @, attach a log…" 
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                      />
                      <div className="cmt-input-foot">
                        <div className="cmt-input-tools">
                          <Ic.attach width={14} height={14}/>
                          <Ic.message width={14} height={14}/>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={addComment}
                          disabled={!newComment.trim() || loading}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 bg-gray-50 rounded-lg mt-4">
                    <p>This ticket is {status}. {isAdminOrManager ? 'As admin/manager, you can still add comments and reopen this ticket.' : 'Comments are disabled.'}</p>
                  </div>
                )}
              </div>
            )}
            {tab === 'linked' && (
              <div className="linked-list">
                {/* Create Task Button - Only for non-clients */}
                {role !== 'client' && !isClosedOrResolved && (
                  <div className="mb-4">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      icon={<Ic.plus width={14} height={14}/>}
                      onClick={() => setShowCreateTask(true)}
                    >
                      Create Task
                    </Button>
                  </div>
                )}
                
                {/* Linked Tasks from API */}
                {linkedTasks.length > 0 ? (
                  linkedTasks.map((task, i) => (
                    <div key={task._id || i} className="linked-row">
                      <span className="linked-badge tone-purple">TASK</span>
                      <span className="mono">{task._id?.slice(-6) || task.id}</span>
                      <span>{task.title}</span>
                      <Badge tone={task.status === 'todo' ? 'amber' : task.status === 'in_progress' ? 'blue' : task.status === 'review' ? 'purple' : 'navy'} soft>
                        {task.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-400">No linked tasks</div>
                )}
                
                {/* Legacy linked items from ticket object */}
                {currentTicket.linkedItems && currentTicket.linkedItems.length > 0 && (
                  currentTicket.linkedItems.map((item, i) => (
                    <div key={i} className="linked-row">
                      <span className={`linked-badge tone-${item.type === 'pr' ? 'navy' : item.type === 'task' ? 'purple' : 'green'}`}>{item.type?.toUpperCase()}</span>
                      <span className="mono">{item.id}</span>
                      <span>{item.title}</span>
                      <Badge tone={item.status === 'open' ? 'amber' : item.status === 'in_progress' ? 'blue' : 'navy'} soft>{item.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="detail-side">
          <Card>
            <SectionHead title="Properties"/>
            <div className="prop-list">
              <div className="prop"><div className="prop-k">Status</div><div className="prop-v"><StatusPill status={status}/></div></div>
              <div className="prop"><div className="prop-k">Priority</div><div className="prop-v"><PriorityChip priority={ticketData.priority}/></div></div>
              {/* Project - Editable dropdown for admin/manager */}
              <div className="kv">
                <span className="k">Project</span>
                {(role === 'admin' || role === 'manager') && !isClosedOrResolved ? (
                  <select 
                    className="select" 
                    style={{ width: 'auto', minWidth: '140px' }}
                    value={ticketData.projectId || ticketData.project || ''}
                    onChange={async (e) => {
                      const newProjectId = e.target.value;
                      const selectedProject = projects.find(p => (p._id || p.id) === newProjectId) || PROJECTS.find(p => (p._id || p.id) === newProjectId);
                      const projectName = selectedProject?.name || selectedProject?.title || 'None';
                      try {
                        console.log('Changing project to:', { projectId: newProjectId, projectName });
                        const res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}`, {
                          method: 'PUT',
                          body: {
                            projectId: newProjectId || null,
                            projectName: projectName
                          }
                        });
                        if (res) {
                          const data = await res.json();
                          console.log('Project update response:', data);
                          if (data.success) {
                            setCurrentTicket(prev => ({ 
                              ...prev, 
                              projectId: newProjectId,
                              project: newProjectId,
                              projectName: projectName
                            }));
                            showToast('Project updated to ' + projectName, 'success');
                          } else {
                            showToast(data.message || 'Failed to update project', 'error');
                          }
                        }
                      } catch (err) {
                        console.error('Failed to update project:', err);
                        showToast('Failed to update project', 'error');
                      }
                    }}
                  >
                    <option value="">No Project</option>
                    {(projects.length > 0 ? projects : PROJECTS).map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title}</option>
                    ))}
                  </select>
                ) : (
                  <span className="v">{project?.name || ticketData.projectName || ticketData.project || '—'}</span>
                )}
              </div>
              
              {/* Assignee - Editable dropdown for admin/manager */}
              <div className="kv">
                <span className="k">Assignee</span>
                {(role === 'admin' || role === 'manager') && !isClosedOrResolved ? (
                  <select 
                    className="select" 
                    style={{ width: 'auto', minWidth: '140px' }}
                    value={ticketData.assigneeId || ticketData.assignee || ''}
                    onChange={async (e) => {
                      const newAssigneeId = e.target.value;
                      const selectedResource = resources.find(r => (r._id || r.id) === newAssigneeId);
                      const assigneeName = selectedResource?.name || 'Unassigned';
                      try {
                        console.log('Assigning ticket to:', { assigneeId: newAssigneeId, assigneeName });
                        const res = await fetchWithAuth(`${API_BASE}/tickets/${ticketId}/assign`, {
                          method: 'PUT',
                          body: {
                            assignee: assigneeName,
                            assigneeId: newAssigneeId || null,
                            changedBy: authUser?.name || 'Admin'
                          }
                        });
                        if (res) {
                          const data = await res.json();
                          console.log('Assign response:', data);
                          if (data.success) {
                            setCurrentTicket(prev => ({ 
                              ...prev, 
                              assigneeId: newAssigneeId,
                              assignee: assigneeName,
                              assigneeName: assigneeName
                            }));
                            showToast('Ticket assigned to ' + assigneeName, 'success');
                            // Refresh ticket data and activity to show assignment change
                            await fetchTicketDetail();
                            await fetchActivity();
                          } else {
                            showToast(data.message || 'Failed to assign', 'error');
                          }
                        }
                      } catch (err) {
                        console.error('Failed to assign ticket:', err);
                        showToast('Failed to assign ticket', 'error');
                      }
                    }}
                  >
                    <option value="">Unassigned</option>
                    {resources.map(r => (
                      <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="v">{assignee?.name || ticketData.assigneeName || 'Unassigned'}</span>
                )}
              </div>
              
              <div className="prop"><div className="prop-k">Reporter</div><div className="prop-v">{reporterName || '—'}</div></div>
              
              {/* Client - Read only, mapped at creation time */}
              <div className="kv">
                <span className="k">Client</span>
                <span className="v">{clientName || '—'}</span>
              </div>
              
              <div className="prop"><div className="prop-k">Category</div><div className="prop-v">{ticketData.category || '—'}</div></div>
              <div className="prop"><div className="prop-k">SLA</div><div className="prop-v sla-warn">{ticketData.sla || '—'}</div></div>
              <div className="prop"><div className="prop-k">Opened</div><div className="prop-v">{openedText || '—'}</div></div>
            </div>
          </Card>

          <Card>
            <SectionHead title="SLA timer"/>
            <div className="sla-timer">
              <Donut value={75} size={92} stroke={10} color="#d97706" label={<><strong>4h</strong><span>left</span></>}/>
              <div className="sla-bullets">
                <div><span className="bullet-dot" style={{background:'#65bb3c'}}/> First response · met</div>
                <div><span className="bullet-dot" style={{background:'#d97706'}}/> Resolution · 4h left</div>
                <div><span className="bullet-dot" style={{background:'#a8a29e'}}/> Tier: Premium · 8h</div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHead title="Watchers"/>
            <div className="watchers">
              <AvatarStack ids={['u1','u3','u5','u7']} size={26}/>
              <button className="link-btn">+ Add watcher</button>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreated={handleTaskCreated}
        ticketId={ticketId}
        projectId={ticketData.projectId || ticketData.project}
        assignees={resources}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#65bb3c' : '#dc2626',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TicketsScreen, TicketDetail });

export { TicketsScreen, TicketDetail };
export default TicketsScreen;
