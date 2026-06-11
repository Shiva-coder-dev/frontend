import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

const TYPE_COLOR = {
  'Late Fine': '#ef4444',
  'Investment Late Fine': '#f59e0b',
  'Loan Overdue Fine': '#8b5cf6',
  'Other': '#6b7280',
};

export default function MyFines() {
  const { member } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member?._id) {
      api.get(`/fines/member/${member._id}`)
        .then(r => setData(r.data.data))
        .finally(() => setLoading(false));
    }
  }, [member]);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const { fines = [], totalFine = 0, paidFine = 0, unpaidFine = 0 } = data || {};

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}><i className="ti ti-alert-triangle" /></div>
          <div className="stat-label">Total Fines</div>
          <div className="stat-value text-red">{fmt(totalFine)}</div>
          <div className="stat-sub">{fines.length} records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-check" /></div>
          <div className="stat-label">Paid</div>
          <div className="stat-value text-green">{fmt(paidFine)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}><i className="ti ti-clock" /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value text-amber">{fmt(unpaidFine)}</div>
        </div>
      </div>

      {/* Fines List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Fines</span>
          <span className="badge badge-red">{fines.length} records</span>
        </div>
        {fines.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <i className="ti ti-mood-happy" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
            <div className="fw-600">No fines! You are all clear 🎉</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Type</th><th>Reason</th><th>Amount</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {fines.map((f, i) => (
                  <tr key={f._id}>
                    <td className="text-muted">{fines.length - i}</td>
                    <td>
                      <span className="badge" style={{ background: TYPE_COLOR[f.fineType] + '22', color: TYPE_COLOR[f.fineType], border: `1px solid ${TYPE_COLOR[f.fineType]}44` }}>
                        {f.fineType}
                      </span>
                    </td>
                    <td className="text-muted">{f.reason}</td>
                    <td><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{fmt(f.amount)}</span></td>
                    <td className="text-muted text-sm">{new Date(f.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      {f.isPaid
                        ? <span className="badge badge-green"><i className="ti ti-check" /> Paid</span>
                        : <span className="badge badge-red"><i className="ti ti-clock" /> Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <i className="ti ti-info-circle" /> For fine disputes please contact your administrator.
        </div>
      </div>
    </div>
  );
}