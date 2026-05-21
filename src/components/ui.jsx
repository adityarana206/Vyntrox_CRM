// Shared UI atoms + icon library for Vyntrox CRM
import React from 'react'
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ===== Icons (stroked, 20px optical) =====
const Ic = {
  grid:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  ticket:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M9 6v12" strokeDasharray="2 2"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12.5 9 17l11-11"/></svg>,
  folder:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>,
  pipeline:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="10" rx="1"/><rect x="17" y="5" width="4" height="6" rx="1"/></svg>,
  building:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15 11h3a2 2 0 0 1 2 2v8"/><path d="M3 21h18"/><path d="M8 7h3M8 11h3M8 15h3"/></svg>,
  people:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M21 20c0-2.2-1.7-4-4-4"/></svg>,
  chart:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 6-7"/></svg>,
  user:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  shield:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>,
  cog:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  search:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  bell:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  plus:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  filter:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></svg>,
  sort:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 4v16M7 4l-3 4M7 4l3 4M17 20V4M17 20l-3-4M17 20l3-4"/></svg>,
  chevR:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>,
  chevD:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  more:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>,
  dot:     (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="4"/></svg>,
  arrowUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  arrowDn: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  spark:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
  clock:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  flag:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4h11l-2 4 2 4H5"/></svg>,
  attach:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3L15 7.5"/></svg>,
  paper:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/></svg>,
  message: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"/></svg>,
  invite:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M19 8v6M16 11h6"/></svg>,
  link:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>,
  warn:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18v.5"/></svg>,
  ok:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>,
  download:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12M6 11l6 6 6-6"/><path d="M5 21h14"/></svg>,
  star:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3 2.6 6.1 6.6.5-5 4.4 1.5 6.4L12 17.3 6.3 20.4l1.5-6.4-5-4.4 6.6-.5L12 3Z"/></svg>,
  calendar:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  fire:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-9Z"/></svg>,
  zap:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"/></svg>,
  logout:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>,
  upload:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8"/><path d="M12 3v12"/></svg>,
  close:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
};

// ===== Atoms =====
function Avatar({ initials, hue = 217, size = 28, src }) {
  const bg = `hsl(${hue} 70% 92%)`;
  const fg = `hsl(${hue} 55% 30%)`;
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size*0.4 }}>
      {initials}
    </div>
  );
}

function AvatarStack({ ids, max = 4, size = 24 }) {
  const all = ids.map(id => TEAM.find(t => t.id === id)).filter(Boolean);
  const shown = all.slice(0, max);
  const extra = all.length - shown.length;
  return (
    <div className="avatar-stack" style={{ '--size': size + 'px' }}>
      {shown.map((u, i) => <Avatar key={u.id} initials={u.initials} hue={u.hue} size={size} />)}
      {extra > 0 && <div className="avatar avatar-extra" style={{ width: size, height: size, fontSize: size*0.35 }}>+{extra}</div>}
    </div>
  );
}

function Badge({ children, tone = 'neutral', soft = true, dot = false }) {
  return (
    <span className={`badge badge-${tone} ${soft ? 'soft' : 'solid'}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    'Open':         'blue',
    'In progress':  'amber',
    'In review':    'purple',
    'Resolved':     'green',
    'Closed':       'neutral',
    'Backlog':      'neutral',
    'Scheduled':    'navy',
    'On track':     'green',
    'At risk':      'amber',
    'On hold':      'neutral',
    'Active':       'green',
    'Invited':      'amber',
    'Todo':         'neutral',
  };
  return <Badge tone={map[status] || 'neutral'} dot>{status}</Badge>;
}

function PriorityChip({ priority }) {
  const map = { Urgent: 'red', High: 'amber', Medium: 'blue', Low: 'neutral' };
  return <Badge tone={map[priority] || 'neutral'}>{priority}</Badge>;
}

function ProgressBar({ value, max = 100, tone = 'navy', height = 6, showPct = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress" style={{ height }}>
      <div className={`progress-fill tone-${tone}`} style={{ width: pct + '%' }} />
      {showPct && <span className="progress-pct">{Math.round(pct)}%</span>}
    </div>
  );
}

function Sparkline({ data, color = '#1e3a8a', height = 28, width = 96, fill = true }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${pts.join(' L ')}`;
  const area = `${path} L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} className="sparkline">
      {fill && <path d={area} fill={color} opacity="0.08" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MiniBars({ data, color = '#1e3a8a', height = 32, width = 96, accentIdx }) {
  const max = Math.max(...data, 1);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} className="minibars">
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - 2));
        return <rect key={i} x={i*bw + 1} y={height - h} width={bw - 2} height={h} rx="1.5"
          fill={i === accentIdx ? color : color} opacity={i === accentIdx ? 1 : 0.25} />;
      })}
    </svg>
  );
}

function Donut({ value, max = 100, size = 72, stroke = 8, color = '#1e3a8a', track = '#e7e5e4', label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, (value / max) * 100);
  const off = c - (pct / 100) * c;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div className="donut-label">{label ?? `${Math.round(pct)}%`}</div>
    </div>
  );
}

function Card({ children, className = '', pad = true, ...rest }) {
  return <div className={`card ${pad ? 'card-pad' : ''} ${className}`} {...rest}>{children}</div>;
}

function SectionHead({ title, sub, action }) {
  return (
    <div className="section-head">
      <div>
        <div className="section-title">{title}</div>
        {sub && <div className="section-sub">{sub}</div>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, loading, disabled, ...rest }) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={onClick} disabled={disabled || loading} {...rest}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
      {iconRight && <span className="btn-icon">{iconRight}</span>}
    </button>
  );
}

function IconBtn({ icon, onClick, title, ...rest }) {
  return (
    <button className="icon-btn" onClick={onClick} title={title} {...rest}>
      {icon}
    </button>
  );
}

function KPI({ label, value, delta, trend, color = '#1e3a8a', sub }) {
  const up = delta && delta.startsWith('+');
  return (
    <Card className="kpi">
      <div className="kpi-row">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          {sub && <div className="kpi-sub">{sub}</div>}
        </div>
        {trend && <Sparkline data={trend} color={color} width={96} height={36}/>}
      </div>
      {delta && (
        <div className={`kpi-delta ${up ? 'up' : 'down'}`}>
          {up ? <Ic.arrowUp width={12} height={12}/> : <Ic.arrowDn width={12} height={12}/>}
          {delta}
        </div>
      )}
    </Card>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'is-active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
          {t.badge != null && <span className="tab-badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, sub, action }) {
  return (
    <div className="empty">
      <div className="empty-art">
        <Ic.spark width={20} height={20}/>
      </div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action}
    </div>
  );
}

Object.assign(window, {
  Ic, Avatar, AvatarStack, Badge, StatusPill, PriorityChip,
  ProgressBar, Sparkline, MiniBars, Donut, Card, SectionHead,
  Button, IconBtn, KPI, Tabs, EmptyState,
});

export { Ic, Avatar, AvatarStack, Badge, StatusPill, PriorityChip, ProgressBar, Sparkline, MiniBars, Donut, Card, SectionHead, Button, IconBtn, KPI, Tabs, EmptyState };
