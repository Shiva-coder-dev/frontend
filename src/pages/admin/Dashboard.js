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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/members/stats/summary'),
      api.get('/reports/analytics'),
      api.get('/reports/activity'),
    ]).then(([s, a, l]) => {
      setStats(s.data.data);
      setAnalytics(a.data.data);
      setLogs(l.data.data.slice(0, 5));
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
