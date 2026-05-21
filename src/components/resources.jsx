// Resource Allocation board
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useAppState } from './app-state'
import { Button, Card, Ic, Avatar, ProgressBar } from './ui'
import { fetchResources, fetchAllocationStats } from '../store/slices/resourcesSlice';
import { fetchWithAuth, API_BASE } from '../utils/api';

function ResourcesScreen() {
  const dispatch = useDispatch();
  const { allocations, moveAllocation } = useAppState();
  const [week, setWeek] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(null);
  const [dragging, setDragging] = React.useState(null);
  
  // Ticket assignment modal state
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [unassignedTickets, setUnassignedTickets] = React.useState([]);
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [selectedResource, setSelectedResource] = React.useState(null);
  const [assigning, setAssigning] = React.useState(false);
  
  // Create resource modal state
  const [showCreateResourceModal, setShowCreateResourceModal] = React.useState(false);
  const [creatingResource, setCreatingResource] = React.useState(false);
  
  // Redux selectors
  const resources = useSelector(state => state.resources.resources);
  const loading = useSelector(state => state.resources.loading);
  
  const weeks = ['May 13 – May 19', 'May 20 – May 26', 'May 27 – Jun 2', 'Jun 3 – Jun 9'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const projectTones = {
    p1: '#15348a', p2: '#d97706', p3: '#65bb3c', p4: '#7c3aed', p5: '#2f5fd3',
  };

  const allocFor = (person, dayIdx) => allocations[person.id]?.[dayIdx] || [];
  
  // Fetch resources from API
  React.useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchAllocationStats());
  }, [dispatch]);
  
  // Fetch unassigned tickets for assignment
  const fetchUnassignedTickets = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/tickets/unassigned/list`);
      if (res) {
        const data = await res.json();
        setUnassignedTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch unassigned tickets:', err);
      setUnassignedTickets([]);
    }
  };
  
  // Open assign modal
  const openAssignModal = async () => {
    await fetchUnassignedTickets();
    setShowAssignModal(true);
  };
  
  // Handle ticket assignment
  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedResource) return;
    
    setAssigning(true);
    try {
      const res = await fetchWithAuth(
        `${API_BASE}/tickets/${selectedTicket._id}/assign`,
        {
          method: 'PUT',
          body: JSON.stringify({
            assignee: selectedResource.name,
            assigneeId: selectedResource.id,
            assigneeInitials: selectedResource.initials
          })
        }
      );
      
      if (res && res.ok) {
        setUnassignedTickets(prev => prev.filter(t => t._id !== selectedTicket._id));
        setSelectedTicket(null);
        setSelectedResource(null);
        if (unassignedTickets.length <= 1) {
          setShowAssignModal(false);
        }
      }
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    } finally {
      setAssigning(false);
    }
  };
  
  // Map API data to display format
  const displayResources = resources.map((r, idx) => ({
    id: r._id || r.id || idx,
    name: r.name || 'Unknown',
    initials: r.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
    hue: 200 + (idx * 30),
    role: r.title || r.role || 'Resource',
    capacity: r.capacity || 40,
    allocated: r.workload?.activeTasks * 4 || r.allocated || 0,
  }));
  
  // Calculate summary stats from API data
  const totalPeople = displayResources.length;
  const totalCapacity = totalPeople * 40;
  const totalAllocated = displayResources.reduce((sum, r) => sum + (r.allocated || 0), 0);
  const overbookedCount = displayResources.filter(r => (r.allocated || 0) > 40).length;
  const utilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="alloc-weeks">
          <IconBtn icon={<Ic.chevR width={14} height={14} style={{transform:'rotate(180deg)'}}/>} onClick={() => setWeek(w => Math.max(0,w-1))}/>
          <div className="alloc-week-label">{weeks[week]}</div>
          <IconBtn icon={<Ic.chevR width={14} height={14}/>} onClick={() => setWeek(w => Math.min(weeks.length-1,w+1))}/>
          <Button variant="ghost" size="sm">Today</Button>
        </div>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>All depts</Button>
          <Button variant="ghost" size="sm" icon={<Ic.people width={14} height={14}/>}>Group by role</Button>
          <Button variant="secondary" size="sm" icon={<Ic.plus width={14} height={14}/>} onClick={() => setShowCreateResourceModal(true)}>Add Resource</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>} onClick={openAssignModal}>Assign Ticket</Button>
        </div>
      </div>

      {/* Capacity summary tiles */}
      <div className="alloc-summary">
        <div className="alloc-tile"><div className="alloc-tile-num">{totalPeople}</div><div className="alloc-tile-label">People</div></div>
        <div className="alloc-tile"><div className="alloc-tile-num">{totalCapacity}h</div><div className="alloc-tile-label">Capacity / wk</div></div>
        <div className="alloc-tile"><div className="alloc-tile-num">{totalAllocated}h</div><div className="alloc-tile-label">Allocated</div></div>
        <div className="alloc-tile alloc-tile-warn"><div className="alloc-tile-num">{overbookedCount}</div><div className="alloc-tile-label">Overbooked</div></div>
        <div className="alloc-tile alloc-tile-good"><div className="alloc-tile-num">{utilization}%</div><div className="alloc-tile-label">Utilization</div></div>
      </div>

      {loading ? (
        <Card><div className="p-8 text-center text-gray-500">Loading resources...</div></Card>
      ) : displayResources.length === 0 ? (
        <Card><div className="p-8 text-center text-gray-500">No resources found</div></Card>
      ) : (
        <Card pad={false} className="alloc-grid-card">
          <div className="alloc-grid">
            <div className="alloc-row alloc-head">
              <div className="alloc-person-head">Person</div>
              {days.map(d => <div key={d} className="alloc-day-head">{d}</div>)}
              <div className="alloc-total-head">Total</div>
            </div>
            {displayResources.map((person, idx) => {
              const total = days.reduce((sum, _, i) => sum + allocFor(person, i).reduce((a,c) => a+c.hours, 0), 0) + (person.allocated || 0) * 0.2;
              const tone = total > 40 ? 'red' : total >= 36 ? 'amber' : 'navy';
              return (
                <div key={person.id || idx} className="alloc-row">
                  <div className="alloc-person">
                    <Avatar initials={person.initials} hue={person.hue || 200 + (idx * 30)} size={32}/>
                    <div>
                      <div className="alloc-name">{person.name}</div>
                      <div className="muted small">{person.role}</div>
                    </div>
                  </div>
                  {days.map((d, di) => {
                    const chips = allocFor(person, di);
                    const dayTotal = chips.reduce((a,c) => a+c.hours, 0);
                    const cellKey = `${person.id}:${di}`;
                    const isOver = dragOver === cellKey;
                    return (
                      <div key={d}
                        className={`alloc-day ${isOver ? 'is-drop-target' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(cellKey); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          const payload = e.dataTransfer.getData('text/plain');
                          if (!payload) return;
                          const [chipId, fromPerson, fromDay] = payload.split('|');
                          moveAllocation(chipId, fromPerson, parseInt(fromDay,10), person.id, di);
                          setDragOver(null);
                          setDragging(null);
                        }}
                      >
                        {chips.map((c, ci) => {
                          const color = c.tone || projectTones[c.projectId] || '#a8a29e';
                          return (
                            <div key={c.id || ci}
                              className={`alloc-chip ${dragging === c.id ? 'is-dragging' : ''}`}
                              style={{ background: `${color}15`, borderLeft: `3px solid ${color}` }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', `${c.id}|${person.id}|${di}`);
                                e.dataTransfer.effectAllowed = 'move';
                                setDragging(c.id);
                              }}
                              onDragEnd={() => setDragging(null)}
                            >
                              <div className="alloc-chip-name">{c.label || c.projectId || 'General'}</div>
                              <div className="alloc-chip-hours mono">{c.hours}h</div>
                            </div>
                          );
                        })}
                        {dayTotal === 0 && <div className="alloc-empty muted">—</div>}
                        {dayTotal > 8 && <div className="alloc-overbook">!</div>}
                      </div>
                    );
                  })}
                  <div className={`alloc-total tone-${tone}`}>
                    <span className="mono"><strong>{Math.round(total)}h</strong> / 40h</span>
                    <ProgressBar value={total} max={40} tone={tone} height={4}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Ticket Assignment Modal */}
      {showAssignModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowAssignModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div 
            className="modal" 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '700px',
              maxHeight: 'calc(100vh - 32px)',
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 32px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111827' }}>
                  Assign Ticket
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Assign unassigned tickets to resources
                </p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ 
              padding: '24px 32px',
              overflowY: 'auto',
              flex: 1
            }}>
              {unassignedTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                  <h4 style={{ margin: '0 0 8px', color: '#111827' }}>All tickets are assigned!</h4>
                  <p style={{ margin: 0, color: '#6b7280' }}>There are no unassigned tickets at the moment.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Step 1: Select Ticket */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                      1. Select Ticket ({unassignedTickets.length} unassigned)
                    </h4>
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {unassignedTickets.map(ticket => (
                        <div
                          key={ticket._id}
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: selectedTicket?._id === ticket._id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            background: selectedTicket?._id === ticket._id ? '#eff6ff' : '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                            {ticket.title}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              background: ticket.priority === 'urgent' ? '#fee2e2' : ticket.priority === 'high' ? '#fef3c7' : '#dbeafe',
                              color: ticket.priority === 'urgent' ? '#dc2626' : ticket.priority === 'high' ? '#d97706' : '#2563eb'
                            }}>
                              {ticket.priority}
                            </span>
                            <span style={{ color: '#6b7280' }}>{ticket.clientName || ticket.clientId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Resource */}
                  {selectedTicket && (
                    <div>
                      <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                        2. Assign to Resource
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {displayResources.map(resource => (
                          <div
                            key={resource.id}
                            onClick={() => setSelectedResource(resource)}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: selectedResource?.id === resource.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                              background: selectedResource?.id === resource.id ? '#eff6ff' : '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <Avatar initials={resource.initials} hue={resource.hue} size={36} />
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                                {resource.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {resource.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignment Summary */}
                  {selectedTicket && selectedResource && (
                    <div style={{
                      padding: '16px',
                      background: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #86efac'
                    }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#166534' }}>
                        Assignment Ready
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>
                        Assign "<strong>{selectedTicket.title}</strong>" to <strong>{selectedResource.name}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {unassignedTickets.length > 0 && (
              <div style={{
                padding: '16px 32px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '10px 20px',
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
                  onClick={handleAssignTicket}
                  disabled={!selectedTicket || !selectedResource || assigning}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#fff',
                    background: !selectedTicket || !selectedResource ? '#9ca3af' : '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !selectedTicket || !selectedResource ? 'not-allowed' : 'pointer'
                  }}
                >
                  {assigning ? 'Assigning...' : 'Assign Ticket'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Resource Modal */}
      {showCreateResourceModal && (
        <CreateUserModal
          open={showCreateResourceModal}
          onClose={() => setShowCreateResourceModal(false)}
          defaultRole="resource"
          onCreated={() => {
            dispatch(fetchResources());
            setShowCreateResourceModal(false);
          }}
        />
      )}
    </div>
  );
}

// Reusable Create User Modal - can be used for HR, Resources, etc.
function CreateUserModal({ open, onClose, defaultRole = 'resource', onCreated }) {
  // Basic Info
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [department, setDepartment] = React.useState('');
  
  // Work Details
  const [skills, setSkills] = React.useState('');
  const [capacity, setCapacity] = React.useState(40);
  const [bio, setBio] = React.useState('');
  
  // HR / Payroll
  const [employeeId, setEmployeeId] = React.useState('');
  const [joiningDate, setJoiningDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [monthlySalary, setMonthlySalary] = React.useState('');
  const [bankAccount, setBankAccount] = React.useState('');
  const [bankIfsc, setBankIfsc] = React.useState('');
  const [panNumber, setPanNumber] = React.useState('');
  const [uanNumber, setUanNumber] = React.useState('');
  
  // UI State
  const [activeTab, setActiveTab] = React.useState('basic');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [createdUser, setCreatedUser] = React.useState(null);
  const [generatedPassword, setGeneratedPassword] = React.useState('');

  // Role is always 'resource' on this page
  const role = defaultRole || 'resource';

  const departments = ['Engineering', 'Design', 'QA', 'DevOps', 'Product', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  const skillOptions = ['React', 'Node.js', 'Python', 'UI/UX', 'DevOps', 'Testing', 'Project Management', 'Salesforce', 'AWS', 'Docker', 'Kubernetes', 'Mobile', 'API Design', 'Java', 'PHP', 'Go', 'Ruby'];

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');
    
    // Auto-generate password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);

    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          phone: phone.trim() || undefined,
          title: title.trim() || undefined,
          department: department || undefined,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          capacity: parseInt(capacity) || 40,
          employeeId: employeeId.trim() || undefined,
          joiningDate: joiningDate || undefined,
          monthlySalary: monthlySalary ? parseFloat(monthlySalary) : undefined,
          bankAccount: bankAccount.trim() || undefined,
          bankIfsc: bankIfsc.trim() || undefined,
          panNumber: panNumber.trim().toUpperCase() || undefined,
          uanNumber: uanNumber.trim() || undefined,
          bio: bio.trim() || undefined,
        }),
      });

      if (!res) {
        setError('Authentication failed');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create user');
        return;
      }

      setCreatedUser(data.user);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset everything
    setName('');
    setEmail('');
    setPhone('');
    setTitle('');
    setDepartment('');
    setSkills('');
    setCapacity(40);
    setBio('');
    setEmployeeId('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setMonthlySalary('');
    setBankAccount('');
    setBankIfsc('');
    setPanNumber('');
    setUanNumber('');
    setActiveTab('basic');
    setError('');
    setCreatedUser(null);
    setGeneratedPassword('');
    onClose();
  };

  if (!open) return null;
  
  // Success screen after creation
  if (createdUser) {
    return (
      <div className="modal-backdrop" onClick={handleClose}>
        <div className="modal" style={{ width: '100%', maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✅
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600, color: '#166534' }}>
              Resource Created!
            </h3>
            <p style={{ margin: '0 0 24px', color: '#64748b' }}>
              {createdUser.name} has been added successfully
            </p>
            
            {/* Password Card */}
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #3b82f6',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                🔐 Auto-generated Password (share securely):
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fff',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <code style={{ 
                  fontSize: '18px', 
                  fontFamily: 'monospace',
                  color: '#1e293b',
                  letterSpacing: '1px'
                }}>
                  {generatedPassword}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    alert('Password copied!');
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        background: activeTab === id ? '#3b82f6' : 'transparent',
        color: activeTab === id ? '#fff' : '#64748b',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '22px'
            }}>
              👤
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '20px' }}>Create Resource</div>
              <div className="modal-sub">Add team member with HR & Payroll details</div>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          padding: '12px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <TabButton id="basic" label="Basic Info" icon="📋" />
          <TabButton id="work" label="Work Details" icon="💼" />
          <TabButton id="hr" label="HR & Payroll" icon="💰" />
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <div className="field-group">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Full Name <span className="field-req">*</span></label>
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. John Smith"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label className="field-label">Email <span className="field-req">*</span></label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Phone Number</label>
                  <input
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Role</label>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1d4ed8'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                    Resource
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Job Title</label>
                  <input
                    className="input"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Department</label>
                  <select className="input" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* WORK TAB */}
          {activeTab === 'work' && (
            <div className="field-group">
              <div className="field">
                <label className="field-label">Skills <span className="field-hint">comma separated</span></label>
                <input
                  className="input"
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, UI/UX"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {skillOptions.map(skill => (
                    <span
                      key={skill}
                      onClick={() => setSkills(prev => prev ? `${prev}, ${skill}` : skill)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Weekly Capacity <span className="field-hint">hours/week</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      className="input"
                      type="number"
                      min="20"
                      max="60"
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      style={{ width: '80px' }}
                    />
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="5"
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Employee ID</label>
                  <input
                    className="input"
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP001"
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Bio / Notes</label>
                <textarea
                  className="input textarea"
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Experience, certifications, education..."
                />
              </div>
            </div>
          )}

          {/* HR & PAYROLL TAB */}
          {activeTab === 'hr' && (
            <div className="field-group">
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                💰 Payroll Information (Optional) - Used for salary processing
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Joining Date</label>
                  <input
                    className="input"
                    type="date"
                    value={joiningDate}
                    onChange={e => setJoiningDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Monthly Salary <span className="field-hint">INR</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>₹</span>
                    <input
                      className="input"
                      type="number"
                      value={monthlySalary}
                      onChange={e => setMonthlySalary(e.target.value)}
                      placeholder="50000"
                      style={{ paddingLeft: '28px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Bank Account Number</label>
                  <input
                    className="input"
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div className="field">
                  <label className="field-label">IFSC Code</label>
                  <input
                    className="input"
                    type="text"
                    value={bankIfsc}
                    onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">PAN Number</label>
                  <input
                    className="input"
                    type="text"
                    value={panNumber}
                    onChange={e => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="field">
                  <label className="field-label">UAN Number <span className="field-hint">EPF</span></label>
                  <input
                    className="input"
                    type="text"
                    value={uanNumber}
                    onChange={e => setUanNumber(e.target.value)}
                    placeholder="12-digit UAN"
                    maxLength={12}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                � Password will be auto-generated
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {activeTab !== 'hr' && (
                <Button variant="secondary" size="sm" onClick={() => setActiveTab(activeTab === 'basic' ? 'work' : 'hr')}>
                  Next →
                </Button>
              )}
              {activeTab === 'hr' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSubmit}
                  disabled={loading || !name.trim() || !email.trim()}
                >
                  {loading ? 'Creating...' : '✓ Create Resource'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export utilities for use across the app
export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Reset password for existing user (can be used in user management)
export const resetUserPassword = async (userId) => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/auth/users/${userId}/reset-password`, {
      method: 'POST'
    });
    if (!res) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to reset password:', err);
    return null;
  }
};

Object.assign(window, { ResourcesScreen, CreateUserModal, generatePassword, resetUserPassword });

export default ResourcesScreen;
