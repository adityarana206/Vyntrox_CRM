// Dashboard — unified view, content adapts to role
import React from 'react'
function Dashboard({ role, setRoute, setSelectedTicket, setSelectedProject, setSelectedDeal }) {
  const { tickets, deals } = useAppState();
  // KPIs vary per role
  const kpisByRole = {
    admin: [
      { label: 'Active projects', value: '23', delta: '+3 vs last mo', trend: [3,4,5,6,7,8,7,9,10,11,12], color: '#15348a' },
      { label: 'Open tickets',    value: '47', delta: '−8 vs yesterday', trend: [55,52,49,53,51,50,48,49,47,46,47], color: '#d97706' },
      { label: 'Pipeline value',  value: '$1.74M', delta: '+12.4%', trend: [1.1,1.2,1.25,1.3,1.4,1.35,1.5,1.55,1.6,1.7,1.74], color: '#65bb3c' },
      { label: 'Team utilization',value: '78%', delta: '+4 pts',  trend: [62,65,68,70,72,74,72,75,77,76,78], color: '#2f5fd3' },
    ],
    manager: [
      { label: 'My team tickets', value: '18', delta: '−3 today', trend: [22,21,20,19,20,19,18,17,18,19,18], color: '#15348a' },
      { label: 'Projects on track', value: '4/5', delta: '1 at risk', trend: [3,4,4,3,4,4,4,4,4,4,4], color: '#65bb3c' },
      { label: 'Utilization',     value: '82%', delta: '+3 pts', trend: [70,72,74,76,78,80,79,80,82,81,82], color: '#2f5fd3' },
      { label: 'Hours logged',    value: '312h', delta: 'this wk', trend: [40,48,52,55,58,60,62], color: '#d97706' },
    ],
    resource: [
      { label: 'My open tasks',   value: '6',  delta: '2 due today', trend: [9,8,7,7,6,6,7,6,6,6,6], color: '#15348a' },
      { label: 'Hours this week', value: '32 / 40', delta: '80%', trend: [4,6,7,8,7], color: '#65bb3c' },
      { label: 'Tickets assigned',value: '4',  delta: '1 urgent',  trend: [5,4,5,4,3,4,4,4,4,4,4], color: '#d97706' },
      { label: 'PRs in review',   value: '3',  delta: '1 stale',   trend: [2,2,3,3,2,3,3,4,3,3,3], color: '#2f5fd3' },
    ],
    sales: [
      { label: 'Pipeline value',  value: '$1.74M', delta: '+$240k MoM', trend: [1.1,1.2,1.3,1.4,1.5,1.55,1.6,1.65,1.7,1.72,1.74], color: '#15348a' },
      { label: 'Win rate',        value: '38%', delta: '+5 pts', trend: [28,30,31,33,32,34,35,36,37,38,38], color: '#65bb3c' },
      { label: 'Closing this mo', value: '$612k', delta: '4 deals', trend: [200,250,320,400,480,540,600,612], color: '#d97706' },
      { label: 'New leads (wk)',  value: '14', delta: '+6', trend: [4,6,5,7,9,11,13,14], color: '#2f5fd3' },
    ],
    client: [
      { label: 'Open tickets',     value: '3',  delta: '1 in review', trend: [5,4,4,3,3,4,3,3,3,3,3], color: '#15348a' },
      { label: 'Active projects',  value: '2',  delta: '1 launching Jul', trend: [2,2,2,2,2], color: '#65bb3c' },
      { label: 'This month spend', value: '$18.4k', delta: 'on budget', trend: [12,14,16,15,17,18,18.4], color: '#d97706' },
      { label: 'SLA compliance',   value: '98%', delta: 'last 30 days', trend: [95,96,96,97,97,98,98], color: '#2f5fd3' },
    ],
  };

  const kpis = kpisByRole[role];

  return (
    <div className="page dashboard">
      {/* Greeting strip */}
      <div className="greeting">
        <div>
          <div className="greeting-eyebrow">{getGreeting()}, {CURRENT_USER[role].name.split(' ')[0]}</div>
          <h1 className="greeting-title">{getGreetingTitle(role)}</h1>
        </div>
        <div className="greeting-actions">
          {role === 'client' && <Button variant="primary" icon={<Ic.plus width={14} height={14}/>} onClick={() => openModal('ticket')}>Submit a ticket</Button>}
          {role === 'sales' && <Button variant="primary" icon={<Ic.plus width={14} height={14}/>} onClick={() => openModal('deal')}>Log a deal</Button>}
          {role === 'manager' && <Button variant="primary" icon={<Ic.plus width={14} height={14}/>} onClick={() => openModal('ticket')}>Assign work</Button>}
          {role === 'admin' && <Button variant="primary" icon={<Ic.invite width={14} height={14}/>}>Invite user</Button>}
          {role === 'resource' && <Button variant="primary" icon={<Ic.clock width={14} height={14}/>}>Log time</Button>}
          <Button variant="secondary" icon={<Ic.calendar width={14} height={14}/>}>This week</Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        {kpis.map((k, i) => <KPI key={i} {...k}/>)}
      </div>

      {/* Main two-column area */}
      <div className="dash-grid">
        <div className="dash-main">
          {role !== 'client' && <PipelineHealthCard setRoute={setRoute}/>}
          {role === 'client' && <ClientProjectsCard setRoute={setRoute} setSelectedProject={setSelectedProject}/>}
          <TicketsOverviewCard role={role} setRoute={setRoute} setSelectedTicket={setSelectedTicket}/>
          {(role === 'admin' || role === 'manager') && <ResourceLoadCard setRoute={setRoute}/>}
          {(role === 'resource') && <MyTasksCard setRoute={setRoute}/>}
          {(role === 'sales') && <DealsCloseCard setRoute={setRoute} setSelectedDeal={setSelectedDeal}/>}
        </div>
        <div className="dash-side">
          <ActivityFeedCard/>
          <SLACard role={role}/>
          {role === 'admin' && <SystemHealthCard/>}
          {role === 'client' && <SupportContactsCard/>}
          {role === 'sales' && <TopAccountsCard/>}
          {role === 'manager' && <TeamSpotlightCard/>}
          {role === 'resource' && <MyScheduleCard/>}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingTitle(role) {
  return {
    admin:    'Here\'s the pulse of the company.',
    manager:  'Your team has 4 priorities today.',
    resource: 'You have 2 tasks due today.',
    sales:    'You\'re tracking ahead of quota this month.',
    client:   'All your work in one place.',
  }[role];
}

// ===== Dashboard cards =====

function PipelineHealthCard({ setRoute }) {
  const { deals } = useAppState();
  const totals = DEAL_STAGES.map(s => {
    const ds = deals.filter(d => d.stage === s.id);
    return { ...s, count: ds.length, value: ds.reduce((a,d) => a + d.value, 0) };
  });
  const max = Math.max(...totals.map(t => t.value));

  return (
    <Card className="pipeline-card">
      <SectionHead
        title="Sales pipeline"
        sub="Forward-weighted by stage"
        action={<button className="link-btn" onClick={() => setRoute('sales')}>Open board <Ic.chevR width={12} height={12}/></button>}
      />
      <div className="funnel">
        {totals.map(t => (
          <div className="funnel-stage" key={t.id}>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar" style={{ height: `${(t.value/max)*100}%`, background: t.tone }}/>
            </div>
            <div className="funnel-meta">
              <div className="funnel-value">${(t.value/1000).toFixed(0)}k</div>
              <div className="funnel-label">{t.label}</div>
              <div className="funnel-count">{t.count} deals</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ClientProjectsCard({ setRoute, setSelectedProject }) {
  const mine = PROJECTS.filter(p => p.clientId === 'c1' || p.clientId === 'c2').slice(0,2);
  return (
    <Card>
      <SectionHead title="Your active engagements" action={<button className="link-btn" onClick={() => setRoute('projects')}>All projects <Ic.chevR width={12} height={12}/></button>}/>
      <div className="client-projects">
        {mine.map(p => (
          <div key={p.id} className="cp-row" onClick={() => { setSelectedProject(p.id); setRoute('projects'); }}>
            <div className="cp-head">
              <div>
                <div className="cp-name">{p.name}</div>
                <div className="cp-sub">Due {p.due} · {p.tags.join(' · ')}</div>
              </div>
              <StatusPill status={p.status}/>
            </div>
            <div className="cp-bar">
              <ProgressBar value={p.progress} tone={p.status === 'At risk' ? 'amber' : 'navy'} height={6}/>
              <span className="cp-pct">{p.progress}%</span>
            </div>
            <div className="cp-foot">
              <AvatarStack ids={p.team} size={22}/>
              <div className="cp-spend">${(p.spent/1000).toFixed(0)}k spent <span className="muted">of ${(p.budget/1000).toFixed(0)}k</span></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TicketsOverviewCard({ role, setRoute, setSelectedTicket }) {
  const { tickets } = useAppState();
  let rows = tickets;
  if (role === 'resource') rows = TICKETS.filter(t => t.assignee === 'u1');
  if (role === 'client')   rows = TICKETS.filter(t => t.clientId === 'c1' || t.clientId === 'c2');
  rows = rows.slice(0, 6);

  return (
    <Card>
      <SectionHead
        title={role === 'client' ? 'Your tickets' : 'Urgent & at-risk tickets'}
        sub={role === 'client' ? 'Submitted in the last 30 days' : 'Sorted by SLA urgency'}
        action={<button className="link-btn" onClick={() => setRoute('tickets')}>All tickets <Ic.chevR width={12} height={12}/></button>}
      />
      <div className="ticket-table">
        <div className="tt-head">
          <div className="tt-c-id">ID</div>
          <div className="tt-c-title">Title</div>
          <div className="tt-c-client">Client</div>
          <div className="tt-c-prio">Priority</div>
          <div className="tt-c-status">Status</div>
          <div className="tt-c-sla">SLA</div>
        </div>
        {rows.map(t => (
          <div key={t.id} className="tt-row" onClick={() => { setSelectedTicket(t.id); setRoute('tickets'); }}>
            <div className="tt-c-id mono">{t.id}</div>
            <div className="tt-c-title">
              <span className="tt-title-text">{t.title}</span>
              <span className="tt-meta">{t.category} · {t.comments} comments</span>
            </div>
            <div className="tt-c-client muted">{t.client}</div>
            <div className="tt-c-prio"><PriorityChip priority={t.priority}/></div>
            <div className="tt-c-status"><StatusPill status={t.status}/></div>
            <div className={`tt-c-sla ${t.sla.includes('h left') && parseInt(t.sla) < 6 ? 'sla-warn' : ''}`}>{t.sla}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResourceLoadCard({ setRoute }) {
  return (
    <Card>
      <SectionHead
        title="Team capacity — this week"
        sub="Hours allocated against 40h/week"
        action={<button className="link-btn" onClick={() => setRoute('resources')}>Allocation board <Ic.chevR width={12} height={12}/></button>}
      />
      <div className="capacity-list">
        {TEAM.slice(0,6).map(t => {
          const pct = (t.allocated / t.capacity) * 100;
          const tone = pct >= 100 ? 'red' : pct >= 85 ? 'amber' : 'navy';
          return (
            <div key={t.id} className="cap-row">
              <div className="cap-who">
                <Avatar initials={t.initials} hue={t.hue} size={28}/>
                <div>
                  <div className="cap-name">{t.name}</div>
                  <div className="cap-role muted">{t.role}</div>
                </div>
              </div>
              <div className="cap-bar">
                <ProgressBar value={t.allocated} max={t.capacity} tone={tone} height={8}/>
              </div>
              <div className={`cap-num tone-${tone}`}>{t.allocated}h</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MyTasksCard({ setRoute }) {
  const mine = TASKS.filter(t => t.assignee === 'u1').concat(TASKS.filter(t => t.assignee === 'u3').slice(0,2));
  return (
    <Card>
      <SectionHead title="My tasks" sub="Due in the next 7 days" action={<button className="link-btn" onClick={() => setRoute('tasks')}>All tasks <Ic.chevR width={12} height={12}/></button>}/>
      <div className="task-list">
        {mine.slice(0,6).map(t => {
          const proj = PROJECTS.find(p => p.id === t.project);
          return (
            <div key={t.id} className="task-row">
              <div className="task-check"><span className="check-empty"/></div>
              <div className="task-body">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  <span className="muted">{proj.name}</span>
                  {t.ticket && <span className="ticket-link mono">{t.ticket}</span>}
                </div>
              </div>
              <PriorityChip priority={t.priority}/>
              <div className="task-due">{t.due}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DealsCloseCard({ setRoute, setSelectedDeal }) {
  const { deals } = useAppState();
  const closing = deals.filter(d => d.stage === 'negotiation' || d.stage === 'sow').slice(0,4);
  return (
    <Card>
      <SectionHead title="Closing this month" sub="Negotiation + SOW stages" action={<button className="link-btn" onClick={() => setRoute('sales')}>Open pipeline <Ic.chevR width={12} height={12}/></button>}/>
      <div className="deal-list">
        {closing.map(d => (
          <div key={d.id} className="deal-row" onClick={() => { setSelectedDeal(d.id); setRoute('sales'); }}>
            <Avatar initials={d.initials} hue={(d.id.charCodeAt(1)*53)%360} size={36}/>
            <div className="deal-main">
              <div className="deal-name">{d.name}</div>
              <div className="deal-meta muted">{d.contact} · closes {d.closeBy}</div>
            </div>
            <div className="deal-confidence">
              <Donut value={d.confidence} size={36} stroke={4} color="#65bb3c"/>
            </div>
            <div className="deal-value mono">${(d.value/1000).toFixed(0)}k</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityFeedCard() {
  const toneColor = { sales: '#65bb3c', ticket: '#d97706', design: '#7c3aed', pm: '#2f5fd3' };
  return (
    <Card>
      <SectionHead title="Recent activity"/>
      <div className="feed">
        {ACTIVITY.map((a, i) => {
          const initials = a.who.split(' ').map(w=>w[0]).slice(0,2).join('');
          return (
            <div key={i} className="feed-item">
              <div className="feed-line">
                <span className="feed-dot" style={{ background: toneColor[a.tone] }}/>
                {i < ACTIVITY.length - 1 && <span className="feed-stem"/>}
              </div>
              <div className="feed-body">
                <div className="feed-text"><strong>{a.who}</strong> {a.verb} <span className="feed-target">{a.target}</span></div>
                <div className="feed-meta muted">{a.meta} · {a.when}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SLACard({ role }) {
  const stats = [
    { label: 'Within SLA', value: 94, color: '#65bb3c' },
    { label: 'Approaching', value: 4, color: '#d97706' },
    { label: 'Breached', value: 2, color: '#dc2626' },
  ];
  return (
    <Card>
      <SectionHead title="SLA performance" sub="Last 30 days"/>
      <div className="sla-donut-wrap">
        <Donut value={94} size={110} stroke={12} color="#65bb3c" label={<><strong>94%</strong><span>on time</span></>}/>
      </div>
      <div className="sla-legend">
        {stats.map(s => (
          <div key={s.label} className="sla-leg-row">
            <span className="sla-leg-dot" style={{ background: s.color }}/>
            <span className="sla-leg-label">{s.label}</span>
            <span className="sla-leg-val mono">{s.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SystemHealthCard() {
  const services = [
    { name: 'API gateway',  status: 'Operational', uptime: '99.99%', color: '#65bb3c' },
    { name: 'Auth (SSO)',   status: 'Operational', uptime: '99.95%', color: '#65bb3c' },
    { name: 'Workers',      status: 'Degraded',    uptime: '98.41%', color: '#d97706' },
    { name: 'Storage',      status: 'Operational', uptime: '99.99%', color: '#65bb3c' },
  ];
  return (
    <Card>
      <SectionHead title="System health"/>
      {services.map(s => (
        <div key={s.name} className="health-row">
          <span className="health-dot" style={{ background: s.color }}/>
          <span className="health-name">{s.name}</span>
          <span className="health-uptime mono muted">{s.uptime}</span>
          <span className={`health-status tone-${s.status === 'Operational' ? 'green' : 'amber'}`}>{s.status}</span>
        </div>
      ))}
    </Card>
  );
}

function SupportContactsCard() {
  return (
    <Card>
      <SectionHead title="Your Vyntrox team"/>
      <div className="contacts">
        <div className="contact-row">
          <Avatar initials="DO" hue={220} size={36}/>
          <div><div className="contact-name">Daniel Okafor</div><div className="muted">Delivery Manager</div></div>
          <button className="icon-btn"><Ic.message width={16} height={16}/></button>
        </div>
        <div className="contact-row">
          <Avatar initials="AM" hue={217} size={36}/>
          <div><div className="contact-name">Aarav Mehta</div><div className="muted">Lead Engineer</div></div>
          <button className="icon-btn"><Ic.message width={16} height={16}/></button>
        </div>
        <div className="contact-row">
          <Avatar initials="RC" hue={32} size={36}/>
          <div><div className="contact-name">Riley Chen</div><div className="muted">Account Executive</div></div>
          <button className="icon-btn"><Ic.message width={16} height={16}/></button>
        </div>
      </div>
    </Card>
  );
}

function TopAccountsCard() {
  return (
    <Card>
      <SectionHead title="Top accounts" sub="By MRR"/>
      <div className="acct-list">
        {CLIENTS.slice().sort((a,b) => b.mrr - a.mrr).slice(0,4).map(c => (
          <div key={c.id} className="acct-row">
            <Avatar initials={c.initials} hue={(c.id.charCodeAt(1)*73)%360} size={32}/>
            <div className="acct-main">
              <div className="acct-name">{c.name}</div>
              <div className="muted">{c.industry}</div>
            </div>
            <div className="acct-mrr mono">${(c.mrr/1000).toFixed(1)}k<span className="acct-mrr-sub">/mo</span></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamSpotlightCard() {
  return (
    <Card>
      <SectionHead title="Team spotlight" sub="Top contributors this week"/>
      <div className="spotlight">
        {[TEAM[0], TEAM[3], TEAM[7]].map((u,i) => (
          <div key={u.id} className="spot-row">
            <div className="spot-rank">{i+1}</div>
            <Avatar initials={u.initials} hue={u.hue} size={32}/>
            <div className="spot-main">
              <div className="spot-name">{u.name}</div>
              <div className="muted">{['12 PRs merged', '8 tickets resolved', '6 datasets shipped'][i]}</div>
            </div>
            <Ic.star width={16} height={16} className="spot-star"/>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MyScheduleCard() {
  const blocks = [
    { time: '09:00', title: 'Stand-up',                proj: 'Daily', tone: '#2f5fd3' },
    { time: '10:30', title: 'SAML parser deep work',   proj: 'Helio Bank — SSO', tone: '#15348a' },
    { time: '14:00', title: 'Code review — Aarav',     proj: '3 PRs', tone: '#65bb3c' },
    { time: '15:30', title: 'Client sync — Northwind', proj: 'Mara Lindqvist', tone: '#d97706' },
  ];
  return (
    <Card>
      <SectionHead title="Today's schedule"/>
      <div className="schedule">
        {blocks.map((b,i) => (
          <div key={i} className="sched-row">
            <div className="sched-time mono">{b.time}</div>
            <div className="sched-stripe" style={{ background: b.tone }}/>
            <div className="sched-body">
              <div className="sched-title">{b.title}</div>
              <div className="muted">{b.proj}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

Object.assign(window, { Dashboard });
