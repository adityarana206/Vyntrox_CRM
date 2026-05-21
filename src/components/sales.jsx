// Sales pipeline (kanban) + deal detail
import React from 'react'
import { useAppState } from './app-state'
import { Button, Card, SectionHead, Avatar, Badge, Tabs, Ic } from './ui'
import { DEAL_STAGES } from './data'

function SalesScreen({ selectedDeal, setSelectedDeal }) {
  const { deals, moveDeal } = useAppState();
  const [view, setView] = React.useState('board');
  const [dragOverStage, setDragOverStage] = React.useState(null);

  if (selectedDeal) {
    const deal = deals.find(d => d.id === selectedDeal);
    if (deal) return <DealDetail deal={deal} onBack={() => setSelectedDeal(null)}/>;
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <Tabs
          tabs={[{ id: 'board', label: 'Board' }, { id: 'list', label: 'List' }, { id: 'forecast', label: 'Forecast' }]}
          active={view} onChange={setView}
        />
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>All owners</Button>
          <Button variant="ghost" size="sm" icon={<Ic.calendar width={14} height={14}/>}>This quarter</Button>
          <Button variant="ghost" size="sm" icon={<Ic.download width={14} height={14}/>}>Export</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>} onClick={() => openModal('deal')}>New deal</Button>
        </div>
      </div>

      {/* Pipeline summary strip */}
      <div className="pipe-summary">
        {DEAL_STAGES.map(s => {
          const ds = deals.filter(d => d.stage === s.id);
          const val = ds.reduce((a,d) => a + d.value, 0);
          return (
            <div key={s.id} className="pipe-sum">
              <div className="pipe-sum-bar" style={{ background: s.tone }}/>
              <div>
                <div className="pipe-sum-label">{s.label}</div>
                <div className="pipe-sum-val mono">${(val/1000).toFixed(0)}k <span className="muted">· {ds.length}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {view === 'board' && (
        <div className="kanban">
          {DEAL_STAGES.map(stage => {
            const cards = deals.filter(d => d.stage === stage.id);
            const val = cards.reduce((a,d) => a + d.value, 0);
            const isDragOver = dragOverStage === stage.id;
            return (
              <div key={stage.id} className={`kb-col ${isDragOver ? 'is-drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) moveDeal(id, stage.id);
                  setDragOverStage(null);
                }}
              >
                <div className="kb-col-head">
                  <div className="kb-col-title">
                    <span className="kb-col-dot" style={{ background: stage.tone }}/>
                    {stage.label}
                    <span className="kb-col-count">{cards.length}</span>
                  </div>
                  <div className="kb-col-val mono">${(val/1000).toFixed(0)}k</div>
                </div>
                <div className="kb-col-body">
                  {cards.map(d => <DealCard key={d.id} deal={d} onClick={() => setSelectedDeal(d.id)}/>)}
                  <button className="kb-add" onClick={() => openModal('deal')}><Ic.plus width={12} height={12}/> Add deal</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <Card pad={false} className="big-table">
          <div className="bt-head deal-head">
            <div>Deal</div><div>Company</div><div>Stage</div><div>Value</div><div>Confidence</div><div>Close</div><div>Updated</div>
          </div>
          {deals.map(d => {
            const stage = DEAL_STAGES.find(s => s.id === d.stage);
            return (
              <div key={d.id} className="bt-row deal-row-list" onClick={() => setSelectedDeal(d.id)}>
                <div className="deal-cell">
                  <Avatar initials={d.initials} hue={(d.id.charCodeAt(1)*53)%360} size={28}/>
                  <div>
                    <div className="bt-title-text">{d.name}</div>
                    <div className="muted small">{d.contact}</div>
                  </div>
                </div>
                <div>{d.company}</div>
                <div><Badge tone="navy" soft dot>{stage.label}</Badge></div>
                <div className="mono"><strong>${(d.value/1000).toFixed(0)}k</strong></div>
                <div>
                  <div className="conf-cell">
                    <div className="conf-bar"><div className="conf-fill" style={{ width: d.confidence + '%' }}/></div>
                    <span className="mono small">{d.confidence}%</span>
                  </div>
                </div>
                <div>{d.closeBy}</div>
                <div className="muted">{d.updated}</div>
              </div>
            );
          })}
        </Card>
      )}

      {view === 'forecast' && <ForecastView/>}
    </div>
  );
}

function DealCard({ deal, onClick }) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <div className={`deal-card ${dragging ? 'is-dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
        e.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={onClick}>
      <div className="deal-card-head">
        <Avatar initials={deal.initials} hue={(deal.id.charCodeAt(1)*53)%360} size={28}/>
        <div className="deal-card-co">{deal.company}</div>
        <button className="deal-card-more"><Ic.more width={14} height={14}/></button>
      </div>
      <div className="deal-card-title">{deal.name}</div>
      <div className="deal-card-row">
        <div className="deal-card-value mono">${(deal.value/1000).toFixed(0)}k</div>
        <div className="deal-card-conf">
          <div className="conf-bar conf-bar-sm"><div className="conf-fill" style={{ width: deal.confidence + '%' }}/></div>
          <span className="mono small">{deal.confidence}%</span>
        </div>
      </div>
      <div className="deal-card-foot">
        <span className="deal-source"><Ic.dot width={6} height={6}/> {deal.source}</span>
        <span className="muted small">{deal.closeBy}</span>
      </div>
    </div>
  );
}

function ForecastView() {
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const committed = [612, 540, 480, 380, 240, 180];
  const bestCase = [820, 760, 690, 540, 420, 320];
  const max = Math.max(...bestCase);
  return (
    <Card>
      <SectionHead title="Forecast" sub="Weighted commit vs best-case, in thousands"/>
      <div className="forecast-chart">
        {months.map((m, i) => (
          <div key={m} className="fc-col">
            <div className="fc-bars">
              <div className="fc-bar fc-best" style={{ height: `${(bestCase[i]/max)*100}%` }}>
                <span className="fc-val mono">${bestCase[i]}k</span>
              </div>
              <div className="fc-bar fc-commit" style={{ height: `${(committed[i]/max)*100}%` }}/>
            </div>
            <div className="fc-label">{m}</div>
          </div>
        ))}
      </div>
      <div className="forecast-legend">
        <div><span className="leg-sq" style={{ background: '#15348a' }}/> Committed</div>
        <div><span className="leg-sq" style={{ background: 'rgba(21,52,138,0.25)' }}/> Best case</div>
        <div className="leg-spacer"/>
        <div className="forecast-totals">
          <div><span className="muted">Q2 committed</span> <strong className="mono">$1.63M</strong></div>
          <div><span className="muted">Q2 best case</span> <strong className="mono">$2.27M</strong></div>
        </div>
      </div>
    </Card>
  );
}

function DealDetail({ deal, onBack }) {
  const stage = DEAL_STAGES.find(s => s.id === deal.stage);
  return (
    <div className="page detail-page">
      <div className="detail-crumbs">
        <button className="crumb-back" onClick={onBack}><Ic.chevR width={12} height={12} style={{ transform: 'rotate(180deg)' }}/> Pipeline</button>
        <span className="crumb-sep">/</span>
        <span className="muted mono">{deal.id}</span>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-eyebrow">{deal.company}</div>
          <h1 className="detail-title">{deal.name}</h1>
          <div className="detail-tags">
            <Badge tone="navy" soft dot>{stage.label}</Badge>
            <Badge tone="green" soft>{deal.confidence}% confidence</Badge>
            <span className="muted small">{deal.source} · close target {deal.closeBy}</span>
          </div>
        </div>
        <div className="detail-actions">
          <Button variant="ghost" size="sm" icon={<Ic.paper width={14} height={14}/>}>Quote</Button>
          <Button variant="ghost" size="sm" icon={<Ic.message width={14} height={14}/>}>Log call</Button>
          <Button variant="secondary" size="sm">Move stage</Button>
          <Button variant="primary" size="sm" icon={<Ic.flag width={14} height={14}/>}>Mark won</Button>
        </div>
      </div>

      {/* Stage progress ribbon */}
      <div className="stage-ribbon">
        {DEAL_STAGES.map((s, i) => {
          const curIdx = DEAL_STAGES.findIndex(x => x.id === deal.stage);
          const state = i < curIdx ? 'done' : i === curIdx ? 'cur' : 'next';
          return (
            <div key={s.id} className={`ribbon-stage ribbon-${state}`}>
              <div className="ribbon-num">{i+1}</div>
              <div className="ribbon-text">
                <div className="ribbon-label">{s.label}</div>
                <div className="ribbon-meta">
                  {state === 'done' && 'Completed'}
                  {state === 'cur' && 'Current · 4 days'}
                  {state === 'next' && '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="kpi-grid kpi-grid-3">
            <KPI label="Deal value" value={`$${(deal.value/1000).toFixed(0)}k`} color="#15348a"/>
            <KPI label="Weighted value" value={`$${((deal.value*deal.confidence/100)/1000).toFixed(0)}k`} color="#65bb3c"/>
            <KPI label="Days in stage" value="4" sub="avg for stage is 7" color="#d97706"/>
          </div>

          <Card>
            <SectionHead title="Scope summary"/>
            <p>Phase 2 expansion of the Helio Bank SSO rollout — adds SAML federation across 3 subsidiaries, hardware token attestation, and a managed audit-log export pipeline to their SIEM.</p>
            <div className="scope-bullets">
              <div className="scope-row"><Ic.ok width={14} height={14} className="ok-icon"/> SAML federation for 3 subsidiaries (Helio NA, Helio EU, Helio Tech)</div>
              <div className="scope-row"><Ic.ok width={14} height={14} className="ok-icon"/> WebAuthn / hardware-token attestation flow</div>
              <div className="scope-row"><Ic.ok width={14} height={14} className="ok-icon"/> Audit log streaming to Splunk + S3 sink</div>
              <div className="scope-row"><Ic.warn width={14} height={14} className="warn-icon"/> Penetration test scope still under negotiation</div>
            </div>
          </Card>

          <Card>
            <SectionHead title="Recent activity"/>
            <div className="feed">
              {[
                { who: 'Riley Chen',   verb: 'sent', target: 'SOW v2 to Sven', when: '1d ago', tone: 'sales' },
                { who: 'Sven Carlsen', verb: 'opened the quote', target: '', when: '20h ago', tone: 'ticket' },
                { who: 'Riley Chen',   verb: 'logged a call', target: 'Discovery follow-up — 32 min', when: '3d ago', tone: 'sales' },
                { who: 'Daniel Okafor',verb: 'attached', target: 'Architecture brief.pdf', when: '4d ago', tone: 'pm' },
              ].map((a,i,arr) => (
                <div key={i} className="feed-item">
                  <div className="feed-line">
                    <span className="feed-dot" style={{ background: '#15348a' }}/>
                    {i < arr.length-1 && <span className="feed-stem"/>}
                  </div>
                  <div className="feed-body">
                    <div className="feed-text"><strong>{a.who}</strong> {a.verb} {a.target && <span className="feed-target">{a.target}</span>}</div>
                    <div className="muted small">{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="detail-side">
          <Card>
            <SectionHead title="Primary contact"/>
            <div className="contact-card">
              <Avatar initials="SC" hue={195} size={48}/>
              <div className="contact-card-text">
                <div className="contact-card-name">{deal.contact}</div>
                <div className="muted small">CTO · Helio Bank</div>
              </div>
            </div>
            <div className="contact-buttons">
              <button className="cb"><Ic.message width={14} height={14}/> Email</button>
              <button className="cb"><Ic.clock width={14} height={14}/> Meeting</button>
              <button className="cb"><Ic.paper width={14} height={14}/> Quote</button>
            </div>
          </Card>

          <Card>
            <SectionHead title="Account brief"/>
            <div className="prop-list">
              <div className="prop"><div className="prop-k">Company</div><div className="prop-v">{deal.company}</div></div>
              <div className="prop"><div className="prop-k">Industry</div><div className="prop-v">FinTech</div></div>
              <div className="prop"><div className="prop-k">Employees</div><div className="prop-v">2,400</div></div>
              <div className="prop"><div className="prop-k">ARR</div><div className="prop-v mono">$504k</div></div>
              <div className="prop"><div className="prop-k">Lifetime</div><div className="prop-v">3.7 years</div></div>
              <div className="prop"><div className="prop-k">Source</div><div className="prop-v">{deal.source}</div></div>
            </div>
          </Card>

          <Card>
            <SectionHead title="Team on deal"/>
            <div className="team-list">
              <div className="team-row"><Avatar initials="RC" hue={32} size={28}/><div><div>Riley Chen</div><div className="muted small">Owner · AE</div></div></div>
              <div className="team-row"><Avatar initials="DO" hue={220} size={28}/><div><div>Daniel Okafor</div><div className="muted small">Solution architect</div></div></div>
              <div className="team-row"><Avatar initials="MW" hue={200} size={28}/><div><div>Marcus Webb</div><div className="muted small">Pre-sales eng</div></div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SalesScreen });

export default SalesScreen;
