// Clients management screen
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, SectionHead, Tabs, Badge, Avatar, Ic, StatusPill } from './ui';
import { fetchWithAuth, API_BASE } from '../utils/api';

function ClientsScreen({ role, authUser }) {
  const dispatch = useDispatch();
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState('grid');
  const [exportMode, setExportMode] = React.useState(false); // false = INR, true = USD
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState(null);
  const [newClient, setNewClient] = React.useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    taxId: '',
    billingEmail: '',
    paymentTerms: 'Net 30',
    notes: '',
    isExport: false // false = INR, true = USD
  });
  const [creating, setCreating] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  
  // Client detail view
  const [viewingClient, setViewingClient] = React.useState(null);
  const [clientTickets, setClientTickets] = React.useState([]);
  const [clientProjects, setClientProjects] = React.useState([]);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  // Fetch clients
  React.useEffect(() => {
    if (!authUser) return;
    fetchClients();
  }, [authUser]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/users?role=client`);
      if (!res) return;
      const data = await res.json();
      if (data.users) {
        setClients(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const searchLower = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower) ||
      (c.company || '').toLowerCase().includes(searchLower)
    );
  });

  // Create client
  const handleCreateClient = async () => {
    if (!newClient.name.trim() || !newClient.email.trim()) {
      alert('Name and email are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: {
          name: newClient.name,
          email: newClient.email,
          role: 'client',
          company: newClient.company,
          phone: newClient.phone,
          status: newClient.status,
          password: 'welcome123', // Default password
          address: newClient.address,
          city: newClient.city,
          state: newClient.state,
          zipCode: newClient.zipCode,
          country: newClient.country,
          taxId: newClient.taxId,
          billingEmail: newClient.billingEmail,
          paymentTerms: newClient.paymentTerms,
          notes: newClient.notes
        },
      });
      if (!res) return;
      const data = await res.json();
      if (data.user) {
        setNewClient({ 
          name: '', email: '', company: '', phone: '', status: 'active',
          address: '', city: '', state: '', zipCode: '', country: 'India',
          taxId: '', billingEmail: '', paymentTerms: 'Net 30', notes: ''
        });
        setShowCreateModal(false);
        fetchClients();
      }
    } catch (err) {
      console.error('Failed to create client:', err);
      alert('Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  // Edit client
  const handleEditClient = async () => {
    if (!editingClient?.name?.trim() || !editingClient?.email?.trim()) {
      alert('Name and email are required');
      return;
    }
    setUpdating(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/users/${editingClient._id || editingClient.id}`, {
        method: 'PUT',
        body: {
          name: editingClient.name,
          email: editingClient.email,
          company: editingClient.company,
          phone: editingClient.phone,
          status: editingClient.status,
          address: editingClient.address,
          city: editingClient.city,
          state: editingClient.state,
          zipCode: editingClient.zipCode,
          country: editingClient.country,
          taxId: editingClient.taxId,
          billingEmail: editingClient.billingEmail,
          paymentTerms: editingClient.paymentTerms,
          notes: editingClient.notes
        },
      });
      if (!res) return;
      const data = await res.json();
      if (data.user) {
        setShowEditModal(false);
        setEditingClient(null);
        fetchClients();
      }
    } catch (err) {
      console.error('Failed to update client:', err);
      alert('Failed to update client');
    } finally {
      setUpdating(false);
    }
  };

  // Delete client
  const handleDeleteClient = async (client) => {
    if (!confirm(`Are you sure you want to delete ${client.name || client.email}?`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/users/${client._id || client.id}`, {
        method: 'DELETE',
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        fetchClients();
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
      alert('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const openEditModal = (client) => {
    setEditingClient({ ...client });
    setShowEditModal(true);
  };

  // Open client detail view
  const openClientDetail = async (client) => {
    setViewingClient(client);
    setLoadingDetails(true);
    
    // Fetch tickets for this client
    try {
      const ticketsRes = await fetchWithAuth(`${API_BASE}/tickets?clientId=${client.email}`);
      if (ticketsRes) {
        const ticketsData = await ticketsRes.json();
        setClientTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch client tickets:', err);
      setClientTickets([]);
    }
    
    // Fetch projects for this client
    try {
      const projectsRes = await fetchWithAuth(`${API_BASE}/projects?clientId=${client.email}`);
      if (projectsRes) {
        const projectsData = await projectsRes.json();
        setClientProjects(projectsData.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch client projects:', err);
      setClientProjects([]);
    }
    
    setLoadingDetails(false);
  };

  // Currency display helper
  const getCurrency = (isExportClient) => {
    return isExportClient ? 'USD' : 'INR';
  };

  return (
    <div className="page">
      {/* Header - Responsive */}
      <div className="page-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <Tabs tabs={[{id:'grid',label:'Grid'},{id:'list',label:'List'}]} active={view} onChange={setView}/>
        <div 
          className="toolbar-right" 
          style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Export Toggle */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 12px',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
              {exportMode ? 'USD ($)' : 'INR (₹)'}
            </span>
            <button
              onClick={() => setExportMode(!exportMode)}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                border: 'none',
                background: exportMode ? '#3b82f6' : '#10b981',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: exportMode ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s'
                }}
              />
            </button>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {exportMode ? 'Export' : 'Domestic'}
            </span>
          </div>

          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              width: 'clamp(150px, 30vw, 200px)'
            }}
          />
          {canCreate && (
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Ic.plus width={14} height={14}/>} 
              onClick={() => setShowCreateModal(true)}
            >
              New client
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div style={{ color: '#6b7280' }}>Loading clients...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6b7280', marginBottom: '8px' }}>No clients found</div>
            {canCreate && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Add your first client
              </Button>
            )}
          </div>
        </div>
      ) : view === 'grid' ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredClients.map(client => (
            <Card key={client._id || client.id} style={{ padding: '20px', minWidth: 0, cursor: 'pointer' }} onClick={() => openClientDetail(client)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <Avatar name={client.name} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827', wordBreak: 'break-word' }}>
                    {client.name || 'Unnamed'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', wordBreak: 'break-word' }}>{client.email}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <StatusPill status={client.status || 'active'} />
                  {/* Currency Badge */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: client.isExport ? '#dbeafe' : '#d1fae5',
                    color: client.isExport ? '#1e40af' : '#065f46'
                  }}>
                    {client.isExport ? 'USD' : 'INR'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                {client.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                    <Ic.building width={14} height={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.company}
                    </span>
                  </div>
                )}
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                    <span style={{ fontSize: '12px' }}>📞</span>
                    {client.phone}
                  </div>
                )}
                {client.country && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                    <Ic.flag width={14} height={14} />
                    {client.country}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                  <Ic.calendar width={14} height={14} />
                  Joined {new Date(client.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '16px', 
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                flexWrap: 'wrap'
              }}>
                <Button variant="secondary" size="sm" onClick={() => openEditModal(client)}>Edit</Button>
                {canDelete && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)} disabled={deleting}>Delete</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card pad={false} style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '700px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 2fr 1.5fr 80px 80px 1fr',
              padding: '12px 16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6b7280'
            }}>
              <div>Client</div>
              <div>Contact</div>
              <div>Company</div>
              <div>Status</div>
              <div>Currency</div>
              <div>Actions</div>
            </div>
            {filteredClients.map(client => (
              <div 
                key={client._id || client.id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 2fr 1.5fr 80px 80px 1fr',
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '14px',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <Avatar name={client.name} size={32} />
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.name || 'Unnamed'}
                  </span>
                </div>
                <div style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.email}
                </div>
                <div style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.company || '-'}
                </div>
                <div><StatusPill status={client.status || 'active'} /></div>
                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: client.isExport ? '#dbeafe' : '#d1fae5',
                    color: client.isExport ? '#1e40af' : '#065f46'
                  }}>
                    {client.isExport ? 'USD' : 'INR'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(client)}>Edit</Button>
                  {canDelete && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)} disabled={deleting}>Delete</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Client Modal - Full Screen Responsive */}
      {showCreateModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCreateModal(false)}
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
              maxWidth: '900px',
              maxHeight: 'calc(100vh - 32px)',
              height: 'auto',
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
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#111827' }}>
                  Add new client
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Create a new client account with billing details
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = '#e5e7eb'}
                onMouseLeave={e => e.target.style.background = '#f3f4f6'}
              >
                ×
              </button>
            </div>

            {/* Body - Scrollable Two Column Layout */}
            <div style={{ 
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
              }}>
                {/* Left Column - Basic Info */}
                <div>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    Basic Information
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Full name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      value={newClient.name}
                      onChange={e => setNewClient({...newClient, name: e.target.value})}
                      placeholder="Enter client's full name"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={e => setNewClient({...newClient, email: e.target.value})}
                      placeholder="client@company.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Company
                    </label>
                    <input
                      value={newClient.company}
                      onChange={e => setNewClient({...newClient, company: e.target.value})}
                      placeholder="Company name"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Phone
                    </label>
                    <input
                      value={newClient.phone}
                      onChange={e => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  {/* Export Toggle */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                      Client Type
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setNewClient({...newClient, isExport: false})}
                        style={{
                          flex: 1,
                          padding: '16px',
                          borderRadius: '10px',
                          border: newClient.isExport ? '1px solid #d1d5db' : '2px solid #10b981',
                          background: newClient.isExport ? '#fff' : '#d1fae5',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>₹</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: newClient.isExport ? '#6b7280' : '#065f46' }}>
                          Domestic (INR)
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewClient({...newClient, isExport: true})}
                        style={{
                          flex: 1,
                          padding: '16px',
                          borderRadius: '10px',
                          border: newClient.isExport ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          background: newClient.isExport ? '#dbeafe' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>$</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: newClient.isExport ? '#1e40af' : '#6b7280' }}>
                          Export (USD)
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Billing Info */}
                <div>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    Billing Information
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Street Address
                    </label>
                    <input
                      value={newClient.address}
                      onChange={e => setNewClient({...newClient, address: e.target.value})}
                      placeholder="123 Business Street"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        City
                      </label>
                      <input
                        value={newClient.city}
                        onChange={e => setNewClient({...newClient, city: e.target.value})}
                        placeholder="Mumbai"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        State
                      </label>
                      <input
                        value={newClient.state}
                        onChange={e => setNewClient({...newClient, state: e.target.value})}
                        placeholder="Maharashtra"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        ZIP / Postal Code
                      </label>
                      <input
                        value={newClient.zipCode}
                        onChange={e => setNewClient({...newClient, zipCode: e.target.value})}
                        placeholder="400001"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        Country
                      </label>
                      <select
                        value={newClient.country}
                        onChange={e => setNewClient({...newClient, country: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          background: '#fff'
                        }}
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        GST / Tax ID
                      </label>
                      <input
                        value={newClient.taxId}
                        onChange={e => setNewClient({...newClient, taxId: e.target.value})}
                        placeholder="27AABCU9603R1ZM"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                        Billing Email
                      </label>
                      <input
                        type="email"
                        value={newClient.billingEmail}
                        onChange={e => setNewClient({...newClient, billingEmail: e.target.value})}
                        placeholder="billing@company.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Payment Terms
                    </label>
                    <select
                      value={newClient.paymentTerms}
                      onChange={e => setNewClient({...newClient, paymentTerms: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: '#fff'
                      }}
                    >
                      <option value="Net 15">Net 15 (Due in 15 days)</option>
                      <option value="Net 30">Net 30 (Due in 30 days)</option>
                      <option value="Net 45">Net 45 (Due in 45 days)</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Notes
                    </label>
                    <textarea
                      value={newClient.notes}
                      onChange={e => setNewClient({...newClient, notes: e.target.value})}
                      placeholder="Additional notes about the client..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 32px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0
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
                onClick={handleCreateClient}
                disabled={creating || !newClient.name.trim() || !newClient.email.trim()}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  background: creating || !newClient.name.trim() || !newClient.email.trim() ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: creating || !newClient.name.trim() || !newClient.email.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creating...' : 'Create client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowEditModal(false)}
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
              maxWidth: '900px',
              maxHeight: 'calc(100vh - 32px)',
              height: 'auto',
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
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#111827' }}>
                  Edit client
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Update client information and billing details
                </p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#f3f4f6',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = '#e5e7eb'}
                onMouseLeave={e => e.target.style.background = '#f3f4f6'}
              >
                ×
              </button>
            </div>

            {/* Body - Scrollable Two Column Layout */}
            <div style={{ 
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
              }}>
                {/* Left Column - Basic Info */}
                <div>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    Basic Information
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Full name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={editingClient.name || ''}
                  onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                  placeholder="Enter client's full name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={editingClient.email || ''}
                  onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                  placeholder="client@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Company
                </label>
                <input
                  value={editingClient.company || ''}
                  onChange={e => setEditingClient({...editingClient, company: e.target.value})}
                  placeholder="Company name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Phone
                </label>
                <input
                  value={editingClient.phone || ''}
                  onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Export Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                  Client Type
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingClient({...editingClient, isExport: false})}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: editingClient.isExport ? '1px solid #d1d5db' : '2px solid #10b981',
                      background: editingClient.isExport ? '#fff' : '#d1fae5',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>₹</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: editingClient.isExport ? '#6b7280' : '#065f46' }}>
                      Domestic (INR)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClient({...editingClient, isExport: true})}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: editingClient.isExport ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      background: editingClient.isExport ? '#dbeafe' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>$</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: editingClient.isExport ? '#1e40af' : '#6b7280' }}>
                      Export (USD)
                    </span>
                  </button>
                </div>
              </div>
                </div>

                {/* Right Column - Billing Info */}
                <div>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    Billing Information
                  </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Street Address
                </label>
                <input
                  value={editingClient.address || ''}
                  onChange={e => setEditingClient({...editingClient, address: e.target.value})}
                  placeholder="123 Business Street"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    value={editingClient.city || ''}
                    onChange={e => setEditingClient({...editingClient, city: e.target.value})}
                    placeholder="Mumbai"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    value={editingClient.state || ''}
                    onChange={e => setEditingClient({...editingClient, state: e.target.value})}
                    placeholder="Maharashtra"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    ZIP / Postal Code
                  </label>
                  <input
                    value={editingClient.zipCode || ''}
                    onChange={e => setEditingClient({...editingClient, zipCode: e.target.value})}
                    placeholder="400001"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Country
                  </label>
                  <select
                    value={editingClient.country || 'India'}
                    onChange={e => setEditingClient({...editingClient, country: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    GST / Tax ID
                  </label>
                  <input
                    value={editingClient.taxId || ''}
                    onChange={e => setEditingClient({...editingClient, taxId: e.target.value})}
                    placeholder="27AABCU9603R1ZM"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.billingEmail || ''}
                    onChange={e => setEditingClient({...editingClient, billingEmail: e.target.value})}
                    placeholder="billing@company.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Payment Terms
                  </label>
                  <select
                    value={editingClient.paymentTerms || 'Net 30'}
                    onChange={e => setEditingClient({...editingClient, paymentTerms: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                  >
                    <option value="Net 15">Net 15 (Due in 15 days)</option>
                    <option value="Net 30">Net 30 (Due in 30 days)</option>
                    <option value="Net 45">Net 45 (Due in 45 days)</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={editingClient.status || 'active'}
                    onChange={e => setEditingClient({...editingClient, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: '#fff'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                      Notes
                    </label>
                    <textarea
                      value={editingClient.notes || ''}
                      onChange={e => setEditingClient({...editingClient, notes: e.target.value})}
                      placeholder="Additional notes about the client..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 32px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0
            }}>
              <button
                onClick={() => setShowEditModal(false)}
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
                onClick={handleEditClient}
                disabled={updating || !editingClient?.name?.trim() || !editingClient?.email?.trim()}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  background: updating || !editingClient?.name?.trim() || !editingClient?.email?.trim() ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: updating || !editingClient?.name?.trim() || !editingClient?.email?.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {updating ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail View */}
      {viewingClient && (
        <div 
          className="modal-overlay" 
          onClick={() => setViewingClient(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
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
              maxWidth: '1000px',
              maxHeight: 'calc(100vh - 32px)',
              height: 'auto',
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
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar name={viewingClient.name} size={56} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#111827' }}>
                    {viewingClient.name}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                    {viewingClient.company} • {viewingClient.email}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: viewingClient.isExport ? '#dbeafe' : '#d1fae5',
                  color: viewingClient.isExport ? '#1e40af' : '#065f46'
                }}>
                  {viewingClient.isExport ? 'USD ($)' : 'INR (₹)'}
                </span>
                <Button variant="secondary" size="sm" onClick={() => { setViewingClient(null); openEditModal(viewingClient); }}>Edit</Button>
                <button 
                  onClick={() => setViewingClient(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#e5e7eb',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ 
              padding: '32px',
              overflowY: 'auto',
              flex: 1
            }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: '#6b7280' }}>Loading client details...</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Left Column - Contact Info */}
                  <div>
                    <Card style={{ padding: '20px', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Contact Information
                      </h4>
                      <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Email:</span>
                          <span>{viewingClient.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Phone:</span>
                          <span>{viewingClient.phone || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Billing Email:</span>
                          <span>{viewingClient.billingEmail || '-'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Billing Address
                      </h4>
                      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                        {viewingClient.address && <div>{viewingClient.address}</div>}
                        {(viewingClient.city || viewingClient.state) && (
                          <div>{viewingClient.city}{viewingClient.city && viewingClient.state && ', '}{viewingClient.state}</div>
                        )}
                        {(viewingClient.zipCode || viewingClient.country) && (
                          <div>{viewingClient.zipCode}{viewingClient.zipCode && viewingClient.country && ' '}{viewingClient.country}</div>
                        )}
                        {!viewingClient.address && !viewingClient.city && !viewingClient.state && <div style={{ color: '#9ca3af' }}>No address provided</div>}
                      </div>
                    </Card>
                  </div>

                  {/* Right Column - Projects & Tickets */}
                  <div>
                    {/* Analytics Summary */}
                    <Card style={{ padding: '20px', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Client Overview
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{clientProjects.length}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Projects</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{clientTickets.length}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Tickets</div>
                        </div>
                      </div>
                    </Card>

                    {/* Projects List */}
                    <Card style={{ padding: '20px', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Projects ({clientProjects.length})
                      </h4>
                      {clientProjects.length === 0 ? (
                        <div style={{ color: '#9ca3af', fontSize: '14px' }}>No projects found</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {clientProjects.map(project => (
                            <div key={project._id || project.id} style={{ 
                              padding: '12px', 
                              background: '#f9fafb', 
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>{project.name}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{project.status}</div>
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {project.progress || 0}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Tickets List */}
                    <Card style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        Recent Tickets ({clientTickets.length})
                      </h4>
                      {clientTickets.length === 0 ? (
                        <div style={{ color: '#9ca3af', fontSize: '14px' }}>No tickets found</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {clientTickets.slice(0, 5).map(ticket => (
                            <div key={ticket._id || ticket.id} style={{ 
                              padding: '12px', 
                              background: '#f9fafb', 
                              borderRadius: '8px',
                              borderLeft: '3px solid ' + (ticket.priority === 'urgent' ? '#ef4444' : ticket.priority === 'high' ? '#f59e0b' : '#3b82f6')
                            }}>
                              <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>{ticket.title}</div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                <StatusPill status={ticket.status} />
                                <span style={{ color: '#6b7280' }}>{ticket.priority}</span>
                              </div>
                            </div>
                          ))}
                          {clientTickets.length > 5 && (
                            <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', padding: '8px' }}>
                              +{clientTickets.length - 5} more tickets
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ClientsScreen };
export default ClientsScreen;
