// Clients, Admin, Reports, Portal, Tasks, Settings, Login
import React from 'react'

// ===== Clients =====
function ClientsScreen() {
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'all',label:'All accounts',badge:CLIENTS.length},{id:'paying',label:'Paying',badge:CLIENTS.length},{id:'churn',label:'Churn risk',badge:1}]} active="all" onChange={()=>{}}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>Filter</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New client</Button>
        </div>
      </div>

      <Card pad={false} className="big-table">
        <div className="bt-head client-head">
          <div>Client</div><div>Industry</div><div>Primary contact</div><div>MRR</div><div>Health</div><div>Customer since</div><div></div>
        </div>
        {CLIENTS.map(c => {
          const healthTone = c.health >= 85 ? 'green' : c.health >= 70 ? 'amber' : 'red';
          return (
            <div key={c.id} className="bt-row">
              <div className="client-cell">
                <Avatar initials={c.initials} hue={(c.id.charCodeAt(1)*73)%360} size={36}/>
                <div>
                  <div className="bt-title-text">{c.name}</div>
                  <div className="muted small">{c.id.toUpperCase()}</div>
                </div>
              </div>
              <div>{c.industry}</div>
              <div>{c.contact}</div>
              <div className="mono"><strong>${(c.mrr/1000).toFixed(1)}k</strong><span className="muted">/mo</span></div>
              <div>
                <div className="health-cell">
                  <ProgressBar value={c.health} tone={healthTone} height={6}/>
                  <span className={`mono small tone-${healthTone}`}>{c.health}</span>
                </div>
              </div>
              <div>{c.since}</div>
              <div><button className="icon-btn"><Ic.more width={14} height={14}/></button></div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ===== Admin: Users & Roles =====
function AdminScreen() {
  const [tab, setTab] = React.useState('users');
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'users',label:'Users',badge:USERS_ADMIN.length},{id:'roles',label:'Roles & permissions'},{id:'audit',label:'Audit log'}]} active={tab} onChange={setTab}/>
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
          {USERS_ADMIN.map(u => {
            const team = TEAM.find(t => t.id === u.id);
            const hue = team ? team.hue : (u.id.charCodeAt(1)*47)%360;
            const initials = u.name.split(' ').map(w=>w[0]).slice(0,2).join('');
            return (
              <div key={u.id} className="bt-row">
                <div><Avatar initials={initials} hue={hue} size={32}/></div>
                <div>
                  <div className="bt-title-text">{u.name}</div>
                  <div className="muted small">{u.email}</div>
                </div>
                <div><Badge tone={u.role === 'Admin' ? 'navy' : u.role === 'Manager' ? 'blue' : u.role === 'Sales' ? 'amber' : u.role === 'Client' ? 'purple' : 'green'} soft>{u.role}</Badge></div>
                <div>{u.dept}</div>
                <div><StatusPill status={u.status}/></div>
                <div>{u.twofa ? <Ic.ok width={16} height={16} className="ok-icon"/> : <span className="muted">—</span>}</div>
                <div className="muted">{u.last}</div>
                <div><button className="icon-btn"><Ic.more width={14} height={14}/></button></div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'roles' && (
        <div className="roles-grid">
          {ROLE_DEFS.map(r => (
            <Card key={r.id} className="role-card">
              <div className="role-card-head">
                <div>
                  <div className="role-card-name">{r.name}</div>
                  <div className="muted small">{r.members} members</div>
                </div>
                <button className="icon-btn"><Ic.more width={14} height={14}/></button>
              </div>
              <div className="role-perms">
                {r.perms.map(p => <div key={p} className="role-perm"><Ic.ok width={12} height={12} className="ok-icon"/>{p}</div>)}
              </div>
              <button className="role-card-edit">Edit permissions</button>
            </Card>
          ))}
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
          {[
            { when: '2m ago',  who: 'Priya Sharma',  action: 'Updated permissions for', target: 'Role: Sales', ip: '10.42.18.4' },
            { when: '14m ago', who: 'Daniel Okafor', action: 'Reassigned ticket',       target: 'VT-2411 → Aarav', ip: '10.42.11.9' },
            { when: '38m ago', who: 'Riley Chen',    action: 'Moved deal',              target: 'd6 → Negotiation', ip: '10.42.22.7' },
            { when: '1h ago',  who: 'Priya Sharma',  action: 'Invited user',            target: 'hugo@vyntrox.com', ip: '10.42.18.4' },
            { when: '3h ago',  who: 'Tomás Bauer',   action: 'Pushed deploy',           target: 'vyntrox-gateway v1.84', ip: '10.42.13.2' },
            { when: '6h ago',  who: 'Mara Lindqvist',action: 'Submitted ticket',        target: 'VT-2417', ip: '203.0.113.41' },
          ].map((a,i) => (
            <div key={i} className="bt-row">
              <div className="muted">{a.when}</div>
              <div>{a.who}</div>
              <div>{a.action}</div>
              <div className="mono small">{a.target}</div>
              <div className="muted mono small">{a.ip}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ===== Reports =====
function ReportsScreen() {
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'all',label:'All reports'},{id:'rev',label:'Revenue'},{id:'sup',label:'Support'},{id:'del',label:'Delivery'}]} active="all" onChange={()=>{}}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.calendar width={14} height={14}/>}>Last 90 days</Button>
          <Button variant="ghost" size="sm" icon={<Ic.download width={14} height={14}/>}>Export</Button>
        </div>
      </div>

      <div className="kpi-grid kpi-grid-4">
        <KPI label="Revenue (Q2)" value="$1.84M" delta="+18%" trend={[1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.84]} color="#15348a"/>
        <KPI label="Avg ticket resolve" value="3.6h" delta="−0.8h" trend={[5,4.8,4.5,4.2,4,3.8,3.6]} color="#65bb3c"/>
        <KPI label="Project margin" value="34%" delta="+2 pts" trend={[28,30,29,31,32,33,34]} color="#d97706"/>
        <KPI label="NPS" value="62" delta="+8" trend={[50,52,54,56,58,60,62]} color="#2f5fd3"/>
      </div>

      <div className="reports-grid">
        <Card>
          <SectionHead title="Revenue by quarter" sub="Recognized + booked, $K"/>
          <BigBarChart/>
        </Card>
        <Card>
          <SectionHead title="Ticket volume by category" sub="Last 30 days"/>
          <CategoryBars/>
        </Card>
        <Card>
          <SectionHead title="Top deals — closed"/>
          <div className="deal-list">
            {DEALS.filter(d => d.stage === 'won').map(d => (
              <div key={d.id} className="deal-row">
                <Avatar initials={d.initials} hue={(d.id.charCodeAt(1)*53)%360} size={32}/>
                <div className="deal-main">
                  <div className="deal-name">{d.name}</div>
                  <div className="muted small">Closed {d.closeBy}</div>
                </div>
                <div className="deal-value mono">${(d.value/1000).toFixed(0)}k</div>
              </div>
            ))}
            <div className="deal-row" style={{ opacity: 0.6 }}>
              <Avatar initials="MH" hue={140} size={32}/>
              <div className="deal-main">
                <div className="deal-name">Marigold — Telehealth module</div>
                <div className="muted small">Closed Apr 22</div>
              </div>
              <div className="deal-value mono">$64k</div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHead title="Team utilization" sub="6-week rolling"/>
          <div className="util-chart">
            {['W1','W2','W3','W4','W5','W6'].map((w,i) => {
              const val = [68, 72, 70, 76, 79, 78][i];
              return (
                <div key={w} className="util-col">
                  <div className="util-bar-wrap">
                    <div className="util-bar" style={{ height: `${val}%` }}/>
                    <div className="util-bar-target"/>
                  </div>
                  <div className="util-val mono">{val}%</div>
                  <div className="util-label">{w}</div>
                </div>
              );
            })}
          </div>
          <div className="util-legend">
            <span><span className="leg-sq" style={{background:'#15348a'}}/>Actual</span>
            <span><span className="leg-sq leg-sq-line"/>Target (75%)</span>
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
function TasksScreen() {
  const [filter, setFilter] = React.useState('all');
  const mine = TASKS;
  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'all',label:'All',badge:mine.length},{id:'today',label:'Today',badge:2},{id:'wk',label:'This week'}]} active={filter} onChange={setFilter}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>By project</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New task</Button>
        </div>
      </div>
      <Card pad={false}>
        <div className="bt-head task-head">
          <div></div><div>Task</div><div>Project</div><div>Status</div><div>Priority</div><div>Due</div><div>Estimate</div>
        </div>
        {mine.map(t => {
          const proj = PROJECTS.find(p => p.id === t.project);
          return (
            <div key={t.id} className="bt-row task-row-detail">
              <div><span className="check-empty"/></div>
              <div>
                <div className="bt-title-text">{t.title}</div>
                {t.ticket && <div className="muted small mono">{t.ticket}</div>}
              </div>
              <div>{proj?.name}</div>
              <div><StatusPill status={t.status}/></div>
              <div><PriorityChip priority={t.priority}/></div>
              <div>{t.due}</div>
              <div className="mono">{t.estimate}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ===== Settings =====
function SettingsScreen() {
  const [tab, setTab] = React.useState('workspace');
  return (
    <div className="page">
      <div className="settings-layout">
        <aside className="settings-nav">
          {[
            { id: 'workspace', label: 'Workspace',    icon: <Ic.building width={16} height={16}/> },
            { id: 'profile',   label: 'Profile',      icon: <Ic.user width={16} height={16}/> },
            { id: 'sec',       label: 'Security',     icon: <Ic.shield width={16} height={16}/> },
            { id: 'notif',     label: 'Notifications',icon: <Ic.bell width={16} height={16}/> },
            { id: 'billing',   label: 'Billing',      icon: <Ic.paper width={16} height={16}/> },
            { id: 'int',       label: 'Integrations', icon: <Ic.link width={16} height={16}/> },
            { id: 'api',       label: 'API & webhooks', icon: <Ic.cog width={16} height={16}/> },
          ].map(s => (
            <button key={s.id} className={`settings-nav-item ${tab === s.id ? 'is-active' : ''}`} onClick={() => setTab(s.id)}>
              {s.icon}{s.label}
            </button>
          ))}
        </aside>
        <div className="settings-main">
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
          <Card>
            <SectionHead title="Danger zone"/>
            <div className="danger-row">
              <div>
                <div className="danger-title">Delete workspace</div>
                <div className="muted small">Permanently delete this workspace and all its data. This cannot be undone.</div>
              </div>
              <Button variant="danger" size="sm">Delete workspace</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ClientsScreen, AdminScreen, ReportsScreen, PortalScreen, TasksScreen, SettingsScreen });
