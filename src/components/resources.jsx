// Resource Allocation board
import React from 'react'
function ResourcesScreen() {
  const { allocations, moveAllocation } = useAppState();
  const [week, setWeek] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(null); // `${personId}:${dayIdx}`
  const [dragging, setDragging] = React.useState(null); // chipId
  const weeks = ['May 13 – May 19', 'May 20 – May 26', 'May 27 – Jun 2', 'Jun 3 – Jun 9'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const projectTones = {
    p1: '#15348a', p2: '#d97706', p3: '#65bb3c', p4: '#7c3aed', p5: '#2f5fd3',
  };

  const allocFor = (person, dayIdx) => allocations[person.id]?.[dayIdx] || [];

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="alloc-weeks">
          <IconBtn icon={<Ic.chevR width={14} height={14} style={{transform:'rotate(180deg)'}}/>} onClick={() => setWeek(w => Math.max(0,w-1))}/>
          <div className="alloc-week-label">{weeks[week]}</div>
          <IconBtn icon={<Ic.chevR width={14} height={14}/>} onClick={() => setWeek(w => Math.min(weeks.length-1,w+1))}/>
          <Button variant="ghost" size="sm">Today</Button>
        </div>
        <div className="toolbar-right">
          <Button variant="ghost" size="sm" icon={<Ic.filter width={14} height={14}/>}>All depts</Button>
          <Button variant="ghost" size="sm" icon={<Ic.people width={14} height={14}/>}>Group by role</Button>
          <Button variant="primary" size="sm" icon={<Ic.plus width={14} height={14}/>}>Assign work</Button>
        </div>
      </div>

      {/* Capacity summary tiles */}
      <div className="alloc-summary">
        <div className="alloc-tile"><div className="alloc-tile-num">8</div><div className="alloc-tile-label">People</div></div>
        <div className="alloc-tile"><div className="alloc-tile-num">320h</div><div className="alloc-tile-label">Capacity / wk</div></div>
        <div className="alloc-tile"><div className="alloc-tile-num">244h</div><div className="alloc-tile-label">Allocated</div></div>
        <div className="alloc-tile alloc-tile-warn"><div className="alloc-tile-num">2</div><div className="alloc-tile-label">Overbooked</div></div>
        <div className="alloc-tile alloc-tile-good"><div className="alloc-tile-num">76%</div><div className="alloc-tile-label">Utilization</div></div>
      </div>

      <Card pad={false} className="alloc-grid-card">
        <div className="alloc-grid">
          <div className="alloc-row alloc-head">
            <div className="alloc-person-head">Person</div>
            {days.map(d => <div key={d} className="alloc-day-head">{d}</div>)}
            <div className="alloc-total-head">Total</div>
          </div>
          {TEAM.map(person => {
            const total = days.reduce((sum, _, i) => sum + allocFor(person, i).reduce((a,c) => a+c.hours, 0), 0);
            const tone = total > 40 ? 'red' : total >= 36 ? 'amber' : 'navy';
            return (
              <div key={person.id} className="alloc-row">
                <div className="alloc-person">
                  <Avatar initials={person.initials} hue={person.hue} size={32}/>
                  <div>
                    <div className="alloc-name">{person.name}</div>
                    <div className="muted small">{person.role}</div>
                  </div>
                </div>
                {days.map((d, di) => {
                  const chips = allocFor(person, di);
                  const dayTotal = chips.reduce((a,c) => a+c.hours, 0);
                  const cellKey = `${person.id}:${di}`;
                  const isOver = dragOver === cellKey;
                  return (
                    <div key={d}
                      className={`alloc-day ${isOver ? 'is-drop-target' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(cellKey); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const payload = e.dataTransfer.getData('text/plain');
                        if (!payload) return;
                        const [chipId, fromPerson, fromDay] = payload.split('|');
                        moveAllocation(chipId, fromPerson, parseInt(fromDay,10), person.id, di);
                        setDragOver(null);
                        setDragging(null);
                      }}
                    >
                      {chips.map((c, ci) => {
                        const proj = PROJECTS.find(p => p.id === c.projectId);
                        const color = c.tone || projectTones[c.projectId] || '#a8a29e';
                        return (
                          <div key={c.id || ci}
                            className={`alloc-chip ${dragging === c.id ? 'is-dragging' : ''}`}
                            style={{ background: `${color}15`, borderLeft: `3px solid ${color}` }}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', `${c.id}|${person.id}|${di}`);
                              e.dataTransfer.effectAllowed = 'move';
                              setDragging(c.id);
                            }}
                            onDragEnd={() => setDragging(null)}
                          >
                            <div className="alloc-chip-name">{c.label || (proj?.client?.split(' ')[0]) || c.projectId}</div>
                            <div className="alloc-chip-hours mono">{c.hours}h</div>
                          </div>
                        );
                      })}
                      {dayTotal === 0 && <div className="alloc-empty muted">—</div>}
                      {dayTotal > 8 && <div className="alloc-overbook">!</div>}
                    </div>
                  );
                })}
                <div className={`alloc-total tone-${tone}`}>
                  <span className="mono"><strong>{total}h</strong> / 40h</span>
                  <ProgressBar value={total} max={40} tone={tone} height={4}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="alloc-legend">
        <span className="muted small">Projects:</span>
        {PROJECTS.map(p => (
          <div key={p.id} className="legend-chip">
            <span className="legend-dot" style={{ background: projectTones[p.id] }}/>{p.name}
          </div>
        ))}
        <div className="legend-chip"><span className="legend-dot" style={{ background: '#a8a29e' }}/>PTO / OOO</div>
      </div>
    </div>
  );
}

Object.assign(window, { ResourcesScreen });
