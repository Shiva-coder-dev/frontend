import React from 'react';
import { useAuth } from '../../context/AuthContext';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function MyInvestment() {
  const { member } = useAuth();
  if (!member) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="card">
        <div className="card-header"><span className="card-title">My Investment Portfolio</span></div>
        <div className="card-body">
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'var(--blue3)', margin: '0 auto 16px' }}>
              <i className="ti ti-trending-up" />
            </div>
            <div style={{ fontSize: 38, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--blue3)' }}>{fmt(member.invested)}</div>
            <div className="text-muted text-sm mt-8">Total Invested Amount</div>
            <span className="badge badge-green mt-8" style={{ fontSize: 13, padding: '6px 18px' }}>Active Investment</span>
          </div>

          <div className="divider" />

          {[
            ['Investment Amount', fmt(member.invested)],
            ['Investment Type', 'Group Finance Pool'],
            ['Status', 'Active'],
            ['Returns', 'Annual Payout'],
            ['Member Since', member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'],
          ].map(([k, v]) => (
            <div key={k} className="emi-row">
              <span className="text-muted">{k}</span>
              <span className="fw-600">{v}</span>
            </div>
          ))}

          <div className="divider" />
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
            <i className="ti ti-info-circle" /> Returns are calculated and distributed at the end of each financial year based on total loan interest collected by the group.
          </div>
        </div>
      </div>
    </div>
  );
}
