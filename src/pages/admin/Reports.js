import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function ReportsPage() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/members'), api.get('/members/stats/summary')])
      .then(([m, s]) => { setMembers(m.data.data); setStats(s.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = async () => {
    try {
      const res = await api.get('/reports/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'fingroup_members.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  return (
    <div>
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header"><span className="card-title">Export Data</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select className="form-control"><option>All Members Summary</option><option>Active Loans</option><option>Interest Collection</option><option>Investment Portfolio</option></select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">From Date</label><input className="form-control" type="date" /></div>
              <div className="form-group"><label className="form-label">To Date</label><input className="form-control" type="date" /></div>
            </div>
            <div className="flex-center gap-8">
              <button className="btn btn-primary" onClick={exportCSV}><i className="ti ti-file-spreadsheet" /> Export CSV</button>
              <button className="btn btn-ghost" onClick={() => toast('PDF export available in production build')}><i className="ti ti-file-type-pdf" /> Export PDF</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Summary Statistics</span></div>
          <div className="card-body">
            {stats && [
              ['Total Members', stats.totalMembers, ''],
              ['Active Loans', stats.activeLoans, 'text-amber'],
              ['Total Loan Book', fmt(stats.totalLoanBook), ''],
              ['Interest Collected', fmt(stats.totalCollected), 'text-green'],
              ['Total Investments', fmt(stats.totalInvested), 'text-blue'],
              ['Outstanding Balance', fmt(stats.totalBalance), 'text-red'],
              ['Monthly Income', fmt(stats.monthlyInterest), 'text-purple'],
            ].map(([k, v, cls]) => (
              <div key={k} className="flex-between" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-muted text-sm">{k}</span>
                <span className={`fw-600 ${cls}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Full Member Report</span>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><i className="ti ti-download" /> Export</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Loan Amt</th><th>Rate</th><th>Monthly</th><th>Paid</th><th>Balance</th><th>Invested</th><th>Status</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m._id}>
                  <td className="text-muted">{m.memberId}</td>
                  <td>
                    <div className="flex-center gap-8">
                      <div className="avatar" style={{ width: 28, height: 28, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 10 }}>{initials(m.name)}</div>
                      <span className="fw-600">{m.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{m.phone}</td>
                  <td>{fmt(m.loanAmount)}</td>
                  <td><span className="badge badge-blue">{m.interestPct}%</span></td>
                  <td>{fmt(m.monthlyInterest)}</td>
                  <td className="text-green">{fmt(m.interestPaid)}</td>
                  <td className={m.loanActive ? 'text-red' : ''}>{m.loanActive ? fmt(m.balance) : '—'}</td>
                  <td className="text-blue">{fmt(m.invested)}</td>
                  <td>{m.loanActive ? <span className="badge badge-amber">Active</span> : <span className="badge badge-green">Closed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
