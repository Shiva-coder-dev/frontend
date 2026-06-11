import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { fmt, initials, todayStr } from '../../utils/helpers';

export default function RepaymentsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', type: 'Interest', date: todayStr(), note: '' });
  const [saving, setSaving] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);
  const [txns, setTxns] = useState([]);
  const [txnsLoading, setTxnsLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const [memRes, txnRes] = await Promise.all([
        api.get('/members', { params: { loanActive: true } }),
        api.get('/transactions'),
      ]);
      let ms = memRes.data.data;
      const allTxns = txnRes.data.data || [];
      ms = ms.map(m => {
        const memberTxns = allTxns.filter(t => t.memberId === m._id);
        const lastPay = memberTxns.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return { ...m, lastPayment: lastPay || null, transactionCount: memberTxns.length };
      });
      setMembers(ms);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openPayModal = (m) => {
    setPayModal(m);
    setPayForm({ amount: m.monthlyInterest || '', type: 'Interest', date: todayStr(), note: '' });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await api.post('/transactions', {
        memberId: payModal._id,
        ...payForm,
        amount: Number(payForm.amount),
      });
      toast.success(`Payment recorded for ${payModal.name}!`);
      setPayModal(null);
      setPayForm({ amount: '', type: 'Interest', date: todayStr(), note: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally { setSaving(false); }
  };

  const openHistory = async (m) => {
    setHistoryModal(m);
    setTxnsLoading(true);
    try {
      const res = await api.get(`/transactions?memberId=${m._id}`);
      setTxns(res.data.data);
    } catch { toast.error('Failed to load history'); }
    finally { setTxnsLoading(false); }
  };

  const filtered = members.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const totalOutstanding = members.reduce((a, m) => a + (m.balance || 0), 0);
  const totalCollected = members.reduce((a, m) => a + (m.interestPaid || 0), 0);
  const overdueCount = members.filter(m => {
    if (!m.lastPayment || !m.loanActive) return false;
    const daysSincePay = (Date.now() - new Date(m.lastPayment.date).getTime()) / 86400000;
    return daysSincePay > 45;
  }).length;

  return (
    <div>
      {/* Header */}
      <div className="flex-between mb-20">
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
            <i className="ti ti-receipt" style={{ color: 'var(--blue3)', marginRight: 8 }} />
            Loan Repayments
          </h2>
          <div className="text-muted text-sm mt-8">Track and manage member loan repayments</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}><i className="ti ti-coin" /></div>
          <div className="stat-label">Active Loans</div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-sub">Registered members with loans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}><i className="ti ti-building-bank" /></div>
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value text-red">{fmt(totalOutstanding)}</div>
          <div className="stat-sub">Remaining balance across all loans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-cash" /></div>
          <div className="stat-label">Total Collected</div>
          <div className="stat-value text-green">{fmt(totalCollected)}</div>
          <div className="stat-sub">Interest payments received</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}><i className="ti ti-clock" /></div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value text-red">{overdueCount}</div>
          <div className="stat-sub">No payment in 45+ days</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-between mb-20">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-muted text-sm">{filtered.length} of {members.length} loans</span>
      </div>

      {/* Repayments Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text2)' }}>
            <i className="ti ti-coin-off" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
            {members.length === 0 ? 'No active loans found.' : 'No matching members found.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Loan Amount</th>
                  <th>Rate</th>
                  <th>Monthly</th>
                  <th>Total Paid</th>
                  <th>Balance</th>
                  <th>Last Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const daysSincePay = m.lastPayment
                    ? Math.round((Date.now() - new Date(m.lastPayment.date).getTime()) / 86400000)
                    : null;
                  const isOverdue = daysSincePay !== null && daysSincePay > 45;
                  const pct = m.loanAmount ? Math.min(100, Math.round((m.interestPaid / (m.loanAmount + (m.accruedInterest || 0) || 1)) * 100)) : 0;
                  return (
                    <tr key={m._id}>
                      <td>
                        <div className="flex-center gap-8">
                          <div className="avatar" style={{ width: 34, height: 34, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 12 }}>{initials(m.name)}</div>
                          <div>
                            <div className="fw-600">{m.name}</div>
                            <div className="text-sm text-muted">{m.memberId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-600">{fmt(m.loanAmount)}</td>
                      <td><span className="badge badge-blue">{m.interestPct}%</span></td>
                      <td className="text-amber">{fmt(m.monthlyInterest)}</td>
                      <td className="text-green">{fmt(m.interestPaid)}</td>
                      <td className={m.loanActive ? 'text-red' : ''}>{m.loanActive ? fmt(m.balance) : <span className="badge badge-green">Closed</span>}</td>
                      <td>
                        {m.lastPayment ? (
                          <div>
                            <div className="text-sm">{new Date(m.lastPayment.date).toLocaleDateString()}</div>
                            <div className="text-xs" style={{ color: isOverdue ? 'var(--red)' : 'var(--text3)', fontSize: 11 }}>
                              {isOverdue ? `${daysSincePay} days ago (Overdue)` : `${daysSincePay} days ago`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex-center gap-8">
                          <button className="btn btn-primary btn-sm" onClick={() => openPayModal(m)} title="Record Payment">
                            <i className="ti ti-cash" /> Pay
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openHistory(m)} title="View History">
                            <i className="ti ti-history" /> History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title">
                <i className="ti ti-cash" style={{ color: 'var(--green)' }} /> Record Payment — {payModal.name}
              </div>
              <button className="btn-icon" onClick={() => setPayModal(null)}><i className="ti ti-x" /></button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                {/* Member summary */}
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Loan', fmt(payModal.loanAmount), ''],
                    ['Rate', `${payModal.interestPct}%`, 'var(--blue3)'],
                    ['Monthly Due', fmt(payModal.monthlyInterest), 'var(--amber)'],
                    ['Balance', fmt(payModal.balance), 'var(--red)'],
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <div className="text-xs text-muted" style={{ fontSize: 11 }}>{label}</div>
                      <div className="fw-600" style={color ? { color, fontSize: 15 } : { fontSize: 15 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-control" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required min="1" placeholder="e.g. 5000" style={{ fontSize: 16 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Type</label>
                  <select className="form-control" value={payForm.type} onChange={e => setPayForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="Interest">Interest</option>
                    <option value="Principal">Principal</option>
                    <option value="Principal+Interest">Principal + Interest</option>
                    <option value="Full Closure">Full Closure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-control" type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input className="form-control" value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. June 2024 EMI" />
                  </div>
                </div>
                {payForm.type === 'Full Closure' && (
                  <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--amber)' }}>
                    <i className="ti ti-alert-triangle" /> Full closure will settle this loan. Remaining balance: {fmt(payModal.balance)}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPayModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="ti ti-loader-2 spin" /> Recording...</> : <><i className="ti ti-check" /> Record Payment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHistoryModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div className="modal-title">
                <i className="ti ti-history" style={{ color: 'var(--blue3)' }} /> Payment History — {historyModal.name}
              </div>
              <button className="btn-icon" onClick={() => setHistoryModal(null)}><i className="ti ti-x" /></button>
            </div>
            <div className="modal-body">
              {/* Quick summary */}
              <div className="flex-center gap-12 mb-16" style={{ flexWrap: 'wrap' }}>
                <div className="avatar" style={{ width: 44, height: 44, borderRadius: 12, background: (historyModal.color || '#3b82f6') + '22', color: historyModal.color || '#3b82f6', fontSize: 16 }}>{initials(historyModal.name)}</div>
                <div style={{ flex: 1 }}>
                  <div className="fw-600">{historyModal.name}</div>
                  <div className="text-muted text-sm">{historyModal.memberId} · {fmt(historyModal.loanAmount)} @ {historyModal.interestPct}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fw-600 text-green">{fmt(historyModal.interestPaid)}</div>
                  <div className="text-muted text-sm">Total Paid</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fw-600" style={{ color: historyModal.loanActive ? 'var(--red)' : 'var(--green)' }}>
                    {historyModal.loanActive ? fmt(historyModal.balance) : 'Settled'}
                  </div>
                  <div className="text-muted text-sm">Balance</div>
                </div>
              </div>

              {txnsLoading ? (
                <div className="loader"><i className="ti ti-loader-2 spin" /></div>
              ) : txns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                  <i className="ti ti-receipt-off" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                  No payment records yet.
                </div>
              ) : (
                <div className="table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((t, i) => (
                        <tr key={t._id}>
                          <td className="text-muted">{txns.length - i}</td>
                          <td className="text-sm">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="fw-600 text-green">{fmt(t.amount)}</td>
                          <td><span className="tag">{t.type}</span></td>
                          <td className="text-muted text-sm">{t.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setHistoryModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setHistoryModal(null); openPayModal(historyModal); }}>
                <i className="ti ti-cash" /> Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
