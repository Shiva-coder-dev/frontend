import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function SamruthyPage() {
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [samRes, memRes] = await Promise.all([
        api.get('/samruthy'),
        api.get('/members'),
      ]);
      setData(samRes.data.data);
      setMembers(memRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.amount) { toast.error('Select member and enter amount'); return; }
    setSaving(true);
    try {
      await api.post('/samruthy', form);
      toast.success('Samruthy investment added!');
      setShowAddModal(false);
      setForm({ memberId: '', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/samruthy/${id}`);
      toast.success('Entry deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const { summary = [], grandTotal = 0, entries = [] } = data || {};

  return (
    <div>
      <div className="flex-between mb-20">
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
            <i className="ti ti-star" style={{ color: 'var(--amber)', marginRight: 8 }} />
            Samruthy Investments
          </h2>
          <div className="text-muted text-sm mt-8">Separate investment tracking for Samruthy fund</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="ti ti-plus" /> Add Investment
        </button>
      </div>

      {/* Total Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.05))',
        border: '1px solid rgba(245,158,11,.3)',
        borderRadius: 'var(--r2)', padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(245,158,11,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--amber)', flexShrink: 0 }}>
          <i className="ti ti-star" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px' }}>Samruthy Total Fund</div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--amber)', lineHeight: 1 }}>{fmt(grandTotal)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            Total from {summary.filter(s => s.total > 0).length} members · {entries.length} transactions
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'overview', label: 'Member Overview', icon: 'ti-users' },
          { id: 'transactions', label: 'All Transactions', icon: 'ti-list' },
        ].map(t => (
          <button key={t.id} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(t.id)}>
            <i className={`ti ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Member-wise Samruthy Investment</span>
            <span className="badge badge-amber">{fmt(grandTotal)} Total</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Total Invested</th><th>Transactions</th><th>Last Investment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {summary.map(s => (
                  <tr key={s.memberId}>
                    <td>
                      <div className="flex-center gap-8">
                        <div className="avatar" style={{ width: 36, height: 36, background: (s.color || '#3b82f6') + '22', color: s.color || '#3b82f6', fontSize: 12 }}>{initials(s.name)}</div>
                        <div>
                          <div className="fw-600">{s.name}</div>
                          <div className="text-sm text-muted">{s.memberCode}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 16, fontWeight: 700, color: s.total > 0 ? 'var(--amber)' : 'var(--text3)' }}>{fmt(s.total)}</span></td>
                    <td><span className="badge badge-blue">{s.entries.length}</span></td>
                    <td className="text-muted text-sm">{s.entries.length > 0 ? new Date(s.entries[0].date).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => {
                        setForm(f => ({ ...f, memberId: s.memberId }));
                        setShowAddModal(true);
                      }}>
                        <i className="ti ti-plus" /> Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Samruthy Transactions</span>
            <span className="badge badge-blue">{entries.length} records</span>
          </div>
          {entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
              <i className="ti ti-star-off" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
              No Samruthy investments yet!
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Member</th><th>Amount</th><th>Date</th><th>Note</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e._id}>
                      <td className="text-muted">{entries.length - i}</td>
                      <td>
                        <div className="flex-center gap-8">
                          <div className="avatar" style={{ width: 30, height: 30, background: 'rgba(245,158,11,.15)', color: 'var(--amber)', fontSize: 11 }}>{initials(e.memberName)}</div>
                          <div>
                            <div className="fw-600">{e.memberName}</div>
                            <div className="text-sm text-muted">{e.memberMemberId}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--amber)' }}>{fmt(e.amount)}</span></td>
                      <td className="text-muted">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="text-muted">{e.note || '—'}</td>
                      <td>
                        <button className="btn-icon danger" onClick={() => handleDelete(e._id)}>
                          <i className="ti ti-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title"><i className="ti ti-star" style={{ color: 'var(--amber)' }} /> Add Samruthy Investment</div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><i className="ti ti-x" /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Member *</label>
                  <select className="form-control" value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} required>
                    <option value="">-- Select Member --</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.memberId})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-control" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="1" placeholder="e.g. 5000" style={{ fontSize: 16 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <input className="form-control" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Monthly contribution" />
                </div>
                {form.amount && form.memberId && (
                  <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, padding: 12 }}>
                    <div className="text-sm text-amber fw-600">
                      <i className="ti ti-info-circle" /> Adding {fmt(form.amount)} to {members.find(m => m._id === form.memberId)?.name}'s Samruthy account
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="ti ti-loader-2 spin" /> Saving...</> : <><i className="ti ti-check" /> Add Investment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}