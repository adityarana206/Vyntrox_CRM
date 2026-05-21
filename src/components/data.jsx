// Demo data for Vyntrox CRM
import React from 'react'
const ROLES = [
  { id: 'admin', label: 'Admin', sub: 'Full access', color: '#1e3a8a' },
  { id: 'manager', label: 'Manager', sub: 'Team lead', color: '#2563eb' },
  { id: 'resource', label: 'Resource', sub: 'Employee', color: '#65bb3c' },
  { id: 'sales', label: 'Sales', sub: 'Account exec', color: '#d97706' },
  { id: 'client', label: 'Client', sub: 'External', color: '#7c3aed' },
];

const CURRENT_USER = {
  admin:    { name: 'Priya Sharma',    initials: 'PS', email: 'priya@vyntrox.com',   title: 'Platform Admin' },
  manager:  { name: 'Daniel Okafor',   initials: 'DO', email: 'daniel@vyntrox.com',  title: 'Delivery Manager' },
  resource: { name: 'Aarav Mehta',     initials: 'AM', email: 'aarav@vyntrox.com',   title: 'Senior Engineer' },
  sales:    { name: 'Riley Chen',      initials: 'RC', email: 'riley@vyntrox.com',   title: 'Account Executive' },
  client:   { name: 'Mara Lindqvist',  initials: 'ML', email: 'mara@northwind.io',   title: 'CTO, Northwind' },
};

const TEAM = [
  { id: 'u1', name: 'Aarav Mehta',     initials: 'AM', role: 'Senior Engineer',   dept: 'Engineering', capacity: 40, allocated: 36, hue: 217 },
  { id: 'u2', name: 'Sofia Reyes',     initials: 'SR', role: 'UX Designer',       dept: 'Design',      capacity: 40, allocated: 22, hue: 280 },
  { id: 'u3', name: 'Tomás Bauer',     initials: 'TB', role: 'DevOps Engineer',   dept: 'Engineering', capacity: 40, allocated: 40, hue: 12  },
  { id: 'u4', name: 'Lena Park',       initials: 'LP', role: 'QA Lead',           dept: 'Engineering', capacity: 40, allocated: 28, hue: 168 },
  { id: 'u5', name: 'Daniel Okafor',   initials: 'DO', role: 'Delivery Manager',  dept: 'PMO',         capacity: 40, allocated: 32, hue: 220 },
  { id: 'u6', name: 'Yuki Tanaka',     initials: 'YT', role: 'Full-stack Dev',    dept: 'Engineering', capacity: 40, allocated: 38, hue: 340 },
  { id: 'u7', name: 'Marcus Webb',     initials: 'MW', role: 'Cloud Architect',   dept: 'Engineering', capacity: 40, allocated: 18, hue: 200 },
  { id: 'u8', name: 'Ines Caro',       initials: 'IC', role: 'Data Engineer',     dept: 'Data',        capacity: 40, allocated: 30, hue: 96  },
];

const CLIENTS = [
  { id: 'c1', name: 'Northwind Logistics',  industry: 'Logistics',   mrr: 18400, since: '2023-04', health: 92, contact: 'Mara Lindqvist',  initials: 'NL' },
  { id: 'c2', name: 'Helio Bank',           industry: 'FinTech',     mrr: 42000, since: '2022-09', health: 78, contact: 'Sven Carlsen',    initials: 'HB' },
  { id: 'c3', name: 'Marigold Health',      industry: 'Healthcare',  mrr: 9800,  since: '2024-01', health: 64, contact: 'Dr. Adeyemi',     initials: 'MH' },
  { id: 'c4', name: 'Brightline Retail',    industry: 'Retail',      mrr: 14500, since: '2023-11', health: 88, contact: 'Olivia Park',     initials: 'BR' },
  { id: 'c5', name: 'Quanta Energy',        industry: 'Energy',      mrr: 27000, since: '2022-02', health: 71, contact: 'Rafael Costa',    initials: 'QE' },
];

const PROJECTS = [
  { id: 'p1', name: 'Northwind Portal v2',       client: 'Northwind Logistics', clientId: 'c1', status: 'On track',   progress: 68, budget: 184000, spent: 121200, due: 'Jul 12', team: ['u1','u2','u4'], lead: 'u5', tags: ['Web App','React'] },
  { id: 'p2', name: 'Helio Bank — SSO Rollout',  client: 'Helio Bank',          clientId: 'c2', status: 'At risk',    progress: 41, budget: 220000, spent: 112000, due: 'Jun 04', team: ['u1','u3','u7'], lead: 'u5', tags: ['Security','SSO'] },
  { id: 'p3', name: 'Marigold Data Migration',   client: 'Marigold Health',     clientId: 'c3', status: 'On track',   progress: 82, budget: 96000,  spent: 71400,  due: 'May 28', team: ['u8','u3'],      lead: 'u5', tags: ['Data','Migration'] },
  { id: 'p4', name: 'Brightline POS Integration',client: 'Brightline Retail',   clientId: 'c4', status: 'On hold',    progress: 22, budget: 142000, spent: 28000,  due: 'Aug 30', team: ['u6','u4'],      lead: 'u5', tags: ['Integration'] },
  { id: 'p5', name: 'Quanta IoT Dashboard',      client: 'Quanta Energy',       clientId: 'c5', status: 'On track',   progress: 55, budget: 168000, spent: 84500,  due: 'Jul 22', team: ['u1','u2','u6','u8'], lead: 'u5', tags: ['IoT','Dashboard'] },
];

const TICKETS = [
  { id: 'VT-2418', title: 'Login throws 503 after SSO redirect',        client: 'Helio Bank',          clientId: 'c2', project: 'p2', priority: 'Urgent',  status: 'In progress', assignee: 'u3', reporter: 'Sven Carlsen',  opened: '2h ago',  sla: '4h left',   category: 'Bug',         comments: 7 },
  { id: 'VT-2417', title: 'Add bulk-export to shipments table',         client: 'Northwind Logistics', clientId: 'c1', project: 'p1', priority: 'High',    status: 'In review',   assignee: 'u1', reporter: 'Mara Lindqvist',opened: '5h ago',  sla: '1d left',   category: 'Feature',     comments: 3 },
  { id: 'VT-2416', title: 'Mobile dashboard charts render blank on iOS',client: 'Quanta Energy',       clientId: 'c5', project: 'p5', priority: 'High',    status: 'Open',        assignee: 'u6', reporter: 'Rafael Costa',  opened: '8h ago',  sla: '20h left',  category: 'Bug',         comments: 2 },
  { id: 'VT-2415', title: 'Slow query on patient lookup endpoint',      client: 'Marigold Health',     clientId: 'c3', project: 'p3', priority: 'Medium',  status: 'In progress', assignee: 'u8', reporter: 'Dr. Adeyemi',   opened: '1d ago',  sla: '2d left',   category: 'Performance', comments: 5 },
  { id: 'VT-2414', title: 'Add dark mode to merchant POS app',          client: 'Brightline Retail',   clientId: 'c4', project: 'p4', priority: 'Low',     status: 'Backlog',     assignee: 'u6', reporter: 'Olivia Park',   opened: '2d ago',  sla: '—',         category: 'Feature',     comments: 1 },
  { id: 'VT-2413', title: 'Quarterly maintenance — Helio prod cluster', client: 'Helio Bank',          clientId: 'c2', project: 'p2', priority: 'Medium',  status: 'Scheduled',   assignee: 'u3', reporter: 'Internal',      opened: '3d ago',  sla: '5d left',   category: 'Maintenance', comments: 0 },
  { id: 'VT-2412', title: 'CSV import fails on rows with em-dash',      client: 'Northwind Logistics', clientId: 'c1', project: 'p1', priority: 'Medium',  status: 'Resolved',    assignee: 'u1', reporter: 'Mara Lindqvist',opened: '3d ago',  sla: 'Met',       category: 'Bug',         comments: 4 },
  { id: 'VT-2411', title: 'Stripe webhook double-firing on retries',    client: 'Brightline Retail',   clientId: 'c4', project: 'p4', priority: 'Urgent',  status: 'Open',        assignee: 'u1', reporter: 'Olivia Park',   opened: '4h ago',  sla: '3h left',   category: 'Bug',         comments: 6 },
  { id: 'VT-2410', title: 'Audit log export to S3 missing entries',     client: 'Helio Bank',          clientId: 'c2', project: 'p2', priority: 'High',    status: 'In progress', assignee: 'u7', reporter: 'Sven Carlsen',  opened: '6h ago',  sla: '14h left',  category: 'Bug',         comments: 2 },
  { id: 'VT-2409', title: 'Onboarding: add SAML option to setup wizard',client: 'Helio Bank',          clientId: 'c2', project: 'p2', priority: 'Medium',  status: 'Open',        assignee: 'u2', reporter: 'Sven Carlsen',  opened: '1d ago',  sla: '4d left',   category: 'Feature',     comments: 1 },
];

// Sales pipeline — tech-services flavored stages
const DEAL_STAGES = [
  { id: 'discovery',   label: 'Discovery',   tone: '#94a3b8' },
  { id: 'scoping',     label: 'Scoping',     tone: '#3b82f6' },
  { id: 'sow',         label: 'SOW sent',    tone: '#8b5cf6' },
  { id: 'negotiation', label: 'Negotiation', tone: '#d97706' },
  { id: 'won',         label: 'Closed won',  tone: '#65bb3c' },
];

const DEALS = [
  { id: 'd1',  name: 'Atlas Freight — Logistics dashboard',     company: 'Atlas Freight',     value: 184000, stage: 'discovery',   owner: 'sales', confidence: 20, closeBy: 'Aug 12', updated: '2h ago',  initials: 'AF', source: 'Inbound',  contact: 'Jonas Veldt' },
  { id: 'd2',  name: 'Helio Bank — Phase 2 expansion',          company: 'Helio Bank',        value: 320000, stage: 'scoping',     owner: 'sales', confidence: 45, closeBy: 'Jul 30', updated: '1d ago',  initials: 'HB', source: 'Existing', contact: 'Sven Carlsen' },
  { id: 'd3',  name: 'Verda Pharma — Compliance audit',         company: 'Verda Pharma',      value: 92000,  stage: 'scoping',     owner: 'sales', confidence: 40, closeBy: 'Jun 22', updated: '6h ago',  initials: 'VP', source: 'Referral', contact: 'Dr. Patel' },
  { id: 'd4',  name: 'Northwind — Mobile driver app',           company: 'Northwind Logistics',value: 142000,stage: 'sow',         owner: 'sales', confidence: 65, closeBy: 'Jun 14', updated: '3h ago',  initials: 'NL', source: 'Existing', contact: 'Mara Lindqvist' },
  { id: 'd5',  name: 'Stellar Media — CMS migration',           company: 'Stellar Media',     value: 78000,  stage: 'sow',         owner: 'sales', confidence: 60, closeBy: 'Jun 28', updated: '8h ago',  initials: 'SM', source: 'Outbound', contact: 'Pia Romano' },
  { id: 'd6',  name: 'Brightline — Loyalty platform',           company: 'Brightline Retail', value: 215000, stage: 'negotiation', owner: 'sales', confidence: 80, closeBy: 'May 28', updated: '1h ago',  initials: 'BR', source: 'Existing', contact: 'Olivia Park' },
  { id: 'd7',  name: 'Kestrel Aviation — Maintenance SaaS',     company: 'Kestrel Aviation', value: 168000, stage: 'negotiation', owner: 'sales', confidence: 75, closeBy: 'Jun 02', updated: '4h ago',  initials: 'KA', source: 'Inbound',  contact: 'Yannick Roux' },
  { id: 'd8',  name: 'Quanta — IoT Phase 3',                    company: 'Quanta Energy',     value: 285000, stage: 'won',         owner: 'sales', confidence: 100,closeBy: 'May 10', updated: 'Apr 28',  initials: 'QE', source: 'Existing', contact: 'Rafael Costa' },
  { id: 'd9',  name: 'Marigold — Telehealth module',            company: 'Marigold Health',   value: 64000,  stage: 'won',         owner: 'sales', confidence: 100,closeBy: 'May 02', updated: 'Apr 22',  initials: 'MH', source: 'Existing', contact: 'Dr. Adeyemi' },
];

// Tasks for "my work" / project detail
const TASKS = [
  { id: 't1',  title: 'Implement SAML response parser',      project: 'p2', assignee: 'u3', status: 'In progress', due: 'Tomorrow', priority: 'Urgent',  estimate: '8h',  ticket: 'VT-2418' },
  { id: 't2',  title: 'Write E2E tests for bulk export',     project: 'p1', assignee: 'u4', status: 'Todo',        due: 'Thu',      priority: 'High',    estimate: '6h',  ticket: 'VT-2417' },
  { id: 't3',  title: 'Design empty state for shipments',    project: 'p1', assignee: 'u2', status: 'In review',   due: 'Today',    priority: 'Medium',  estimate: '3h',  ticket: 'VT-2417' },
  { id: 't4',  title: 'Optimize patient lookup index',       project: 'p3', assignee: 'u8', status: 'In progress', due: 'Fri',      priority: 'High',    estimate: '4h',  ticket: 'VT-2415' },
  { id: 't5',  title: 'Audit log S3 sink — investigate gap', project: 'p2', assignee: 'u7', status: 'In progress', due: 'Tomorrow', priority: 'High',    estimate: '5h',  ticket: 'VT-2410' },
  { id: 't6',  title: 'POS Stripe retry deduplication',      project: 'p4', assignee: 'u1', status: 'Todo',        due: 'Today',    priority: 'Urgent',  estimate: '6h',  ticket: 'VT-2411' },
  { id: 't7',  title: 'Mobile chart renderer — iOS fix',     project: 'p5', assignee: 'u6', status: 'Todo',        due: 'Mon',      priority: 'High',    estimate: '7h',  ticket: 'VT-2416' },
  { id: 't8',  title: 'Capacity planning Q3 — draft',        project: 'p1', assignee: 'u5', status: 'In progress', due: 'Wed',      priority: 'Medium',  estimate: '2h',  ticket: null },
];

const NOTIFICATIONS = [
  { id: 'n1', who: 'Sven Carlsen',   text: 'commented on VT-2418',                   when: '4m',  unread: true,  tone: 'mention' },
  { id: 'n2', who: 'Daniel Okafor',  text: 'assigned you VT-2411 (Urgent)',          when: '22m', unread: true,  tone: 'assigned' },
  { id: 'n3', who: 'CI Bot',         text: 'deploy succeeded — Helio prod',          when: '1h',  unread: false, tone: 'system' },
  { id: 'n4', who: 'Riley Chen',     text: 'closed Quanta — IoT Phase 3 ($285k)',    when: '3h',  unread: false, tone: 'sales' },
  { id: 'n5', who: 'Mara Lindqvist', text: 'replied to "Bulk export"',               when: '6h',  unread: false, tone: 'mention' },
];

// Activity feed for dashboard
const ACTIVITY = [
  { who: 'Riley Chen',     verb: 'closed', target: 'Quanta — IoT Phase 3', meta: '$285,000', when: '3h ago',  tone: 'sales' },
  { who: 'Aarav Mehta',    verb: 'resolved', target: 'VT-2412',            meta: 'CSV import bug',  when: '5h ago',  tone: 'ticket' },
  { who: 'Sofia Reyes',    verb: 'submitted for review', target: 'Empty state — shipments', meta: 'Northwind Portal v2', when: '6h ago', tone: 'design' },
  { who: 'Daniel Okafor',  verb: 'reassigned', target: '3 tickets',         meta: 'to Tomás',        when: '8h ago', tone: 'pm' },
  { who: 'Tomás Bauer',    verb: 'opened', target: 'VT-2418',               meta: 'Helio SSO 503',   when: '2h ago', tone: 'ticket' },
  { who: 'Riley Chen',     verb: 'moved', target: 'Brightline — Loyalty',  meta: 'to Negotiation',  when: '1h ago', tone: 'sales' },
];

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid',     roles: ['admin','manager','resource','sales','client'] },
  { id: 'tickets',   label: 'Tickets',   icon: 'ticket',   roles: ['admin','manager','resource','client'] },
  { id: 'tasks',     label: 'My tasks',  icon: 'check',    roles: ['admin','manager','resource'] },
  { id: 'projects',  label: 'Projects',  icon: 'folder',   roles: ['admin','manager','resource','client'] },
  { id: 'sales',     label: 'Pipeline',  icon: 'pipeline', roles: ['admin','sales','manager'] },
  { id: 'clients',   label: 'Clients',   icon: 'building', roles: ['admin','sales','manager'] },
  { id: 'resources', label: 'Resources', icon: 'people',   roles: ['admin','manager'] },
  { id: 'reports',   label: 'Reports',   icon: 'chart',    roles: ['admin','manager','sales'] },
  { id: 'portal',    label: 'My account',icon: 'user',     roles: ['admin','client'] },
  { id: 'admin',     label: 'Users & roles', icon: 'shield', roles: ['admin'] },
  { id: 'settings',  label: 'Settings',  icon: 'cog',      roles: ['admin','manager','resource','sales','client'] },
];

const USERS_ADMIN = [
  { id: 'u1', name: 'Aarav Mehta',    email: 'aarav@vyntrox.com',  role: 'Resource', dept: 'Engineering', status: 'Active',  twofa: true,  last: '2m ago' },
  { id: 'u2', name: 'Sofia Reyes',    email: 'sofia@vyntrox.com',  role: 'Resource', dept: 'Design',      status: 'Active',  twofa: true,  last: '14m ago' },
  { id: 'u3', name: 'Tomás Bauer',    email: 'tomas@vyntrox.com',  role: 'Resource', dept: 'Engineering', status: 'Active',  twofa: true,  last: '1h ago' },
  { id: 'u4', name: 'Lena Park',      email: 'lena@vyntrox.com',   role: 'Resource', dept: 'Engineering', status: 'Active',  twofa: false, last: 'Yesterday' },
  { id: 'u5', name: 'Daniel Okafor',  email: 'daniel@vyntrox.com', role: 'Manager',  dept: 'PMO',         status: 'Active',  twofa: true,  last: 'just now' },
  { id: 'u6', name: 'Yuki Tanaka',    email: 'yuki@vyntrox.com',   role: 'Resource', dept: 'Engineering', status: 'Active',  twofa: true,  last: '6m ago' },
  { id: 'u7', name: 'Marcus Webb',    email: 'marcus@vyntrox.com', role: 'Resource', dept: 'Engineering', status: 'Active',  twofa: true,  last: '3h ago' },
  { id: 'u8', name: 'Ines Caro',      email: 'ines@vyntrox.com',   role: 'Resource', dept: 'Data',        status: 'Active',  twofa: true,  last: '45m ago' },
  { id: 'u9', name: 'Riley Chen',     email: 'riley@vyntrox.com',  role: 'Sales',    dept: 'Revenue',     status: 'Active',  twofa: true,  last: '11m ago' },
  { id: 'u10',name: 'Priya Sharma',   email: 'priya@vyntrox.com',  role: 'Admin',    dept: 'IT',          status: 'Active',  twofa: true,  last: 'now' },
  { id: 'u11',name: 'Hugo Andersen',  email: 'hugo@vyntrox.com',   role: 'Sales',    dept: 'Revenue',     status: 'Invited', twofa: false, last: '—' },
  { id: 'u12',name: 'Mara Lindqvist', email: 'mara@northwind.io',  role: 'Client',   dept: 'Northwind',   status: 'Active',  twofa: true,  last: '2h ago' },
];

const ROLE_DEFS = [
  { id: 'admin',    name: 'Admin',    members: 2,  perms: ['Manage users','Billing','API keys','All projects','All tickets','All deals','Settings'] },
  { id: 'manager',  name: 'Manager',  members: 4,  perms: ['Assign tasks','View team','Edit projects','Resolve tickets','View reports'] },
  { id: 'resource', name: 'Resource', members: 38, perms: ['Own tasks','Comment on tickets','Log time','View assigned projects'] },
  { id: 'sales',    name: 'Sales',    members: 6,  perms: ['Pipeline','Deals','Quotes','View clients','Read reports'] },
  { id: 'client',   name: 'Client',   members: 24, perms: ['Submit tickets','View own projects','Invoices','Comment'] },
];

Object.assign(window, {
  ROLES, CURRENT_USER, TEAM, CLIENTS, PROJECTS, TICKETS,
  DEAL_STAGES, DEALS, TASKS, NOTIFICATIONS, ACTIVITY, NAV,
  USERS_ADMIN, ROLE_DEFS,
});

export { ROLES, CURRENT_USER, TEAM, CLIENTS, PROJECTS, TICKETS, DEAL_STAGES, DEALS, TASKS, NOTIFICATIONS, ACTIVITY, NAV, USERS_ADMIN, ROLE_DEFS };
