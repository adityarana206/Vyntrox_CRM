// Modals — Create ticket, Create deal, plus the basic Modal shell.
// Open via window event:  window.dispatchEvent(new CustomEvent('open-modal',{detail:{type:'ticket'}}))
// Or pass openModal prop and call openModal('ticket' | 'deal').
import React from 'react'
import { AppStateContext } from './app-state'
import { fetchWithAuth, API_BASE } from '../utils/api'

function Modal({ open, onClose, children, width = 560, title, subtitle, footer, fullscreen = false }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  
  const modalStyle = fullscreen ? {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    borderRadius: 0,
    margin: 0,
  } : { width };
  
  const backdropStyle = fullscreen ? {
    padding: 0,
  } : {};
  
  return (
    <div className="modal-backdrop" onMouseDown={onClose} style={backdropStyle}>
      <div className="modal" style={modalStyle} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            {title && <div className="modal-title">{title}</div>}
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={fullscreen ? { maxHeight: 'calc(100vh - 140px)' } : {}}>{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, hint, children, required }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}{required && <span className="field-req">*</span>}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function CreateTicketModal({ open, onClose, onCreated, userRole, userProjects, userEmail }) {
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState('Medium');
  const [category, setCategory] = React.useState('Bug');
  const [client, setClient] = React.useState('');
  const [project, setProject] = React.useState((userProjects && userProjects[0]?._id) || '');
  const [assignee, setAssignee] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [clients, setClients] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  
  // Fetch clients, projects and resources when modal opens
  React.useEffect(() => {
    if (!open) return;
    
    async function fetchData() {
      try {
        // Fetch clients
        const clientsRes = await fetchWithAuth(`${API_BASE}/auth/users?role=client`);
        if (clientsRes) {
          const clientsData = await clientsRes.json();
          if (clientsData.users) {
            setClients(clientsData.users);
            if (clientsData.users.length > 0 && !client) {
              setClient(clientsData.users[0].email);
            }
          }
        }
        
        // Fetch projects for dropdown
        const projectsRes = await fetchWithAuth(`${API_BASE}/projects`);
        if (projectsRes) {
          const projectsData = await projectsRes.json();
          if (projectsData.projects) {
            setProjects(projectsData.projects);
            if (projectsData.projects.length > 0 && !project) {
              setProject(projectsData.projects[0]._id || projectsData.projects[0].id);
            }
          }
        }
        
        // Fetch resources for assignee dropdown
        const resourcesRes = await fetchWithAuth(`${API_BASE}/auth/users?role=resource`);
        if (resourcesRes) {
          const resourcesData = await resourcesRes.json();
          if (resourcesData.users) {
            setResources(resourcesData.users);
          }
        }
      } catch (err) {
        console.error('Failed to fetch modal data:', err);
      }
    }
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isClient = userRole === 'client';
  
  const reset = () => { 
    setTitle(''); 
    setPriority('Medium'); 
    setCategory('Bug');
    setDescription(''); 
  };
  
  const submit = () => {
    if (!title.trim()) return;
    const ticketData = { 
      title, 
      priority, 
      category, 
      client: isClient ? userEmail : client, 
      project, 
      assignee: isClient ? null : assignee, 
      description 
    };
    onCreated && onCreated(ticketData);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New ticket"
      subtitle="Capture an issue, request, or task. SLA timers start as soon as it's created."
      width={800}
      footer={
        <div className="modal-foot-row">
          <span className="muted small">Tip: mention <code>@person</code> or link <code>VT-####</code> in the description.</span>
          <div className="modal-foot-actions">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={submit} disabled={!title.trim()}>Create ticket</Button>
          </div>
        </div>
      }
    >
      <Field label="Title" required>
        <input className="input" placeholder="Short, specific summary of the issue" value={title} onChange={e => setTitle(e.target.value)} autoFocus/>
      </Field>

      <div className="field-row">
        <Field label="Priority">
          <SegRadio value={priority} onChange={setPriority} options={['Low','Medium','High','Urgent']} tonePer={{ Urgent: 'red', High: 'amber', Medium: 'blue', Low: 'neutral' }}/>
        </Field>
        <Field label="Category">
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {['Bug','Feature','Performance','Maintenance','Question'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="field-row">
        {!isClient && (
          <Field label="Client">
            <select className="input" value={client} onChange={e => setClient(e.target.value)}>
              {clients.length === 0 && <option value="">Loading clients...</option>}
              {clients.map(c => <option key={c.email} value={c.email}>{c.name || c.email}</option>)}
            </select>
          </Field>
        )}
        <Field label="Project" required>
          <select className="input" value={project} onChange={e => setProject(e.target.value)}>
            {isClient && userProjects ? (
              userProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)
            ) : (
              <>
                {projects.length === 0 && <option value="">Loading projects...</option>}
                {projects.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
              </>
            )}
          </select>
        </Field>
      </div>

      {!isClient && (
        <Field label="Assignee">
          <select className="input" value={assignee} onChange={e => setAssignee(e.target.value)}>
            <option value="">Unassigned — auto-route</option>
            {resources.map(u => <option key={u._id} value={u._id}>{u.name} · {u.role}</option>)}
          </select>
        </Field>
      )}

      <Field label="Description" hint="markdown supported">
        <textarea className="input textarea" rows={5} placeholder="Steps to reproduce, observed vs expected, logs, screenshots…" value={description} onChange={e => setDescription(e.target.value)}/>
      </Field>

      <div className="modal-pills">
        <button className="pill-btn"><Ic.attach width={12} height={12}/> Attach file</button>
        <button className="pill-btn"><Ic.link width={12} height={12}/> Link work</button>
        <button className="pill-btn"><Ic.flag width={12} height={12}/> Add SLA tier</button>
      </div>
    </Modal>
  );
}

function CreateDealModal({ open, onClose, onCreated }) {
  const [name, setName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [value, setValue] = React.useState(120000);
  const [stage, setStage] = React.useState('discovery');
  const [confidence, setConfidence] = React.useState(30);
  const [closeBy, setCloseBy] = React.useState('');
  const [source, setSource] = React.useState('Inbound');
  const [notes, setNotes] = React.useState('');

  const reset = () => { setName(''); setCompany(''); setValue(120000); setNotes(''); };
  const submit = () => {
    if (!name.trim() || !company.trim()) return;
    onCreated && onCreated({ name, company, value: Number(value), stage, confidence, closeBy, source, notes });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New deal"
      subtitle="Log an opportunity. You can drag it through the pipeline stages later."
      width={620}
      footer={
        <div className="modal-foot-row">
          <span className="muted small">Weighted forecast updates automatically from <strong>value × confidence</strong>.</span>
          <div className="modal-foot-actions">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={submit} disabled={!name.trim() || !company.trim()}>Create deal</Button>
          </div>
        </div>
      }
    >
      <Field label="Deal name" required>
        <input className="input" placeholder="e.g. Atlas Freight — Logistics dashboard" value={name} onChange={e => setName(e.target.value)} autoFocus/>
      </Field>

      <div className="field-row">
        <Field label="Company" required>
          <input className="input" placeholder="Account name" value={company} onChange={e => setCompany(e.target.value)}/>
        </Field>
        <Field label="Lead source">
          <select className="input" value={source} onChange={e => setSource(e.target.value)}>
            {['Inbound','Outbound','Referral','Existing','Event'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="field-row">
        <Field label="Value (USD)" required>
          <div className="input-prefix">
            <span className="prefix">$</span>
            <input className="input" type="number" value={value} onChange={e => setValue(e.target.value)}/>
          </div>
        </Field>
        <Field label="Target close">
          <input className="input" type="text" placeholder="e.g. Jun 30" value={closeBy} onChange={e => setCloseBy(e.target.value)}/>
        </Field>
      </div>

      <Field label="Stage">
        <div className="stage-picker">
          {DEAL_STAGES.map(s => (
            <button key={s.id} className={`stage-opt ${stage === s.id ? 'is-active' : ''}`} onClick={() => setStage(s.id)} style={{'--c': s.tone}}>
              <span className="stage-opt-dot" style={{ background: s.tone }}/>
              {s.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Confidence" hint={`${confidence}%`}>
        <input className="slider" type="range" min="0" max="100" step="5" value={confidence} onChange={e => setConfidence(Number(e.target.value))}/>
      </Field>

      <Field label="Notes">
        <textarea className="input textarea" rows={3} placeholder="Decision-maker, pain points, next step…" value={notes} onChange={e => setNotes(e.target.value)}/>
      </Field>
    </Modal>
  );
}

function SegRadio({ value, onChange, options, tonePer = {} }) {
  return (
    <div className="seg-radio">
      {options.map(o => (
        <button key={o}
          className={`seg-opt ${value === o ? 'is-active' : ''} ${value === o && tonePer[o] ? `seg-${tonePer[o]}` : ''}`}
          onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

// Toast — fired when something is created.
function ToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const onToast = (e) => {
      const t = { id: Date.now() + Math.random(), ...e.detail };
      setToasts(ts => [...ts, t]);
      setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 4000);
    };
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.tone || 'navy'}`}>
          <div className="toast-icon">
            {t.tone === 'green' ? <Ic.ok width={16} height={16}/> : <Ic.spark width={16} height={16}/>}
          </div>
          <div>
            <div className="toast-title">{t.title}</div>
            {t.body && <div className="toast-body muted small">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function toast(detail) { window.dispatchEvent(new CustomEvent('toast', { detail })); }
function openModal(type) { window.dispatchEvent(new CustomEvent('open-modal', { detail: { type } })); }

// ModalHost — listens for open-modal events and renders the appropriate modal
function ModalHost({ user }) {
  const [modalType, setModalType] = React.useState(null);
  const { addTicket, apiAddTicket, addDeal } = React.useContext(AppStateContext);
  const [userProjects, setUserProjects] = React.useState([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Fetch user projects if client
  React.useEffect(() => {
    if (user?.role === 'client' && user?.email) {
      fetchWithAuth(`${API_BASE}/client/projects?clientId=${user.email}`)
        .then(res => {
          if (!res) return; // 401 handled
          return res.json();
        })
        .then(data => {
          if (data?.projects) setUserProjects(data.projects);
        })
        .catch(err => console.error('Failed to fetch projects:', err));
    }
  }, [user, refreshKey]);
  
  React.useEffect(() => {
    const handleOpenModal = (e) => {
      setModalType(e.detail.type);
    };
    window.addEventListener('open-modal', handleOpenModal);
    return () => window.removeEventListener('open-modal', handleOpenModal);
  }, []);
  
  const handleClose = () => setModalType(null);
  
  // Handle ticket creation - use API for clients, local for others
  const handleCreateTicket = async (ticketData) => {
    if (user?.role === 'client') {
      await apiAddTicket(ticketData, user.email);
      // Trigger refresh of tickets list
      setRefreshKey(k => k + 1);
      // Dispatch event to notify TicketsScreen to re-fetch
      window.dispatchEvent(new CustomEvent('tickets-updated'));
    } else {
      addTicket(ticketData);
    }
  };
  
  return (
    <>
      <CreateTicketModal 
        open={modalType === 'ticket'} 
        onClose={handleClose} 
        onCreated={handleCreateTicket}
        userRole={user?.role}
        userProjects={userProjects}
        userEmail={user?.email}
      />
      <CreateDealModal 
        open={modalType === 'deal'} 
        onClose={handleClose} 
        onCreated={addDeal}
      />
      <ToastHost />
    </>
  );
}

Object.assign(window, { Modal, CreateTicketModal, CreateDealModal, ToastHost, ModalHost, toast, openModal });

export { Modal, CreateTicketModal, CreateDealModal, ToastHost, ModalHost, toast, openModal };
