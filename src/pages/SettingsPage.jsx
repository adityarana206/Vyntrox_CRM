import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, SectionHead, Button, Ic, Badge } from '../components/ui';
import { fetchWithAuth, API_BASE } from '../utils/api';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  // SLA Settings State
  const [slaSettings, setSlaSettings] = useState({
    priorities: {
      urgent: { hours: 4, label: '4h', color: '#ef4444' },
      high: { hours: 24, label: '1d', color: '#f59e0b' },
      medium: { hours: 72, label: '3d', color: '#3b82f6' },
      low: { hours: 168, label: '1w', color: '#22c55e' }
    },
    businessHours: { enabled: false, start: '09:00', end: '18:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    escalation: { enabled: true, warningThreshold: 80, autoEscalate: false }
  });
  const [slaLoading, setSlaLoading] = useState(false);
  const [slaSaving, setSlaSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isAdmin) {
      fetchSLASettings();
    }
  }, [isAdmin]);

  const fetchSLASettings = async () => {
    setSlaLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/sla-settings`);
      if (res) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSlaSettings({
            priorities: data.settings.priorities || slaSettings.priorities,
            businessHours: data.settings.businessHours || slaSettings.businessHours,
            escalation: data.settings.escalation || slaSettings.escalation
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch SLA settings:', err);
    } finally {
      setSlaLoading(false);
    }
  };

  const saveSLASettings = async () => {
    setSlaSaving(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/sla-settings`, {
        method: 'PUT',
        body: slaSettings
      });
      if (res) {
        const data = await res.json();
        if (data.success) {
          showToast('SLA settings saved successfully', 'success');
        } else {
          showToast(data.message || 'Failed to save', 'error');
        }
      }
    } catch (err) {
      showToast('Failed to save SLA settings', 'error');
    } finally {
      setSlaSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const updatePriority = (priority, field, value) => {
    setSlaSettings(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: { ...prev.priorities[priority], [field]: value }
      }
    }));
  };

  const toggleWorkingDay = (day) => {
    setSlaSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        workingDays: prev.businessHours.workingDays.includes(day)
          ? prev.businessHours.workingDays.filter(d => d !== day)
          : [...prev.businessHours.workingDays, day]
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <Ic.user width={16} height={16}/> },
    { id: 'preferences', label: 'Preferences', icon: <Ic.cog width={16} height={16}/> },
    ...(isAdmin ? [{ id: 'sla', label: 'SLA Configuration', icon: <Ic.clock width={16} height={16}/> }] : [])
  ];

  const priorityLabels = {
    urgent: { name: 'Urgent', desc: 'Critical issues - immediate attention' },
    high: { name: 'High', desc: 'Important issues - significant impact' },
    medium: { name: 'Medium', desc: 'Standard issues - moderate impact' },
    low: { name: 'Low', desc: 'Minor issues - minimal impact' }
  };

  const renderProfileTab = () => (
    <div className="settings-grid">
      <Card>
        <SectionHead title="Profile Information" subtitle="Your account details"/>
        <div className="profile-info" style={{ marginTop: 20 }}>
          <div className="field">
            <label>Name</label>
            <input className="input" value={user?.name || ''} readOnly />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={user?.email || ''} readOnly />
          </div>
          <div className="field">
            <label>Role</label>
            <input className="input" value={user?.role || ''} readOnly />
          </div>
          <div className="field">
            <label>Title</label>
            <input className="input" value={user?.title || ''} readOnly />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings-grid">
      <Card>
        <SectionHead title="Preferences" subtitle="Customize your experience"/>
        <div className="preferences" style={{ marginTop: 20 }}>
          <div className="pref-item">
            <span>Dark Mode</span>
            <input type="checkbox" />
          </div>
          <div className="pref-item">
            <span>Email Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="pref-item">
            <span>Desktop Notifications</span>
            <input type="checkbox" />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSLATab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="primary" 
          onClick={saveSLASettings} 
          disabled={slaSaving}
          icon={slaSaving ? null : <Ic.check width={16} height={16}/>}
        >
          {slaSaving ? 'Saving...' : 'Save SLA Settings'}
        </Button>
      </div>

      <div className="grid grid-2">
        {/* Priority SLA Settings */}
        <Card>
          <SectionHead title="Priority SLA Timers" subtitle="Response time targets per priority"/>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(slaSettings.priorities).map(([key, config]) => (
              <div key={key} style={{ 
                padding: 16, 
                backgroundColor: '#f8fafc', 
                borderRadius: 10,
                borderLeft: `4px solid ${config.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <Badge tone={key === 'urgent' ? 'danger' : key === 'high' ? 'amber' : key === 'medium' ? 'blue' : 'success'}>
                      {priorityLabels[key].name}
                    </Badge>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>{priorityLabels[key].desc}</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: config.color }}>{config.hours}h</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={config.hours}
                      onChange={(e) => updatePriority(key, 'hours', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '13px', marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Label</label>
                    <input
                      type="text"
                      value={config.label}
                      onChange={(e) => updatePriority(key, 'label', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '13px', marginTop: 4 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Business Hours & Escalation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <SectionHead title="Business Hours" subtitle="When SLA timers are active"/>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={slaSettings.businessHours.enabled}
                  onChange={(e) => setSlaSettings(prev => ({ 
                    ...prev, 
                    businessHours: { ...prev.businessHours, enabled: e.target.checked }
                  }))}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Enable Business Hours Only</span>
              </label>

              {slaSettings.businessHours.enabled && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Start</label>
                      <input
                        type="time"
                        value={slaSettings.businessHours.start}
                        onChange={(e) => setSlaSettings(prev => ({ 
                          ...prev, 
                          businessHours: { ...prev.businessHours, start: e.target.value }
                        }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '13px', marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>End</label>
                      <input
                        type="time"
                        value={slaSettings.businessHours.end}
                        onChange={(e) => setSlaSettings(prev => ({ 
                          ...prev, 
                          businessHours: { ...prev.businessHours, end: e.target.value }
                        }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '13px', marginTop: 4 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Working Days</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <button
                          key={day}
                          onClick={() => toggleWorkingDay(day)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: slaSettings.businessHours.workingDays.includes(day) ? '#15348a' : '#e5e7eb',
                            backgroundColor: slaSettings.businessHours.workingDays.includes(day) ? '#eff6ff' : '#fff',
                            color: slaSettings.businessHours.workingDays.includes(day) ? '#15348a' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: slaSettings.businessHours.workingDays.includes(day) ? 600 : 400
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHead title="Escalation" subtitle="Automated alerts configuration"/>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
                <input 
                  type="checkbox" 
                  checked={slaSettings.escalation.enabled}
                  onChange={(e) => setSlaSettings(prev => ({ 
                    ...prev, 
                    escalation: { ...prev.escalation, enabled: e.target.checked }
                  }))}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Enable SLA Alerts</span>
              </label>

              {slaSettings.escalation.enabled && (
                <div style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                      Warning at {slaSettings.escalation.warningThreshold}%
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={95}
                      step={5}
                      value={slaSettings.escalation.warningThreshold}
                      onChange={(e) => setSlaSettings(prev => ({ 
                        ...prev, 
                        escalation: { ...prev.escalation, warningThreshold: parseInt(e.target.value) }
                      }))}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={slaSettings.escalation.autoEscalate}
                      onChange={(e) => setSlaSettings(prev => ({ 
                        ...prev, 
                        escalation: { ...prev.escalation, autoEscalate: e.target.checked }
                      }))}
                    />
                    <span style={{ fontSize: '13px', color: '#374151' }}>Auto-escalate overdue</span>
                  </label>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <SectionHead title="SLA Preview" subtitle="How timers appear on tickets"/>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(slaSettings.priorities).map(([key, config]) => (
            <div key={key} style={{
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: `${config.color}15`,
              border: `1px solid ${config.color}40`,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: config.color }}/>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize', color: '#374151' }}>{key}:</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: config.color }}>{config.label} left</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, preferences, and system configuration</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: `2px solid ${activeTab === tab.id ? '#15348a' : 'transparent'}`,
              color: activeTab === tab.id ? '#15348a' : '#64748b',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'preferences' && renderPreferencesTab()}
      {activeTab === 'sla' && renderSLATab()}

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 24px',
          borderRadius: '10px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {toast.type === 'success' ? <Ic.ok width={18} height={18}/> : <Ic.warn width={18} height={18}/>}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
