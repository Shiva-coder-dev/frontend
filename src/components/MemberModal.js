import React, { useState, useEffect } from 'react';

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];

export default function MemberModal({ member, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    memberId: '', name: '', phone: '', email: '', address: '',
    password: '', loanAmount: '', loanStart: '', interestPct: 12,
    loanActive: true, interestPaid: 0, invested: 0,
    notes: '', color: '#3b82f6',
  });

  useEffect(() => {
    if (member) setForm({ ...member, password: '' });
  }, [member]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password; // don't overwrite if empty
    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{member ? 'Edit Member' : 'Add New Member'}</div>
          <button className="btn-icon" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Arun Kumar" />
              </div>
              <div className="form-group">
                <label className="form-label">Member ID *</label>
                <input className="form-control" value={form.memberId} onChange={e => set('memberId', e.target.value)} required placeholder="e.g. MEM006" readOnly={!!member} style={member ? { opacity: .6 } : {}} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, State" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{member ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input className="form-control" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required={!member} />
              </div>
              <div className="form-group">
                <label className="form-label">Interest Paid (₹)</label>
                <input className="form-control" type="number" value={form.interestPaid} onChange={e => set('interestPaid', e.target.value)} min="0" />
              </div>
            </div>
            {/* Loan Section */}
            <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <i className="ti ti-coin" style={{ color: 'var(--amber)', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>Loan Details</span>
              </div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loan Amount (₹)</label>
                  <input className="form-control" type="number" value={form.loanAmount}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(f => ({ ...f, loanAmount: val, loanActive: Number(val) > 0 }));
                    }}
                    placeholder="0" min="0" style={{ fontSize: 15 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Interest % p.a.</label>
                  <input className="form-control" type="number" value={form.interestPct} onChange={e => set('interestPct', e.target.value)} min="1" max="50" />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loan Start Date</label>
                  <input className="form-control" type="date" value={form.loanStart?.slice?.(0, 10) || ''} onChange={e => set('loanStart', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loan Status</label>
                  <select className="form-control" value={form.loanActive} onChange={e => set('loanActive', e.target.value === 'true')}>
                    <option value="true">Active</option>
                    <option value="false">Closed</option>
                  </select>
                  {form.loanAmount > 0 && form.loanActive && (
                    <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>
                      <i className="ti ti-info-circle" /> Monthly: ₹{Math.round(form.loanAmount * form.interestPct / 100 / 12).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Investment Section */}
            <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <i className="ti ti-trending-up" style={{ color: 'var(--blue3)', fontSize: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue3)' }}>Investment Details</span>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Invested Amount (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    value={form.invested}
                    onChange={e => set('invested', e.target.value)}
                    min="0"
                    placeholder="e.g. 50000"
                    style={{ fontSize: 15 }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    Total amount invested by this member in the group fund
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Avatar Color</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <div key={c} onClick={() => set('color', c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '2px solid transparent', transition: 'transform .1s', transform: form.color === c ? 'scale(1.25)' : 'scale(1)' }} />
                    ))}
                  </div>
                  {form.invested > 0 && (
                    <div style={{ marginTop: 10, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#34d399' }}>
                      <i className="ti ti-check" /> Investment: ₹{Number(form.invested).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Remarks</label>
              <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any additional notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><i className="ti ti-loader-2 spin" /> Saving...</> : <><i className="ti ti-check" /> {member ? 'Save Changes' : 'Add Member'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
