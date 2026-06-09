import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import api from '../../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

const axisOpts = {
  x: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf' } },
  y: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf', callback: v => '₹' + v.toLocaleString('en-IN') } },
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/analytics').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;
  const { members = [], monthlyTrend = [], summary = {} } = data || {};

  const cmpData = {
    labels: members.map(m => m.name.split(' ')[0]),
    datasets: [
      { label: 'Invested', data: members.map(m => m.invested), backgroundColor: '#8b5cf666', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 4 },
      { label: 'Loan', data: members.map(m => m.loanAmount), backgroundColor: '#3b82f666', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 },
    ],
  };

  const portfolioPie = {
    labels: ['Loans', 'Investments', 'Collected'],
    datasets: [{ data: [summary.totalLoanBook, summary.totalInvested, summary.totalCollected], backgroundColor: ['#3b82f6bb', '#8b5cf6bb', '#10b981bb'], borderWidth: 2, borderColor: '#131c2e' }],
  };

  const ratePie = {
    labels: members.map(m => m.name.split(' ')[0]),
    datasets: [{ label: 'Rate %', data: members.map(m => m.interestPct), backgroundColor: members.map(m => m.color + 'aa'), borderColor: members.map(m => m.color), borderWidth: 1, borderRadius: 4 }],
  };

  const lineData = {
    labels: monthlyTrend.map(t => t.month),
    datasets: [{ label: 'Interest Collected', data: monthlyTrend.map(t => t.amount), borderColor: '#3b82f6', backgroundColor: '#3b82f622', tension: 0.4, fill: true, pointBackgroundColor: '#3b82f6' }],
  };

  const legendLabels = { labels: { color: '#8a9bbf', boxWidth: 10 } };

  return (
    <div>
      <div className="stat-grid mb-20">
        {[
          ['Total Portfolio', fmt((summary.totalLoanBook || 0) + (summary.totalInvested || 0)), '#3b82f6', 'ti-briefcase'],
          ['Loan Book', fmt(summary.totalLoanBook), '#f59e0b', 'ti-coin'],
          ['Interest Collected', fmt(summary.totalCollected), '#10b981', 'ti-cash'],
          ['Outstanding', fmt(summary.totalBalance), '#ef4444', 'ti-alert-circle'],
          ['Monthly Income', fmt(summary.monthlyIncome), '#8b5cf6', 'ti-trending-up'],
        ].map(([label, value, color, icon]) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: color + '22', color }}><i className={`ti ${icon}`} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid-charts">
        <div className="card">
          <div className="card-header"><span className="card-title">Investment vs Loan by Member</span></div>
          <div className="card-body"><div style={{ height: 240 }}><Bar data={cmpData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendLabels }, scales: axisOpts }} /></div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Portfolio Breakdown</span></div>
          <div className="card-body"><div style={{ height: 240 }}><Doughnut data={portfolioPie} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendLabels } }} /></div></div>
        </div>
      </div>

      <div className="grid-charts">
        <div className="card">
          <div className="card-header"><span className="card-title">Interest Collection Trend</span></div>
          <div className="card-body"><div style={{ height: 220 }}><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: axisOpts }} /></div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Interest Rates by Member</span></div>
          <div className="card-body"><div style={{ height: 220 }}><Bar data={ratePie} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf' } }, y: { grid: { color: '#2a3550' }, ticks: { color: '#8a9bbf', callback: v => v + '%' }, min: 0, max: 20 } } }} /></div></div>
        </div>
      </div>
    </div>
  );
}
