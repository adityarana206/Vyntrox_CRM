// Projects list + detail
import React from 'react'
function ProjectsScreen({ role, selectedProject, setSelectedProject }) {
  const [view, setView] = React.useState('grid');

  if (selectedProject) {
    const p = PROJECTS.find(p => p.id === selectedProject);
    if (p) return <ProjectDetail project={p} role={role} onBack={() => setSelectedProject(null)}/>;
  }

  let rows = PROJECTS;
  if (role === 'client') rows = PROJECTS.filter(p => p.clientId === 'c1' || p.clientId === 'c2');
  if (role === 'resource') rows = PROJECTS.filter(p => p.team.includes('u1'));

  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs tabs={[{id:'grid',label:'Grid'},{id:'list',label:'List'}]} active={view} onChange={setView}/>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>Status: all</Button>
          {role !== 'client' && <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>New project</Button>}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="projects-grid">
          {rows.map(p => (
            <Card key={p.id} className="proj-card" onClick={() => setSelectedProject(p.id)}>
              <div className="proj-card-head">
                <div>
                  <div className="proj-card-client muted small">{p.client}</div>
                  <div className="proj-card-name">{p.name}</div>
                </div>
                <StatusPill status={p.status}/>
              </div>
              <div className="proj-card-tags">
                {p.tags.map(t => <span key={t} className="proj-tag">{t}</span>)}
              </div>
              <div className="proj-card-bar">
                <ProgressBar value={p.progress} tone={p.status === 'At risk' ? 'amber' : p.status === 'On hold' ? 'neutral' : 'navy'} height={6}/>
                <div className="proj-card-bar-meta">
                  <span className="mono">{p.progress}%</span>
                  <span className="muted">due {p.due}</span>
                </div>
              </div>
              <div className="proj-card-foot">
                <AvatarStack ids={p.team} size={24}/>
                <div className="proj-card-spend mono">${(p.spent/1000).toFixed(0)}k <span className="muted">/ ${(p.budget/1000).toFixed(0)}k</span></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card pad={false} className="big-table">
          <div className="bt-head proj-head">
            <div>Project</div><div>Client</div><div>Status</div><div>Progress</div><div>Team</div><div>Budget</div><div>Due</div>
          </div>
          {rows.map(p => (
            <div key={p.id} className="bt-row" onClick={() => setSelectedProject(p.id)}>
              <div className="bt-title-text">{p.name}</div>
              <div>{p.client}</div>
              <div><StatusPill status={p.status}/></div>
              <div className="proj-prog-cell">
                <ProgressBar value={p.progress} tone={p.status === 'At risk' ? 'amber' : 'navy'} height={5}/>
                <span className="mono small">{p.progress}%</span>
              </div>
              <div><AvatarStack ids={p.team} size={22}/></div>
              <div className="mono">${(p.spent/1000).toFixed(0)}k / ${(p.budget/1000).toFixed(0)}k</div>
              <div>{p.due}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ProjectDetail({ project, role, onBack }) {
  const [tab, setTab] = React.useState('overview');
  const projectTickets = TICKETS.filter(t => t.project === project.id);
  const projectTasks = TASKS.filter(t => t.project === project.id);
  const lead = TEAM.find(u => u.id === project.lead);

  return (
    <div className="page detail-page">
      <div className="detail-crumbs">
        <button className="crumb-back" onClick={onBack}><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/> Projects</button>
        <span className="crumb-sep">/</span>
        <span className="muted">{project.client}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-eyebrow">{project.client}</div>
          <h1 className="detail-title">{project.name}</h1>
          <div className="detail-tags">
            <StatusPill status={project.status}/>
            {project.tags.map(t => <Badge key={t} tone="neutral" soft>{t}</Badge>)}
            <span className="muted small">Due {project.due}</span>
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
                {project.team.map(uid => {
                  const u = TEAM.find(x => x.id === uid);
                  return (
                    <div key={uid} className="team-row">
                      <Avatar initials={u.initials} hue={u.hue} size={32}/>
                      <div><div>{u.name}</div><div className="muted small">{u.role}</div></div>
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
            const u = TEAM.find(x => x.id === t.assignee);
            return (
              <div key={t.id} className="bt-row task-row-detail">
                <div><span className="check-empty"/></div>
                <div className="bt-title-text">{t.title}</div>
                <div>{u && <div className="assignee-cell"><Avatar initials={u.initials} hue={u.hue} size={22}/><span>{u.name.split(' ')[0]}</span></div>}</div>
                <div><StatusPill status={t.status}/></div>
                <div><PriorityChip priority={t.priority}/></div>
                <div>{t.due}</div>
                <div className="mono">{t.estimate}</div>
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
            const u = TEAM.find(x => x.id === t.assignee);
            return (
              <div key={t.id} className="bt-row">
                <div className="bt-c-id mono">{t.id}</div>
                <div className="bt-c-title bt-title-text">{t.title}</div>
                <div className="bt-c-client">{t.reporter}</div>
                <div className="bt-c-prio"><PriorityChip priority={t.priority}/></div>
                <div className="bt-c-status"><StatusPill status={t.status}/></div>
                <div className="bt-c-assignee">{u && <div className="assignee-cell"><Avatar initials={u.initials} hue={u.hue} size={22}/><span>{u.name.split(' ')[0]}</span></div>}</div>
                <div className="bt-c-sla">{t.sla}</div>
                <div className="bt-c-opened muted">{t.opened}</div>
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
