import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function InterestPage() {
  const [members, setMembers] = useState([]);
  const [globalRate, setGlobalRate] = useState('');
  const [perRates, setPerRates] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    const r = await api.get('/members', { params: { loanActive: true } });
    const ms = r.data.data;
    setMembers(ms);
    const rates = {};
    ms.forEach(m => { rates[m._id] = m.interestPct; });
    setPerRates(rates);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const applyGlobal = async () => {
    const rate = parseFloat(globalRate);
    if (!rate || rate <= 0 || rate > 50) { toast.error('Enter a valid rate (1–50%)'); return; }
    try {
      await api.put('/members/interest/global', { rate });
      toast.success(`Rate updated to ${rate}% for all active members`);
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updatePerMember = async (id, name) => {
    const rate = parseFloat(perRates[id]);
    if (!rate || rate <= 0 || rate > 50) { toast.error('Invalid rate'); return; }
    try {
      await api.put(`/members/${id}/interest`, { rate });
      toast.success(`Rate updated for ${name}`);
      fetchMembers();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  return (
    <div>
      <div className="grid-2 mb-20">
        {/* Global Rate */}
        <div className="card">
          <div className="card-header"><span className="card-title"><i className="ti ti-world" /> Global Rate Update</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Set Rate for ALL Active Members (%)</label>
              <input className="form-control" type="number" value={globalRate} onChange={e => setGlobalRate(e.target.value)} placeholder="e.g. 12" min="1" max="50" style={{ fontSize: 16 }} />
            </div>
            <button className="btn btn-primary" onClick={applyGlobal}><i className="ti ti-percentage" /> Apply to All Members</button>
            <div className="divider" />
            <div className="text-sm text-muted"><i className="ti ti-info-circle" /> This will override the interest rate for all <strong>{members.length}</strong> active loan members at once.</div>
          </div>
        </div>

        {/* Per-member override */}
        <div className="card">
          <div className="card-header"><span className="card-title"><i className="ti ti-adjustments" /> Per-Member Override</span></div>
          <div className="card-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {members.map(m => (
              <div key={m._id} className="flex-between" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div className="flex-center gap-8">
                  <div className="avatar" style={{ width: 30, height: 30, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 11 }}>{initials(m.name)}</div>
                  <div className="fw-600 text-sm">{m.name}</div>
                </div>
                <div className="flex-center gap-8">
                  <input type="number" className="form-control" value={perRates[m._id] || ''} onChange={e => setPerRates(r => ({ ...r, [m._id]: e.target.value }))} style={{ width: 70, padding: '6px 8px', textAlign: 'center' }} min="1" max="50" />
                  <span className="text-muted text-sm">%</span>
                  <button className="btn btn-primary btn-sm" onClick={() => updatePerMember(m._id, m.name)}>Set</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rate Summary Table */}
      <div className="card">
        <div className="card-header"><span className="card-title">Current Interest Rate Summary</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Member</th><th>Current Rate</th><th>Loan Amount</th><th>Monthly Interest</th><th>Annual Interest</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m._id}>
                  <td>
                    <div className="flex-center gap-8">
                      <div className="avatar" style={{ width: 30, height: 30, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 11 }}>{initials(m.name)}</div>
                      <span className="fw-600">{m.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{m.interestPct}%</span></td>
                  <td>{fmt(m.loanAmount)}</td>
                  <td className="text-amber">{fmt(m.monthlyInterest)}</td>
                  <td>{fmt(m.loanAmount * m.interestPct / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
