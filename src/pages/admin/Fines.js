import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const FINE_TYPES = ['Late Fine', 'Investment Late Fine', 'Loan Overdue Fine', 'Other'];

export default function FinesPage() {
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    memberId: '', amount: '', reason: '',
    fineType: 'Late Fine', date: new Date().toISOString().slice(0, 10), note: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fineRes, memRes] = await Promise.all([
        api.get('/fine'),
        api.get('/members'),
      ]);
      setData(fineRes.data.data);
      setMembers(memRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.amount || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/fine', form);
      toast.success('Fine added successfully!');
      setShowAddModal(false);
      setForm({ memberId: '', amount: '', reason: '', fineType: 'Late Fine', date: new Date().toISOString().slice(0, 10), note: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleMarkPaid = async (id, isPaid) => {
    try {
      await api.put(`/fine/${id}/${isPaid ? 'unpay' : 'pay'}`);
      toast.success(isPaid ? 'Fine marked as unpaid' : 'Fine marked as paid ✅');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fine?')) return;
    try {
      await api.delete(`/fine/${id}`);
      toast.success('Fine deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const { fines = [], summary = [], grandTotal = 0, totalPaid = 0, totalUnpaid = 0 } = data || {};

  const TYPE_COLOR = {
    'Late Fine': '#ef4444',
    'Investment Late Fine': '#f59e0b',
    'Loan Overdue Fine': '#8b5cf6',
    'Other': '#6b7280',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex-between mb-20">
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
            <i className="ti ti-alert-triangle" style={{ color: 'var(--red)', marginRight: 8 }} />
            Fines Management
          </h2>
          <div className="text-muted text-sm mt-8">Track and manage member fines</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="ti ti-plus" /> Add Fine
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}><i className="ti ti-alert-triangle" /></div>
          <div className="stat-label">Total Fines</div>
          <div className="stat-value text-red">{fmt(grandTotal)}</div>
          <div className="stat-sub">{fines.length} records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-check" /></div>
          <div className="stat-label">Collected</div>
          <div className="stat-value text-green">{fmt(totalPaid)}</div>
          <div className="stat-sub">{fines.filter(f => f.isPaid).length} paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}><i className="ti ti-clock" /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value text-amber">{fmt(totalUnpaid)}</div>
          <div className="stat-sub">{fines.filter(f => !f.isPaid).length} unpaid</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,.15)', color: 'var(--purple)' }}><i className="ti ti-users" /></div>
          <div className="stat-label">Members Fined</div>
          <div className="stat-value">{summary.filter(s => s.totalFine > 0).length}</div>
          <div className="stat-sub">out of {members.length} members</div>
        </div>
      </div>

      {/* Available Balance Impact */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,.12), rgba(239,68,68,.04))',
        border: '1px solid rgba(239,68,68,.25)',
        borderRadius: 'var(--r2)', padding: '16px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <i className="ti ti-info-circle" style={{ color: 'var(--red)', fontSize: 20, flexShrink: 0 }} />
        <div>
          <div className="fw-600 text-sm">Impact on Available Balance</div>
          <div className="text-sm text-muted mt-8">
            Total fines: <span className="text-red fw-600">{fmt(grandTotal)}</span> ·
            Collected: <span className="text-green fw-600">{fmt(totalPaid)}</span> ·
            Pending collection: <span className="text-amber fw-600">{fmt(totalUnpaid)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'overview', label: 'Member Overview', icon: 'ti-users' },
          { id: 'all', label: 'All Fines', icon: 'ti-list' },
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
            <span className="card-title">Member-wise Fine Summary</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Total Fine</th><th>Paid</th><th>Pending</th><th>Records</th><th>Action</th></tr>
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
                    <td><span style={{ fontSize: 15, fontWeight: 700, color: s.totalFine > 0 ? 'var(--red)' : 'var(--text3)' }}>{fmt(s.totalFine)}</span></td>
                    <td className="text-green fw-600">{fmt(s.paidFine)}</td>
                    <td className="text-amber fw-600">{fmt(s.unpaidFine)}</td>
                    <td><span className="badge badge-blue">{s.fines.length}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => {
                        setForm(f => ({ ...f, memberId: s.memberId }));
                        setShowAddModal(true);
                      }}>
                        <i className="ti ti-plus" /> Add Fine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL FINES TAB */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Fines</span>
            <span className="badge badge-red">{fines.length} records</span>
          </div>
          {fines.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
              <i className="ti ti-mood-happy" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
              No fines yet! Everyone is on time 🎉
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Member</th><th>Type</th><th>Reason</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {fines.map(f => (
                    <tr key={f._id}>
                      <td>
                        <div className="flex-center gap-8">
                          <div className="avatar" style={{ width: 30, height: 30, background: 'rgba(239,68,68,.15)', color: 'var(--red)', fontSize: 11 }}>{initials(f.memberName)}</div>
                          <div>
                            <div className="fw-600">{f.memberName}</div>
                            <div className="text-sm text-muted">{f.memberMemberId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: TYPE_COLOR[f.fineType] + '22', color: TYPE_COLOR[f.fineType], border: `1px solid ${TYPE_COLOR[f.fineType]}44` }}>
                          {f.fineType}
                        </span>
                      </td>
                      <td className="text-muted" style={{ maxWidth: 200 }}>{f.reason}</td>
                      <td><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)' }}>{fmt(f.amount)}</span></td>
                      <td className="text-muted text-sm">{new Date(f.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        {f.isPaid
                          ? <span className="badge badge-green"><i className="ti ti-check" /> Paid</span>
                          : <span className="badge badge-red"><i className="ti ti-clock" /> Pending</span>}
                      </td>
                      <td>
                        <div className="flex-center gap-8">
                          <button className={`btn btn-sm ${f.isPaid ? 'btn-ghost' : 'btn-primary'}`} onClick={() => handleMarkPaid(f._id, f.isPaid)}>
                            {f.isPaid ? 'Unmark' : 'Mark Paid'}
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDelete(f._id)}>
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD FINE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title"><i className="ti ti-alert-triangle" style={{ color: 'var(--red)' }} /> Add Fine</div>
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
                  <label className="form-label">Fine Type *</label>
                  <select className="form-control" value={form.fineType} onChange={e => setForm(f => ({ ...f, fineType: e.target.value }))}>
                    {FINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <input className="form-control" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required placeholder="e.g. Late investment payment for June 2024" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input className="form-control" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="1" placeholder="e.g. 100" style={{ fontSize: 16 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <input className="form-control" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any additional notes..." />
                </div>
                {form.amount && form.memberId && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: 12 }}>
                    <div className="text-sm text-red fw-600">
                      <i className="ti ti-info-circle" /> Adding {fmt(form.amount)} fine to {members.find(m => m._id === form.memberId)?.name}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="ti ti-loader-2 spin" /> Saving...</> : <><i className="ti ti-check" /> Add Fine</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}