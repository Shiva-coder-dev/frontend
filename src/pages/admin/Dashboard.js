import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [fineStats, setFineStats] = useState({ grandTotal: 0, totalPaid: 0, totalUnpaid: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
  api.get('/members/stats/summary'),
  api.get('/reports/analytics'),
  api.get('/reports/activity'),
  api.get('/fine'),
]).then(([s, a, l, f]) => {
  setStats(s.data.data);
  setAnalytics(a.data.data);
  setLogs(l.data.data.slice(0, 5));
  setFineStats(f.data.data);
}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const activeMembers = analytics?.members?.filter(m => m.loanActive) || [];

  const doughnutData = {
    labels: activeMembers.map(m => m.name.split(' ')[0]),
    datasets: [{
      data: activeMembers.map(m => m.loanAmount),
      backgroundColor: activeMembers.map(m => m.color + 'cc'),
      borderWidth: 2, borderColor: '#131c2e',
    }],
  };

  const barData = {
    labels: analytics?.monthlyTrend?.map(t => t.month) || [],
    datasets: [{
      label: 'Interest Collected',
      data: analytics?.monthlyTrend?.map(t => t.amount) || [],
      backgroundColor: '#3b82f666', borderColor: '#3b82f6',
      borderWidth: 1, borderRadius: 4,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf' } },
      y: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf', callback: v => '₹' + v.toLocaleString('en-IN') } },
    },
  };

  const logIcons = { member: 'ti-user', loan: 'ti-coin', payment: 'ti-cash', interest: 'ti-percentage', system: 'ti-settings', auth: 'ti-login' };
  const logColors = { member: '#10b981', loan: '#3b82f6', payment: '#f59e0b', interest: '#8b5cf6', system: '#6b7280', auth: '#06b6d4' };

  return (
    <div>
      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total Members', value: stats?.totalMembers, icon: 'ti-users', color: '#3b82f6', sub: 'Registered members' },
          { label: 'Total Invested', value: fmt(stats?.totalInvested), icon: 'ti-trending-up', color: '#8b5cf6', sub: 'Active portfolio' },
          { label: 'Active Loans', value: stats?.activeLoans, icon: 'ti-coin', color: '#f59e0b', sub: `Book: ${fmt(stats?.totalLoanBook)}` },
          { label: 'Monthly Interest', value: fmt(stats?.monthlyInterest), icon: 'ti-cash', color: '#10b981', sub: `Collected: ${fmt(stats?.totalCollected)}` },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}><i className={`ti ${s.icon}`} /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
   {/* Available Balance Card */}
      {(() => {
        const totalInvested = stats?.totalInvested || 0;
        const totalLoanBook = stats?.totalLoanBook || 0;
        const availableBalance = totalInvested - totalLoanBook;
        const isPositive = availableBalance >= 0;
        return (
          <div style={{
            background: isPositive ? 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.05))' : 'linear-gradient(135deg, rgba(239,68,68,.15), rgba(239,68,68,.05))',
            border: `1px solid ${isPositive ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
            borderRadius: 'var(--r2)', padding: '24px 28px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: isPositive ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: isPositive ? 'var(--green)' : 'var(--red)',
            }}>
              <i className={`ti ${isPositive ? 'ti-wallet' : 'ti-alert-triangle'}`} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Currently Available Balance
              </div>
              <div style={{
                fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-head)',
                color: isPositive ? 'var(--green)' : 'var(--red)', lineHeight: 1,
              }}>
                {fmt(Math.abs(availableBalance))}
                {!isPositive && <span style={{ fontSize: 14, marginLeft: 8 }}>(Deficit)</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                Total Invested {fmt(totalInvested)} − Active Loans {fmt(totalLoanBook)}
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* Fines Impact Card */}
<div style={{
  background: 'linear-gradient(135deg, rgba(239,68,68,.12), rgba(239,68,68,.04))',
  border: '1px solid rgba(239,68,68,.25)',
  borderRadius: 'var(--r2)', padding: '20px 24px', marginBottom: 24,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: 16,
}}>
  <div className="flex-center gap-12">
    <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--red)', flexShrink: 0 }}>
      <i className="ti ti-alert-triangle" />
    </div>
    <div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Fines</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--red)', lineHeight: 1 }}>{fmt(fineStats.grandTotal)}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Collected: {fmt(fineStats.totalPaid)} · Pending: {fmt(fineStats.totalUnpaid)}</div>
    </div>
  </div>
  <div className="flex-center gap-24">
    {[
      ['Collected', fmt(fineStats.totalPaid), 'var(--green)'],
      ['Pending', fmt(fineStats.totalUnpaid), 'var(--amber)'],
    ].map(([label, value, color]) => (
      <div key={label} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
      </div>
    ))}
  </div>
</div>

      {/* Charts */}
      <div className="grid-charts">
        <div className="card">
          <div className="card-header"><span className="card-title">Loan Distribution</span></div>
          <div className="card-body"><div style={{ height: 220 }}><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8a9bbf', boxWidth: 10 } } } }} /></div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Monthly Interest Collection</span></div>
          <div className="card-body"><div style={{ height: 220 }}><Bar data={barData} options={chartOpts} /></div></div>
        </div>
      </div>

      {/* Recent Members Table */}
      <div className="card mb-20">
        <div className="card-header">
          <span className="card-title">Recent Members</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/members')}><i className="ti ti-users" /> View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Member</th><th>Loan Status</th><th>Loan Amount</th><th>Monthly Int.</th><th>Invested</th><th>Balance</th></tr></thead>
            <tbody>
              {(analytics?.members || []).slice(0, 5).map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="flex-center gap-8">
                      <div className="avatar" style={{ width: 34, height: 34, background: m.color + '22', border: `1px solid ${m.color}44`, color: m.color, fontSize: 12 }}>{initials(m.name)}</div>
                      <div><div className="fw-600">{m.name}</div><div className="text-sm text-muted">{m.memberId}</div></div>
                    </div>
                  </td>
                  <td>{m.loanActive ? <span className="badge badge-amber">Active</span> : <span className="badge badge-green">Closed</span>}</td>
                  <td>{fmt(m.loanAmount)}</td>
                  <td>{fmt(Math.round(m.loanAmount * m.interestPct / 100 / 12))}</td>
                  <td className="text-blue">{fmt(m.invested)}</td>
                  <td className={m.loanActive ? 'text-red' : ''}>{m.loanActive ? fmt(m.balance) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/activity')}><i className="ti ti-history" /> View All</button>
        </div>
        <div className="card-body">
          {logs.map((l, i) => (
            <div key={i} className="log-item">
              <div className="log-icon" style={{ background: (logColors[l.type] || '#3b82f6') + '22', color: logColors[l.type] || '#3b82f6' }}>
                <i className={`ti ${logIcons[l.type] || 'ti-info-circle'}`} />
              </div>
              <div>
                <div style={{ fontSize: 13 }}>{l.action}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{l.adminName} · {new Date(l.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
