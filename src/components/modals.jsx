// Modals — Create ticket, Create deal, plus the basic Modal shell.
// Open via window event:  window.dispatchEvent(new CustomEvent('open-modal',{detail:{type:'ticket'}}))
// Or pass openModal prop and call openModal('ticket' | 'deal').
import React from 'react'

function Modal({ open, onClose, children, width = 560, title, subtitle, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={{ width }} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            {title && <div className="modal-title">{title}</div>}
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
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

function CreateTicketModal({ open, onClose, onCreated }) {
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState('Medium');
  const [category, setCategory] = React.useState('Bug');
  const [client, setClient] = React.useState(CLIENTS[0].id);
  const [project, setProject] = React.useState(PROJECTS[0].id);
  const [assignee, setAssignee] = React.useState('u1');
  const [description, setDescription] = React.useState('');

  const reset = () => { setTitle(''); setPriority('Medium'); setDescription(''); };
  const submit = () => {
    if (!title.trim()) return;
    onCreated && onCreated({ title, priority, category, client, project, assignee, description });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New ticket"
      subtitle="Capture an issue, request, or task. SLA timers start as soon as it's created."
      width={620}
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
        <Field label="Client">
          <select className="input" value={client} onChange={e => setClient(e.target.value)}>
            {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Project">
          <select className="input" value={project} onChange={e => setProject(e.target.value)}>
            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Assignee">
        <select className="input" value={assignee} onChange={e => setAssignee(e.target.value)}>
          <option value="">Unassigned — auto-route</option>
          {TEAM.map(u => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
        </select>
      </Field>

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

Object.assign(window, { Modal, CreateTicketModal, CreateDealModal, ToastHost, toast, openModal });
