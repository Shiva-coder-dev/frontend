import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = n => '₹' + Number(Math.round(n) || 0).toLocaleString('en-IN');

export default function CalculatorPage() {
  const [form, setForm] = useState({ loan: '', rate: '', months: '', type: 'simple' });
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = (e) => {
    e.preventDefault();
    const loan = parseFloat(form.loan);
    const rate = parseFloat(form.rate);
    const months = parseInt(form.months);
    if (!loan || !rate || !months) return;

    let monthly, totalInterest, total;
    if (form.type === 'simple') {
      monthly = loan * rate / 100 / 12;
      totalInterest = monthly * months;
      total = loan + totalInterest;
    } else {
      const r = rate / 100 / 12;
      monthly = loan * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      total = monthly * months;
      totalInterest = total - loan;
    }
    setResult({ monthly, totalInterest, total, loan, rate, months });
  };

  const pieData = result ? {
    labels: ['Principal', 'Interest'],
    datasets: [{ data: [result.loan, result.totalInterest], backgroundColor: ['#3b82f6bb', '#f59e0bbb'], borderWidth: 2, borderColor: '#131c2e' }],
  } : null;

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div className="card mb-20">
        <div className="card-header"><span className="card-title"><i className="ti ti-calculator" /> EMI / Interest Calculator</span></div>
        <div className="card-body">
          <form onSubmit={calculate}>
            <div className="form-group">
              <label className="form-label">Loan / Principal Amount (₹)</label>
              <input className="form-control" type="number" placeholder="e.g. 100000" value={form.loan} onChange={e => set('loan', e.target.value)} required min="1" style={{ fontSize: 16 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interest Rate (% p.a.)</label>
                <input className="form-control" type="number" placeholder="e.g. 12" value={form.rate} onChange={e => set('rate', e.target.value)} required min="0.1" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Tenure (months)</label>
                <input className="form-control" type="number" placeholder="e.g. 12" value={form.months} onChange={e => set('months', e.target.value)} required min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Calculation Type</label>
              <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="simple">Simple Interest (Flat Rate)</option>
                <option value="emi">EMI — Reducing Balance</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
              <i className="ti ti-calculator" /> Calculate
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="card-header"><span className="card-title">Calculation Result</span></div>
          <div className="card-body">
            <div style={{ height: 200, marginBottom: 20 }}>
              <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8a9bbf' } } } }} />
            </div>
            {[
              ['Principal Amount', fmt(result.loan), 'var(--blue3)'],
              ['Monthly Payment', fmt(result.monthly), 'var(--text)'],
              ['Total Interest', fmt(result.totalInterest), 'var(--amber)'],
              ['Total Payable', fmt(result.total), 'var(--text)'],
            ].map(([label, value, color], i) => (
              <div key={label} className="emi-row" style={i === 3 ? { fontWeight: 700, fontSize: 15 } : {}}>
                <span className="text-muted">{label}</span>
                <span style={{ color }}>{value}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--text2)' }}>
              <i className="ti ti-info-circle" /> {form.type === 'simple'
                ? `Simple interest @ ${result.rate}% p.a. over ${result.months} months.`
                : `EMI on reducing balance @ ${result.rate}% p.a. over ${result.months} months.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
