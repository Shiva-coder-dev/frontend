import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function LoansPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/members', { params: { loanActive: true } })
      .then(r => setMembers(r.data.data))
      .catch(() => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const totalBook = members.reduce((a, m) => a + m.loanAmount, 0);
  const totalBalance = members.reduce((a, m) => a + (m.balance || 0), 0);
  const totalPaid = members.reduce((a, m) => a + m.interestPaid, 0);
  const monthlyIncome = members.reduce((a, m) => a + (m.monthlyInterest || 0), 0);

  return (
    <div>
      <div className="stat-grid">
        {[
          { label: 'Active Loans', value: members.length, icon: 'ti-coin', color: '#f59e0b' },
          { label: 'Total Loan Book', value: fmt(totalBook), icon: 'ti-building-bank', color: '#3b82f6' },
          { label: 'Monthly Income', value: fmt(monthlyIncome), icon: 'ti-cash', color: '#10b981' },
          { label: 'Total Outstanding', value: fmt(totalBalance), icon: 'ti-alert-triangle', color: '#ef4444' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}><i className={`ti ${s.icon}`} /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {members.map(m => {
          const pct = Math.min(100, Math.round((m.interestPaid / (m.loanAmount + (m.accruedInterest || 0) || 1)) * 100));
          return (
            <div className="card" key={m._id}>
              <div className="card-body">
                <div className="flex-between mb-16">
                  <div className="flex-center gap-8">
                    <div className="avatar" style={{ width: 36, height: 36, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 13 }}>{initials(m.name)}</div>
                    <div><div className="fw-600">{m.name}</div><div className="text-sm text-muted">{m.memberId}</div></div>
                  </div>
                  <span className="badge badge-amber">Active</span>
                </div>

                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: 12 }}>{fmt(m.loanAmount)}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['Rate', `${m.interestPct}%`, 'var(--blue3)'],
                    ['Monthly', fmt(m.monthlyInterest), ''],
                    ['Paid', fmt(m.interestPaid), 'var(--green)'],
                    ['Balance', fmt(m.balance), 'var(--red)'],
                  ].map(([label, value, color]) => (
                    <div className="info-card" style={{ padding: '8px 12px' }} key={label}>
                      <div className="info-label">{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Repayment Progress — {pct}%</div>
                <div className="progress"><div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--blue),var(--green))' }} /></div>

                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                  Started: {m.loanStart ? new Date(m.loanStart).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}><i className="ti ti-coin-off" /></div>
          <div>No active loans found.</div>
        </div>
      )}
    </div>
  );
}
