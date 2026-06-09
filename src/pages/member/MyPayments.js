import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function MyPayments() {
  const { member } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member?._id) {
      api.get(`/transactions?memberId=${member._id}`)
        .then(r => setTxns(r.data.data))
        .finally(() => setLoading(false));
    }
  }, [member]);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const total = txns.reduce((a, t) => a + t.amount, 0);

  return (
    <div>
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,.15)', color: 'var(--blue3)' }}><i className="ti ti-list" /></div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{txns.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-cash" /></div>
          <div className="stat-label">Total Paid</div>
          <div className="stat-value text-green">{fmt(total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}><i className="ti ti-calendar" /></div>
          <div className="stat-label">Last Payment</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{txns.length ? new Date(txns[0].date).toLocaleDateString() : '—'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Payment History</span>
          <span className="badge badge-blue">{txns.length} records</span>
        </div>
        {txns.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <i className="ti ti-receipt-off" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
            No payment records found.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Date</th><th>Amount</th><th>Type</th><th>Note</th><th>Status</th></tr>
              </thead>
              <tbody>
                {txns.map((t, i) => (
                  <tr key={t._id}>
                    <td className="text-muted">{txns.length - i}</td>
                    <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="fw-600 text-green">{fmt(t.amount)}</td>
                    <td><span className="tag">{t.type}</span></td>
                    <td className="text-muted">{t.note || '—'}</td>
                    <td><span className="badge badge-green"><i className="ti ti-check" /> Cleared</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
          <i className="ti ti-info-circle" /> For payment disputes, please contact your group administrator.
        </div>
      </div>
    </div>
  );
}
