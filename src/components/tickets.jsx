// Tickets list + detail
import React from 'react'
function TicketsScreen({ role, selectedTicket, setSelectedTicket }) {
  const { tickets } = useAppState();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  let rows = tickets;
  if (role === 'resource') rows = rows.filter(t => t.assignee === 'u1' || t.assignee === 'u3');
  if (role === 'client') rows = rows.filter(t => t.clientId === 'c1' || t.clientId === 'c2');
  if (filter === 'urgent') rows = rows.filter(t => t.priority === 'Urgent' || t.priority === 'High');
  if (filter === 'mine' && role !== 'client') rows = rows.filter(t => t.assignee === 'u1');
  if (filter === 'unassigned') rows = rows.filter(t => t.status === 'Open' || t.status === 'Backlog');
  if (search) rows = rows.filter(t => (t.title + t.id + t.client).toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: tickets.length,
    urgent: tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length,
    mine: tickets.filter(t => t.assignee === 'u1').length,
    unassigned: tickets.filter(t => t.status === 'Open').length,
  };

  if (selectedTicket) {
    const ticket = tickets.find(t => t.id === selectedTicket);
    if (ticket) return <TicketDetail ticket={ticket} onBack={() => setSelectedTicket(null)}/>;
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
          <Button variant="primary" icon={<Ic.plus width={14} height={14}/>} size="sm" onClick={() => openModal('ticket')}>New ticket</Button>
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
        {rows.map(t => {
          const assignee = TEAM.find(u => u.id === t.assignee);
          const slaUrgent = t.sla.includes('h left') && parseInt(t.sla) < 6;
          return (
            <div key={t.id} className="bt-row" onClick={() => setSelectedTicket(t.id)}>
              <div className="bt-c-id mono">{t.id}</div>
              <div className="bt-c-title">
                <div className="bt-title-text">{t.title}</div>
                <div className="bt-title-meta muted">{t.category} · {t.comments} comments</div>
              </div>
              <div className="bt-c-client">{t.client}</div>
              <div className="bt-c-prio"><PriorityChip priority={t.priority}/></div>
              <div className="bt-c-status"><StatusPill status={t.status}/></div>
              <div className="bt-c-assignee">
                {assignee && (
                  <div className="assignee-cell">
                    <Avatar initials={assignee.initials} hue={assignee.hue} size={22}/>
                    <span>{assignee.name.split(' ')[0]}</span>
                  </div>
                )}
              </div>
              <div className={`bt-c-sla ${slaUrgent ? 'sla-warn' : ''}`}>
                {slaUrgent && <Ic.warn width={12} height={12}/>}
                {t.sla}
              </div>
              <div className="bt-c-opened muted">{t.opened}</div>
            </div>
          );
        })}
      </Card>

      <div className="page-pagination">
        <span className="muted">Showing {rows.length} of {tickets.length} tickets</span>
        <div className="pager">
          <button className="pager-btn"><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/></button>
          <button className="pager-btn is-active">1</button>
          <button className="pager-btn">2</button>
          <button className="pager-btn">3</button>
          <button className="pager-btn"><Ic.chevR width={12} height={12}/></button>
        </div>
      </div>
    </div>
  );
}

function TicketDetail({ ticket, onBack }) {
  const assignee = TEAM.find(u => u.id === ticket.assignee);
  const project = PROJECTS.find(p => p.id === ticket.project);
  const [tab, setTab] = React.useState('activity');
  return (
    <div className="page detail-page">
      <div className="detail-crumbs">
        <button className="crumb-back" onClick={onBack}><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/> All tickets</button>
        <span className="crumb-sep">/</span>
        <span className="muted mono">{ticket.id}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-eyebrow mono">{ticket.id} · {ticket.category}</div>
          <h1 className="detail-title">{ticket.title}</h1>
          <div className="detail-tags">
            <StatusPill status={ticket.status}/>
            <PriorityChip priority={ticket.priority}/>
            <Badge tone="navy" soft>{ticket.client}</Badge>
            <span className="muted small">Opened {ticket.opened} by {ticket.reporter}</span>
          </div>
        </div>
        <div className="detail-actions">
          <Button variant="ghost" size="sm" icon={<Ic.link width={14} height={14}/>}>Copy link</Button>
          <Button variant="ghost" size="sm" icon={<Ic.attach width={14} height={14}/>}>Attach</Button>
          <Button variant="secondary" size="sm">Reassign</Button>
          <Button variant="primary" size="sm" icon={<Ic.ok width={14} height={14}/>}>Mark resolved</Button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <Card>
            <div className="description">
              <div className="desc-title">Description</div>
              <p>After the SSO redirect hop completes, the auth callback intermittently returns 503 from the gateway. Affects roughly 18% of login attempts since 09:14 UTC. Sven reports it began after the OIDC config push from yesterday's release window.</p>
              <p className="muted small">Repro: hit <code>/auth/callback</code> with a valid id_token, ~1 in 5 returns 503 with empty body. No matching logs in the gateway error stream.</p>
              <div className="desc-attachments">
                <div className="attach-chip"><Ic.paper width={14} height={14}/> har-trace-2418.zip <span className="muted">· 1.2 MB</span></div>
                <div className="attach-chip"><Ic.paper width={14} height={14}/> screenshot.png <span className="muted">· 184 KB</span></div>
              </div>
            </div>
          </Card>

          <Card>
            <Tabs
              tabs={[{ id: 'activity', label: 'Activity', badge: 12 }, { id: 'comments', label: 'Comments', badge: 7 }, { id: 'linked', label: 'Linked work', badge: 3 }]}
              active={tab} onChange={setTab}
            />
            {tab === 'activity' && (
              <div className="ticket-activity">
                {[
                  { who: 'Tomás Bauer',    initials: 'TB', hue: 12,  text: <>set status to <strong>In progress</strong></>, when: '12m ago' },
                  { who: 'Daniel Okafor',  initials: 'DO', hue: 220, text: <>raised priority to <strong>Urgent</strong></>, when: '38m ago' },
                  { who: 'Sven Carlsen',   initials: 'SC', hue: 195, text: <>commented: "Just hit this again after a redeploy of the gateway."</>, when: '1h ago' },
                  { who: 'Aarav Mehta',    initials: 'AM', hue: 217, text: <>linked PR <span className="ticket-link mono">vyntrox-gateway#1284</span></>, when: '1h ago' },
                  { who: 'Sven Carlsen',   initials: 'SC', hue: 195, text: <>opened this ticket</>, when: '2h ago' },
                ].map((e,i,arr) => (
                  <div key={i} className="ta-row">
                    <div className="ta-line">
                      <div className="ta-avatar"><Avatar initials={e.initials} hue={e.hue} size={28}/></div>
                      {i < arr.length-1 && <div className="ta-stem"/>}
                    </div>
                    <div className="ta-body">
                      <div className="ta-text"><strong>{e.who}</strong> {e.text}</div>
                      <div className="muted small">{e.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'comments' && (
              <div className="comments">
                <div className="comment">
                  <Avatar initials="SC" hue={195} size={32}/>
                  <div className="cmt-body">
                    <div className="cmt-head"><strong>Sven Carlsen</strong><span className="muted small">1h ago</span></div>
                    <div className="cmt-text">Just hit this again after the gateway redeploy. We're starting to see customer complaints come into our own helpdesk.</div>
                  </div>
                </div>
                <div className="comment">
                  <Avatar initials="TB" hue={12} size={32}/>
                  <div className="cmt-body">
                    <div className="cmt-head"><strong>Tomás Bauer</strong><span className="muted small">42m ago</span></div>
                    <div className="cmt-text">Looking now. Worker pool was scaled down overnight, which explains the timeout window. Spinning up an extra replica and tightening the timeout.</div>
                  </div>
                </div>
                <div className="comment-input">
                  <Avatar initials="AM" hue={217} size={32}/>
                  <div className="cmt-input-wrap">
                    <textarea placeholder="Reply, mention with @, attach a log…" rows={2}/>
                    <div className="cmt-input-foot">
                      <div className="cmt-input-tools">
                        <Ic.attach width={14} height={14}/>
                        <Ic.message width={14} height={14}/>
                      </div>
                      <Button variant="primary" size="sm">Reply</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === 'linked' && (
              <div className="linked-list">
                <div className="linked-row"><span className="linked-badge tone-navy">PR</span><span className="mono">vyntrox-gateway#1284</span><span>Fix worker pool min-replicas for OIDC callback</span><Badge tone="amber" soft>Open</Badge></div>
                <div className="linked-row"><span className="linked-badge tone-purple">TASK</span><span className="mono">t1</span><span>Implement SAML response parser</span><Badge tone="blue" soft>In progress</Badge></div>
                <div className="linked-row"><span className="linked-badge tone-green">DEAL</span><span className="mono">d2</span><span>Helio Bank — Phase 2 expansion</span><Badge tone="navy" soft>Scoping</Badge></div>
              </div>
            )}
          </Card>
        </div>

        <div className="detail-side">
          <Card>
            <SectionHead title="Properties"/>
            <div className="prop-list">
              <div className="prop"><div className="prop-k">Status</div><div className="prop-v"><StatusPill status={ticket.status}/></div></div>
              <div className="prop"><div className="prop-k">Priority</div><div className="prop-v"><PriorityChip priority={ticket.priority}/></div></div>
              <div className="prop"><div className="prop-k">Assignee</div><div className="prop-v"><Avatar initials={assignee.initials} hue={assignee.hue} size={22}/> {assignee.name}</div></div>
              <div className="prop"><div className="prop-k">Reporter</div><div className="prop-v">{ticket.reporter}</div></div>
              <div className="prop"><div className="prop-k">Client</div><div className="prop-v">{ticket.client}</div></div>
              <div className="prop"><div className="prop-k">Project</div><div className="prop-v">{project?.name}</div></div>
              <div className="prop"><div className="prop-k">Category</div><div className="prop-v">{ticket.category}</div></div>
              <div className="prop"><div className="prop-k">SLA</div><div className="prop-v sla-warn">{ticket.sla}</div></div>
              <div className="prop"><div className="prop-k">Opened</div><div className="prop-v">{ticket.opened}</div></div>
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
    </div>
  );
}

Object.assign(window, { TicketsScreen });
