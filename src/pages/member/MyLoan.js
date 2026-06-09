import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function MyLoan() {
  const { member } = useAuth();
  if (!member) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const balance = member.balance || 0;
  const accrued = member.accruedInterest || 0;
  const total = (member.loanAmount || 0) + accrued;
  const pct = Math.min(100, Math.round((member.interestPaid / (total || 1)) * 100));
  const monthly = member.monthlyInterest || Math.round((member.loanAmount * member.interestPct) / 100 / 12);

  const pieData = {
    labels: ['Principal', 'Interest Paid', 'Remaining Balance'],
    datasets: [{
      data: [member.loanAmount, member.interestPaid, Math.max(0, balance)],
      backgroundColor: ['#3b82f6bb', '#10b981bb', '#ef4444bb'],
      borderWidth: 2, borderColor: '#131c2e',
    }],
  };

  return (
    <div>
      <div className="card mb-20">
        <div className="card-header">
          <span className="card-title">Loan Details — {member.memberId}</span>
          {member.loanActive ? <span className="badge badge-amber">Active</span> : <span className="badge badge-green">Closed</span>}
        </div>
        <div className="card-body">
          <div className="info-grid mb-20">
            {[
              ['Principal Amount', fmt(member.loanAmount), ''],
              ['Interest Rate', `${member.interestPct}% per annum`, 'var(--blue3)'],
              ['Start Date', member.loanStart ? new Date(member.loanStart).toLocaleDateString() : '—', ''],
              ['Monthly Interest', fmt(monthly), 'var(--amber)'],
              ['Accrued Interest', fmt(accrued), ''],
              ['Interest Paid', fmt(member.interestPaid), 'var(--green)'],
              ['Total Payable', fmt(total), ''],
              ['Remaining Balance', member.loanActive ? fmt(balance) : 'Fully Settled ✓', member.loanActive ? 'var(--red)' : 'var(--green)'],
            ].map(([label, value, color]) => (
              <div className="info-card" key={label}>
                <div className="info-label">{label}</div>
                <div className="info-value" style={color ? { color } : {}}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span className="text-muted">Repayment Progress</span>
              <span className="fw-600 text-blue">{pct}%</span>
            </div>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--blue),var(--green))' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <div className="card-header"><span className="card-title">Loan Breakdown Chart</span></div>
        <div className="card-body">
          <div style={{ height: 240 }}>
            <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8a9bbf' } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
