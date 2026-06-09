import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MemberLayout() {
  const { user, member, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const name = member?.name || user?.name || 'Member';
  const color = member?.color || '#8b5cf6';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const navSections = [
    {
      label: 'My Account', items: [
        { icon: 'ti-dashboard', label: 'Dashboard', to: '/member/dashboard' },
        { icon: 'ti-coin', label: 'Loan Details', to: '/member/loan' },
        { icon: 'ti-trending-up', label: 'Investment', to: '/member/investment' },
        { icon: 'ti-clock', label: 'Payment History', to: '/member/payments' },
      ]
    },
    {
      label: 'Tools', items: [
        { icon: 'ti-calculator', label: 'EMI Calculator', to: '/member/calculator' },
        { icon: 'ti-user', label: 'My Profile', to: '/member/profile' },
      ]
    },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><i className="ti ti-shield-dollar" /></div>
          <div>
            <div className="logo-text">FinGroup Pro</div>
            <div className="logo-sub">Member Portal</div>
          </div>
        </div>
        <div className="sidebar-user">
          <div className="avatar" style={{ width: 34, height: 34, background: color + '22', border: `1px solid ${color}44`, color, fontSize: 13 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Member · {member?.memberId}</div>
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
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', width: '100%' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)'; }}>
            <i className="ti ti-logout" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">Member Portal</div>
          <div className="flex-center gap-12">
            <span style={{ background: 'rgba(139,92,246,.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Member</span>
            <div className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
              <i className="ti ti-bell" />
            </div>
          </div>
        </header>
        {notifOpen && (
          <div className="notif-panel">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: 13 }}>Notifications</span>
              <button className="btn-icon" onClick={() => setNotifOpen(false)}><i className="ti ti-x" /></button>
            </div>
            <div className="notif-item"><div className="notif-dot" /><div><div style={{ fontSize: 12 }}>Your next payment is due soon</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Today</div></div></div>
            <div className="notif-item"><div className="notif-dot" /><div><div style={{ fontSize: 12 }}>Interest rate updated by admin</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>2 days ago</div></div></div>
          </div>
        )}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
