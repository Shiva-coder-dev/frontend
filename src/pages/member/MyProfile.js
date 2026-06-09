import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function MyProfile() {
  const { member, user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  if (!member) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  const name = member.name || user?.name;
  const color = member.color || '#8b5cf6';
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const info = [
    ['Member ID', member.memberId, 'ti-id-badge'],
    ['Full Name', name, 'ti-user'],
    ['Phone', member.phone, 'ti-phone'],
    ['Email', member.email, 'ti-mail'],
    ['Address', member.address || '—', 'ti-map-pin'],
    ['Member Since', member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', 'ti-calendar'],
  ];

  return (
    <div className="grid-2">
      {/* Profile Info */}
      <div>
        <div className="card mb-20">
          <div className="card-body" style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 24 }}>
            <div className="avatar" style={{ width: 72, height: 72, borderRadius: 18, background: color + '22', color, fontSize: 26, margin: '0 auto 14px' }}>{initials}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{name}</div>
            <div className="text-muted text-sm mt-8">{member.memberId}</div>
            <div className="flex-center gap-8 mt-8" style={{ justifyContent: 'center' }}>
              {member.loanActive ? <span className="badge badge-amber">Loan Active</span> : <span className="badge badge-green">Loan Closed</span>}
              <span className="badge badge-blue">Member</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Profile Information</span></div>
          <div className="card-body">
            {info.map(([label, value, icon]) => (
              <div key={label} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-center gap-8 text-muted text-sm"><i className={`ti ${icon}`} />{label}</div>
                <span className="fw-600 text-sm" style={{ maxWidth: 200, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            {member.notes && (
              <div style={{ marginTop: 12, padding: 10, background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
                <i className="ti ti-note" /> {member.notes}
              </div>
            )}
            <div className="divider" />
            <div className="text-sm text-muted"><i className="ti ti-lock" /> To update profile details, contact your administrator.</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-header"><span className="card-title"><i className="ti ti-lock" /> Change Password</span></div>
        <div className="card-body">
          <form onSubmit={handlePwChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Min. 6 characters" minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-control" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required placeholder="Re-enter new password" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><i className="ti ti-loader-2 spin" /> Updating...</> : <><i className="ti ti-lock-check" /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
