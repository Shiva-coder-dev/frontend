import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Avatar = ({ name, color = '#3b82f6', size = 34, fontSize = 13 }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';
  return (
    <div className="avatar" style={{ width: size, height: size, background: color + '22', border: `1px solid ${color}44`, color, fontSize }}>
      {initials}
    </div>
  );
};

const NOTIFICATIONS = [
  { text: 'Payment due from Priya Menon tomorrow', time: 'Today' },
  { text: 'Interest review overdue for 3 members', time: 'Yesterday' },
  { text: 'New login: MEM003 at 10:32 AM', time: '2 days ago' },
  { text: 'Monthly report for June is ready', time: '3 days ago' },
];

export { Avatar };

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const navSections = [
    {
      label: 'Overview', items: [
        { icon: 'ti-dashboard', label: 'Dashboard', to: '/admin/dashboard' },
        { icon: 'ti-chart-bar', label: 'Analytics', to: '/admin/analytics' },
      ]
    },
    {
      label: 'Management', items: [
        { icon: 'ti-users', label: 'Members', to: '/admin/members' },
        { icon: 'ti-coin', label: 'Loan Manager', to: '/admin/loans' },
        { icon: 'ti-trending-up', label: 'Investment', to: '/admin/investment' },
        { icon: 'ti-star', label: 'Samruthy', to: '/admin/samruthy' },
        { icon: 'ti-percentage', label: 'Interest Settings', to: '/admin/interest' },
        { icon: 'ti-report', label: 'Reports', to: '/admin/reports' },
      ]
    },
    {
      label: 'Tools', items: [
        { icon: 'ti-calculator', label: 'EMI Calculator', to: '/admin/calculator' },
        { icon: 'ti-history', label: 'Activity Log', to: '/admin/activity' },
      ]
    },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><i className="ti ti-shield-dollar" /></div>
          <div>
            <div className="logo-text">FinGroup Pro</div>
            <div className="logo-sub">Admin Panel</div>
          </div>
        </div>
        <div className="sidebar-user">
          <Avatar name={user?.name} color="#3b82f6" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Administrator</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navSections.map(section => (
            <div key={section.label}>
              <div className="nav-section">{section.label}</div>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <i className={`ti ${item.icon}`} />{item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', width: '100%', transition: 'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)'; }}>
            <i className="ti ti-logout" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-title" id="page-title">Dashboard</div>
          <div className="flex-center gap-12">
            <span style={{ background: 'rgba(59,130,246,.15)', color: 'var(--blue3)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Admin</span>
            <div className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
              <i className="ti ti-bell" />
              <div className="notif-badge" />
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        {notifOpen && (
          <div className="notif-panel">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 13 }}>Notifications</span>
              <button className="btn-icon" onClick={() => setNotifOpen(false)}><i className="ti ti-x" /></button>
            </div>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="notif-item">
                <div className="notif-dot" />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
