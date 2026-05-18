// App root — router, state, tweaks
import React from 'react'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "admin",
  "showLogin": true,
  "sidebarCollapsed": false,
  "theme": "light",
  "density": "regular",
  "brandColor": "#15348a"
}/*EDITMODE-END*/;

const BRAND_PALETTES = [
  { primary: '#15348a', accent: '#2f5fd3', success: '#65bb3c' }, // Vyntrox default
  { primary: '#0f766e', accent: '#0891b2', success: '#65bb3c' }, // Teal
  { primary: '#7c3aed', accent: '#ec4899', success: '#65bb3c' }, // Purple
  { primary: '#b91c1c', accent: '#f97316', success: '#65bb3c' }, // Crimson
  { primary: '#1f2937', accent: '#6366f1', success: '#10b981' }, // Slate
];

function applyTheme({ theme, density, brandColor }) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-density', density);
  const palette = BRAND_PALETTES.find(p => p.primary === brandColor) || BRAND_PALETTES[0];
  root.style.setProperty('--brand-navy', palette.primary);
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-hover', shade(palette.primary, -15));
  root.style.setProperty('--primary-soft', tint(palette.primary, 92));
  root.style.setProperty('--accent', palette.accent);
}

// Color helpers
function shade(hex, pct) {
  const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  const mod = (c) => Math.max(0, Math.min(255, Math.round(c + (pct/100) * 255)));
  return '#' + [mod(r), mod(g), mod(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}
function tint(hex, pct) {
  // Returns a very light tint by mixing toward white
  const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  const mix = (c) => Math.round(c + (255 - c) * (pct/100));
  return '#' + [mix(r), mix(g), mix(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}

function ModalManager() {
  const [openType, setOpenType] = React.useState(null);
  const { addTicket, addDeal } = useAppState();

  React.useEffect(() => {
    const handler = (e) => setOpenType(e.detail?.type || null);
    window.addEventListener('open-modal', handler);
    return () => window.removeEventListener('open-modal', handler);
  }, []);

  return (
    <>
      <CreateTicketModal
        open={openType === 'ticket'}
        onClose={() => setOpenType(null)}
        onCreated={addTicket}
      />
      <CreateDealModal
        open={openType === 'deal'}
        onClose={() => setOpenType(null)}
        onCreated={addDeal}
      />
    </>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('dashboard');
  const [search, setSearch] = React.useState('');
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedDeal, setSelectedDeal] = React.useState(null);

  // Apply theme/density/brand color on changes
  React.useEffect(() => {
    applyTheme({ theme: t.theme, density: t.density, brandColor: t.brandColor });
  }, [t.theme, t.density, t.brandColor]);

  React.useEffect(() => {
    setSelectedTicket(null);
    setSelectedProject(null);
    setSelectedDeal(null);
  }, [route]);

  React.useEffect(() => {
    const nav = NAV.find(n => n.id === route);
    if (nav && !nav.roles.includes(t.role)) setRoute('dashboard');
  }, [t.role]);

  const effectiveRoute = (t.role === 'client' && route === 'dashboard') ? 'portal' : route;
  const setRole = (id) => setTweak('role', id);

  if (t.showLogin) {
    return (
      <AppStateProvider>
        <LoginScreen onLogin={(role) => { setTweak({ role, showLogin: false }); setRoute('dashboard'); }}/>
      </AppStateProvider>
    );
  }

  return (
    <AppStateProvider>
      <div className="app">
        <Sidebar role={t.role} route={route} setRoute={setRoute} collapsed={t.sidebarCollapsed} setCollapsed={(fn) => setTweak('sidebarCollapsed', typeof fn === 'function' ? fn(t.sidebarCollapsed) : fn)}/>
        <div className="app-main">
          <Topbar role={t.role} route={effectiveRoute} setRoute={setRoute} setRole={setRole} search={search} setSearch={setSearch}/>
          <div className="app-scroll">
            {effectiveRoute === 'dashboard' && (
              <Dashboard
                role={t.role}
                setRoute={setRoute}
                setSelectedTicket={setSelectedTicket}
                setSelectedProject={setSelectedProject}
                setSelectedDeal={setSelectedDeal}
              />
            )}
            {effectiveRoute === 'tickets' && (
              <TicketsScreen role={t.role} selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket}/>
            )}
            {effectiveRoute === 'tasks' && <TasksScreen/>}
            {effectiveRoute === 'projects' && (
              <ProjectsScreen role={t.role} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
            )}
            {effectiveRoute === 'sales' && (
              <SalesScreen selectedDeal={selectedDeal} setSelectedDeal={setSelectedDeal}/>
            )}
            {effectiveRoute === 'clients' && <ClientsScreen/>}
            {effectiveRoute === 'resources' && <ResourcesScreen/>}
            {effectiveRoute === 'reports' && <ReportsScreen/>}
            {effectiveRoute === 'portal' && (
              <PortalScreen
                setRoute={setRoute}
                setSelectedTicket={setSelectedTicket}
                setSelectedProject={setSelectedProject}
              />
            )}
            {effectiveRoute === 'admin' && <AdminScreen/>}
            {effectiveRoute === 'settings' && <SettingsScreen/>}
          </div>
        </div>

        <ModalManager/>
        <ToastHost/>

        <TweaksPanel title="Tweaks">
          <TweakSection label="View">
            <TweakSelect
              label="Active role"
              value={t.role}
              onChange={(v) => setTweak('role', v)}
              options={[
                { value: 'admin', label: 'Admin — full access' },
                { value: 'manager', label: 'Manager — team lead' },
                { value: 'resource', label: 'Resource — employee' },
                { value: 'sales', label: 'Sales — account exec' },
                { value: 'client', label: 'Client — external' },
              ]}
            />
            <div className="muted small" style={{ marginTop: 8, lineHeight: 1.4 }}>
              Sidebar, dashboard, and available screens adapt to the role.
            </div>
          </TweakSection>

          <TweakSection label="Appearance">
            <TweakRadio label="Theme" value={t.theme} onChange={v => setTweak('theme', v)} options={['light','dark']}/>
            <TweakRadio label="Density" value={t.density} onChange={v => setTweak('density', v)} options={['compact','regular','comfy']}/>
            <TweakColor
              label="Brand color"
              value={t.brandColor}
              onChange={v => setTweak('brandColor', v)}
              options={BRAND_PALETTES.map(p => p.primary)}
            />
          </TweakSection>

          <TweakSection label="Chrome">
            <TweakToggle label="Collapsed sidebar" value={t.sidebarCollapsed} onChange={v => setTweak('sidebarCollapsed', v)}/>
          </TweakSection>

          <TweakSection label="Demo">
            <TweakButton label="Show login screen" onClick={() => setTweak('showLogin', true)}/>
            <TweakButton label="Open New ticket modal" onClick={() => openModal('ticket')} secondary/>
            <TweakButton label="Open New deal modal" onClick={() => openModal('deal')} secondary/>
          </TweakSection>
        </TweaksPanel>
      </div>
    </AppStateProvider>
  );
}

export { App };
