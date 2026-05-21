import React from 'react';
import { useSelector } from 'react-redux';
import { Card, SectionHead, Button } from '../components/ui';

const PortalPage = () => {
  const { user } = useSelector((state) => state.auth);

  const quickLinks = [
    { label: 'My Tickets', path: '/tickets', desc: 'View and manage your support tickets' },
    { label: 'My Projects', path: '/projects', desc: 'View your project status and details' },
    { label: 'Settings', path: '/settings', desc: 'Update your profile and preferences' },
  ];

  const recentActivity = [
    { type: 'ticket', text: 'Ticket #VT-128 updated', time: '2 hours ago' },
    { type: 'project', text: 'Project milestone completed', time: '1 day ago' },
    { type: 'comment', text: 'New comment on VT-125', time: '2 days ago' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Client Portal</h1>
        <p className="page-subtitle">Welcome back, {user?.name || user?.email}</p>
      </div>

      <div className="portal-grid">
        {/* Quick Links */}
        <Card className="portal-card">
          <SectionHead title="Quick Links" />
          <div className="portal-links">
            {quickLinks.map(link => (
              <a key={link.path} href={link.path} className="portal-link">
                <span className="portal-link-label">{link.label}</span>
                <span className="portal-link-desc">{link.desc}</span>
              </a>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="portal-card">
          <SectionHead title="Recent Activity" />
          <div className="portal-activity">
            {recentActivity.map((item, i) => (
              <div key={i} className="portal-activity-item">
                <span className={`portal-activity-dot ${item.type}`}></span>
                <span className="portal-activity-text">{item.text}</span>
                <span className="portal-activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Support */}
        <Card className="portal-card portal-support">
          <SectionHead title="Need Help?" />
          <p className="portal-support-text">
            Our support team is available 24/7 to assist you with any questions or issues.
          </p>
          <Button variant="primary" href="/tickets">Create Support Ticket</Button>
        </Card>
      </div>
    </div>
  );
};

export default PortalPage;
