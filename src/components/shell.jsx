// Shell: Sidebar, Topbar, Role switcher, Notifications dropdown
import React from 'react'
const { useState: useStateShell, useEffect: useEffectShell, useRef: useRefShell } = React;

function Logo({ size = 28, withWordmark = true }) {
  // Inline SVG approximation of Vyntrox shield mark — navy + blue + green slivers
  return (
    <div className="logo">
      <svg viewBox="0 0 64 64" width={size} height={size} className="logo-mark">
        <defs>
          <clipPath id="logoClip"><path d="M32 4 C 18 8 8 16 8 32 C 8 48 20 56 32 60 C 44 56 56 48 56 32 C 56 16 46 8 32 4 Z"/></clipPath>
        </defs>
        <g clipPath="url(#logoClip)">
          <path d="M2 4 Q 24 14 22 44 L 14 64 L -4 60 Z" fill="#15348a"/>
          <path d="M16 4 Q 38 12 36 44 L 28 64 L 10 60 Z" fill="#2f5fd3"/>
          <path d="M34 -2 Q 62 6 58 36 L 48 64 L 28 60 Z" fill="#65bb3c"/>
        </g>
      </svg>
      {withWordmark && <span className="logo-word">Vyntrox</span>}
    </div>
  );
}

function RoleSwitcher({ role, setRole, compact }) {
  const [open, setOpen] = useStateShell(false);
  const cur = ROLES.find(r => r.id === role);
  const ref = useRefShell(null);
  useEffectShell(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="role-switcher" ref={ref}>
      <button className="role-switcher-trigger" onClick={() => setOpen(o => !o)}>
        <span className="role-dot" style={{ background: cur.color }}/>
        <div className="role-text">
          <div className="role-label">{cur.label} view</div>
          <div className="role-sub">{cur.sub}</div>
        </div>
        <Ic.chevD width={14} height={14} className="role-chev"/>
      </button>
      {open && (
        <div className="role-popover">
          <div className="popover-title">Viewing as</div>
          <div className="popover-sub">Switch roles to see how each persona experiences the platform.</div>
          <div className="role-list">
            {ROLES.map(r => (
              <button key={r.id} className={`role-item ${role === r.id ? 'is-active' : ''}`} onClick={() => { setRole(r.id); setOpen(false); }}>
                <span className="role-dot" style={{ background: r.color }}/>
                <div className="role-item-text">
                  <div className="role-item-label">{r.label}</div>
                  <div className="role-item-sub">{r.sub}</div>
                </div>
                {role === r.id && <Ic.ok width={16} height={16} className="role-check"/>}
              </button>
            ))}
          </div>
          <div className="role-foot">Demo prototype · Vyntrox CRM v0.4</div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ role, route, setRoute, collapsed, setCollapsed }) {
  const items = NAV.filter(n => n.roles.includes(role));
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-head">
        <Logo withWordmark={!collapsed}/>
        <button className="sidebar-collapse" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          <Ic.chevR width={14} height={14} style={{ transform: collapsed ? 'rotate(0)' : 'rotate(180deg)' }}/>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          {items.map(n => {
            const Icon = Ic[n.icon];
            const active = route === n.id;
            return (
              <button key={n.id} className={`nav-item ${active ? 'is-active' : ''}`} onClick={() => setRoute(n.id)}>
                <span className="nav-icon">{Icon ? <Icon width={18} height={18}/> : null}</span>
                {!collapsed && <span className="nav-label">{n.label}</span>}
                {!collapsed && n.badge != null && <span className="nav-badge">{n.badge}</span>}
              </button>
            );
          })}
        </div>

        {!collapsed && (
          <div className="sidebar-aside">
            <div className="aside-title">Pinned</div>
            <button className="aside-item" onClick={() => setRoute('projects')}>
              <span className="aside-swatch" style={{ background: '#15348a' }}/>
              Northwind Portal v2
            </button>
            <button className="aside-item" onClick={() => setRoute('projects')}>
              <span className="aside-swatch" style={{ background: '#d97706' }}/>
              Helio Bank — SSO
            </button>
            <button className="aside-item" onClick={() => setRoute('projects')}>
              <span className="aside-swatch" style={{ background: '#65bb3c' }}/>
              Quanta IoT
            </button>
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="sidebar-foot">
          <div className="usage">
            <div className="usage-row"><span>Seats used</span><span><strong>42</strong> / 60</span></div>
            <ProgressBar value={42} max={60} tone="navy" height={4}/>
          </div>
          <button className="upgrade-btn">
            <Ic.zap width={14} height={14}/> Upgrade plan
          </button>
        </div>
      )}
    </aside>
  );
}

function NotificationsButton() {
  const [open, setOpen] = useStateShell(false);
  const ref = useRefShell(null);
  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  useEffectShell(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen(o => !o)}>
        <Ic.bell width={18} height={18}/>
        {unread > 0 && <span className="notif-dot">{unread}</span>}
      </button>
      {open && (
        <div className="notif-popover">
          <div className="popover-title">
            Notifications
            <button className="link-btn">Mark all read</button>
          </div>
          <div className="notif-list">
            {NOTIFICATIONS.map(n => {
              const initials = n.who.split(' ').map(w=>w[0]).slice(0,2).join('');
              const hueMap = { mention: 217, assigned: 12, system: 200, sales: 96 };
              return (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <Avatar initials={initials} hue={hueMap[n.tone] || 217} size={32}/>
                  <div className="notif-body">
                    <div className="notif-text"><strong>{n.who}</strong> {n.text}</div>
                    <div className="notif-when">{n.when} ago</div>
                  </div>
                  {n.unread && <span className="notif-unread-dot"/>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar({ role, route, setRoute, setRole, search, setSearch }) {
  const user = CURRENT_USER[role];
  const titles = {
    dashboard: 'Dashboard', tickets: 'Tickets', tasks: 'My tasks',
    projects: 'Projects', sales: 'Sales pipeline', clients: 'Clients',
    resources: 'Resource allocation', reports: 'Reports', portal: 'My account',
    admin: 'Users & roles', settings: 'Settings',
  };
  const subs = {
    dashboard: 'Everything happening across delivery, sales, and support.',
    tickets:   'Open, triage, and resolve support work.',
    tasks:     'Your assigned work across all projects.',
    projects:  'Active engagements, budgets, and timelines.',
    sales:     'Deals in motion across the pipeline.',
    clients:   'Accounts, contacts, and health.',
    resources: 'Who is working on what, this week and next.',
    reports:   'Performance, revenue, and delivery metrics.',
    portal:    'Your projects, tickets, and invoices.',
    admin:     'People, roles, permissions, and audit.',
    settings:  'Workspace, billing, integrations, and security.',
  };
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-titles">
          <div className="topbar-title">{titles[route]}</div>
          <div className="topbar-sub">{subs[route]}</div>
        </div>
      </div>
      <div className="topbar-mid">
        <div className="search">
          <Ic.search width={16} height={16} className="search-icon"/>
          <input
            placeholder="Search tickets, projects, deals, people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-kbd">⌘K</span>
        </div>
      </div>
      <div className="topbar-right">
        <RoleSwitcher role={role} setRole={setRole}/>
        <div className="topbar-divider"/>
        <NotificationsButton/>
        <IconBtn icon={<Ic.message width={18} height={18}/>}/>
        <div className="topbar-user">
          <Avatar initials={user.initials} hue={ROLES.find(r=>r.id===role).id === 'admin' ? 220 : 200}/>
          <div className="user-text">
            <div className="user-name">{user.name}</div>
            <div className="user-title">{user.title}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Logo, Sidebar, Topbar, RoleSwitcher });
