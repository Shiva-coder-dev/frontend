import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function MemberDashboard() {
  const { member, user } = useAuth();
  const [txns, setTxns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (member?._id) {
      api.get(`/transactions?memberId=${member._id}`).then(r => setTxns(r.data.data.slice(0, 5)));
    }
  }, [member]);

  if (!member) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const name = member.name || user?.name;
  const color = member.color || '#8b5cf6';
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const monthly = member.monthlyInterest || Math.round((member.loanAmount * member.interestPct) / 100 / 12);
  const balance = member.balance || 0;
  const pct = Math.min(100, Math.round((member.interestPaid / (member.loanAmount + (member.accruedInterest || 1))) * 100));

  return (
    <div>
      {/* Member Header */}
      <div className="flex-center gap-12 mb-20" style={{ padding: '16px 20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r2)' }}>
        <div className="avatar" style={{ width: 56, height: 56, borderRadius: 14, background: color + '22', color, fontSize: 20 }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{name}</div>
          <div className="text-muted text-sm">{member.memberId} · {member.email}</div>
          <div className="flex-center gap-8 mt-8">
            {member.loanActive ? <span className="badge badge-amber">Loan Active</span> : <span className="badge badge-green">Loan Closed</span>}
            <span className="badge badge-blue">Member</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Loan Amount', value: fmt(member.loanAmount), icon: 'ti-coin', color: '#f59e0b', sub: `Since ${member.loanStart ? new Date(member.loanStart).toLocaleDateString() : '—'}` },
          { label: 'Monthly Interest', value: fmt(monthly), icon: 'ti-calendar', color: '#3b82f6', sub: `@ ${member.interestPct}% p.a.` },
          { label: 'Total Paid', value: fmt(member.interestPaid), icon: 'ti-circle-check', color: '#10b981', sub: `${pct}% recovered` },
          { label: 'Balance Due', value: member.loanActive ? fmt(balance) : '₹0', icon: 'ti-alert-circle', color: member.loanActive ? '#ef4444' : '#10b981', sub: member.loanActive ? 'Outstanding' : 'Fully Settled' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}><i className={`ti ${s.icon}`} /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Repayment Progress */}
        <div className="card">
          <div className="card-header"><span className="card-title">Loan Repayment Progress</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span className="text-muted">Paid: {fmt(member.interestPaid)}</span>
              <span className="fw-600 text-blue">{pct}%</span>
            </div>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--blue),var(--green))' }} />
            </div>
            <div className="divider" />
            {[
              ['Accrued Interest', fmt(member.accruedInterest || 0)],
              ['Total Payable', fmt((member.loanAmount || 0) + (member.accruedInterest || 0))],
              ['Remaining Balance', fmt(balance)],
            ].map(([k, v]) => (
              <div key={k} className="emi-row"><span className="text-muted">{k}</span><span className="fw-600">{v}</span></div>
            ))}
          </div>
        </div>

        {/* Investment */}
        <div className="card">
          <div className="card-header"><span className="card-title">My Investment</span></div>
          <div className="card-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ width: 70, height: 70, borderRadius: 18, background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--blue3)', margin: '0 auto 16px' }}>
              <i className="ti ti-trending-up" />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--blue3)' }}>{fmt(member.invested)}</div>
            <div className="text-muted text-sm mt-8">Total Invested Amount</div>
            <span className="badge badge-green mt-8" style={{ fontSize: 12, padding: '5px 14px' }}>Portfolio Active</span>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card mt-16">
        <div className="card-header">
          <span className="card-title">Recent Payments</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/member/payments')}><i className="ti ti-clock" /> View All</button>
        </div>
        {txns.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text2)' }}>No transactions yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Type</th><th>Note</th><th>Status</th></tr></thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td className="fw-600">{fmt(t.amount)}</td>
                    <td><span className="tag">{t.type}</span></td>
                    <td className="text-muted">{t.note || '—'}</td>
                    <td><span className="badge badge-green"><i className="ti ti-check" /> Cleared</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
