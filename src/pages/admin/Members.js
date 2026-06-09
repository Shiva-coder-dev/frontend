import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MemberModal from '../../components/MemberModal';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [txns, setTxns] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', type: 'Interest', date: '', note: '' });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', { params: { search } });
      setMembers(res.data.data);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openView = async (m) => {
    setViewMember(m);
    const res = await api.get(`/transactions?memberId=${m._id}`);
    setTxns(res.data.data);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/members/${editing._id}`, form);
        toast.success('Member updated!');
      } else {
        await api.post('/members', form);
        toast.success('Member added!');
      }
      setModalOpen(false); setEditing(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete ${m.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/members/${m._id}`);
      toast.success('Member deleted');
      fetchMembers();
    } catch { toast.error('Delete failed'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', { memberId: paymentModal._id, ...payForm });
      toast.success('Payment recorded!');
      setPaymentModal(null);
      setPayForm({ amount: '', type: 'Interest', date: '', note: '' });
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/reports/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'fingroup_members.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input placeholder="Search by name, ID, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-center gap-8">
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><i className="ti ti-download" /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><i className="ti ti-user-plus" /> Add Member</button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loader"><i className="ti ti-loader-2 spin" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Contact</th><th>Loan</th><th>Rate</th><th>Monthly</th><th>Paid</th><th>Balance</th><th>Invested</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div className="flex-center gap-8">
                        <div className="avatar" style={{ width: 34, height: 34, background: (m.color || '#3b82f6') + '22', border: `1px solid ${m.color || '#3b82f6'}44`, color: m.color || '#3b82f6', fontSize: 12 }}>{initials(m.name)}</div>
                        <div><div className="fw-600">{m.name}</div><div className="text-sm text-muted">{m.memberId}</div></div>
                      </div>
                    </td>
                    <td><div className="text-sm">{m.phone}</div><div className="text-sm text-muted">{m.email}</div></td>
                    <td>
                      {m.loanActive ? <><span className="badge badge-amber">Active</span><br /><span className="text-sm">{fmt(m.loanAmount)}</span></> : <span className="badge badge-green">Closed</span>}
                    </td>
                    <td><span className="badge badge-blue">{m.interestPct}%</span></td>
                    <td>{fmt(m.monthlyInterest)}</td>
                    <td className="text-green">{fmt(m.interestPaid)}</td>
                    <td className={m.loanActive ? 'text-red' : ''}>{m.loanActive ? fmt(m.balance) : '—'}</td>
                    <td className="text-blue">{fmt(m.invested)}</td>
                    <td>
                      <div className="flex-center gap-8">
                        <button className="btn-icon" title="View" onClick={() => openView(m)}><i className="ti ti-eye" /></button>
                        <button className="btn-icon" title="Add Payment" onClick={() => { setPaymentModal(m); setPayForm({ amount: m.monthlyInterest || '', type: 'Interest', date: new Date().toISOString().slice(0, 10), note: '' }); }}><i className="ti ti-cash" /></button>
                        <button className="btn-icon" title="Edit" onClick={() => { setEditing(m); setModalOpen(true); }}><i className="ti ti-edit" /></button>
                        <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(m)}><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No members found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && <MemberModal member={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} loading={saving} />}

      {/* View Member Modal */}
      {viewMember && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewMember(null)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <div className="modal-title">Member — {viewMember.name}</div>
              <button className="btn-icon" onClick={() => setViewMember(null)}><i className="ti ti-x" /></button>
            </div>
            <div className="modal-body">
              <div className="flex-center gap-12 mb-16">
                <div className="avatar" style={{ width: 54, height: 54, borderRadius: 14, background: (viewMember.color || '#3b82f6') + '22', color: viewMember.color || '#3b82f6', fontSize: 20 }}>{initials(viewMember.name)}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{viewMember.name}</div>
                  <div className="text-muted text-sm">{viewMember.memberId} · {viewMember.email} · {viewMember.phone}</div>
                  <div className="text-sm mt-8">{viewMember.address}</div>
                </div>
              </div>
              <div className="info-grid mb-16">
                {[
                  ['Loan Amount', fmt(viewMember.loanAmount), viewMember.loanActive ? 'var(--amber)' : 'var(--green)'],
                  ['Interest Rate', `${viewMember.interestPct}% p.a.`, 'var(--blue3)'],
                  ['Monthly Interest', fmt(viewMember.monthlyInterest), ''],
                  ['Interest Paid', fmt(viewMember.interestPaid), 'var(--green)'],
                  ['Balance Due', viewMember.loanActive ? fmt(viewMember.balance) : 'Settled', viewMember.loanActive ? 'var(--red)' : 'var(--green)'],
                  ['Invested', fmt(viewMember.invested), 'var(--blue3)'],
                ].map(([label, value, color]) => (
                  <div className="info-card" key={label}>
                    <div className="info-label">{label}</div>
                    <div className="info-value" style={color ? { color } : {}}>{value}</div>
                  </div>
                ))}
              </div>
              {viewMember.notes && <div className="text-sm text-muted mb-16"><i className="ti ti-note" /> {viewMember.notes}</div>}
              <div className="divider" />
              <div className="card-title mb-16">Payment History</div>
              {txns.length === 0 ? <div className="text-muted text-sm">No transactions yet.</div> : txns.slice(0, 6).map(t => (
                <div key={t._id} className="log-item">
                  <div className="log-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-cash" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-600">{fmt(t.amount)} <span className="tag">{t.type}</span></div>
                    <div className="text-sm text-muted">{new Date(t.date).toLocaleDateString()} {t.note && `· ${t.note}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPaymentModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Record Payment — {paymentModal.name}</div>
              <button className="btn-icon" onClick={() => setPaymentModal(null)}><i className="ti ti-x" /></button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-control" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Type</label>
                  <select className="form-control" value={payForm.type} onChange={e => setPayForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Interest</option>
                    <option>Principal</option>
                    <option>Principal+Interest</option>
                    <option>Full Closure</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-control" type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <input className="form-control" value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPaymentModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><i className="ti ti-check" /> Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
