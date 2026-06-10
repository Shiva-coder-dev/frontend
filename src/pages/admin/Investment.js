import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const SETTINGS_KEY = 'fingroup_investment_settings';

const defaultSettings = {
  frequency: 'monthly',
  amount: 3000,
  dueDay: 1,
  dueDayWeekly: 'Monday',
};

export default function InvestmentPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings; }
    catch { return defaultSettings; }
  });
  const [tempSettings, setTempSettings] = useState(settings);
  const [paidMap, setPaidMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fingroup_investment_paid')) || {}; }
    catch { return {}; }
  });
  const [activeTab, setActiveTab] = useState('tracker');
  const [currentPeriod, setCurrentPeriod] = useState('');

  useEffect(() => {
    const now = new Date();
    if (settings.frequency === 'monthly') {
      setCurrentPeriod(now.toLocaleString('default', { month: 'long', year: 'numeric' }));
    } else {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      setCurrentPeriod(`${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`);
    }
  }, [settings.frequency]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/members');
      setMembers(res.data.data);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const saveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(tempSettings));
    toast.success('Settings saved!');
    setActiveTab('tracker');
  };

  const togglePaid = async (memberId, memberName, memberDbId) => {
    const key = `${currentPeriod}_${memberId}`;
    const isPaid = paidMap[key];
    const newPaidMap = { ...paidMap, [key]: !isPaid };
    setPaidMap(newPaidMap);
    localStorage.setItem('fingroup_investment_paid', JSON.stringify(newPaidMap));

    if (!isPaid) {
      try {
        await api.post('/transactions', {
          memberId: memberDbId,
          amount: settings.amount,
          type: 'Investment',
          date: new Date(),
          note: `Investment payment — ${currentPeriod}`,
        });
        const member = members.find(m => m._id === memberDbId);
        if (member) {
          await api.put(`/members/${memberDbId}`, {
            invested: (member.invested || 0) + Number(settings.amount),
          });
        }
        toast.success(`${memberName} marked as paid ✅`);
        fetchMembers();
      } catch { toast.error('Failed to record payment'); }
    } else {
      try {
        const member = members.find(m => m._id === memberDbId);
        if (member) {
          await api.put(`/members/${memberDbId}`, {
            invested: Math.max(0, (member.invested || 0) - Number(settings.amount)),
          });
        }
        toast('Payment unmarked');
        fetchMembers();
      } catch { toast.error('Failed to unmark payment'); }
    }
  };

  const paidCount = members.filter(m => paidMap[`${currentPeriod}_${m.memberId}`]).length;
  const unpaidCount = members.length - paidCount;
  const totalCollected = paidCount * settings.amount;
  const totalExpected = members.length * settings.amount;
  const dueDateText = settings.frequency === 'monthly'
    ? `Every month on day ${settings.dueDay}`
    : `Every ${settings.dueDayWeekly}`;
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'tracker', label: 'Payment Tracker', icon: 'ti-check' },
          { id: 'settings', label: 'Settings', icon: 'ti-settings' },
          { id: 'history', label: 'History', icon: 'ti-history' },
        ].map(t => (
          <button key={t.id} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(t.id)}>
            <i className={`ti ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* TRACKER TAB */}
      {activeTab === 'tracker' && (
        <div>
          <div className="stat-grid mb-20">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,.15)', color: 'var(--blue3)' }}><i className="ti ti-calendar" /></div>
              <div className="stat-label">Current Period</div>
              <div className="stat-value" style={{ fontSize: 16 }}>{currentPeriod}</div>
              <div className="stat-sub">{dueDateText}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: 'var(--green)' }}><i className="ti ti-check" /></div>
              <div className="stat-label">Paid</div>
              <div className="stat-value text-green">{paidCount} / {members.length}</div>
              <div className="stat-sub">{fmt(totalCollected)} collected</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}><i className="ti ti-clock" /></div>
              <div className="stat-label">Pending</div>
              <div className="stat-value text-red">{unpaidCount}</div>
              <div className="stat-sub">{fmt(totalExpected - totalCollected)} remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber)' }}><i className="ti ti-coin" /></div>
              <div className="stat-label">Amount Per Member</div>
              <div className="stat-value text-amber">{fmt(settings.amount)}</div>
              <div className="stat-sub">{settings.frequency === 'monthly' ? 'Monthly' : 'Weekly'}</div>
            </div>
          </div>

          <div className="card mb-20">
            <div className="card-body">
              <div className="flex-between mb-8">
                <span className="fw-600">Collection Progress — {currentPeriod}</span>
                <span className="text-blue fw-600">{Math.round((paidCount / members.length) * 100) || 0}%</span>
              </div>
              <div className="progress" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${(paidCount / members.length) * 100}%`, background: 'linear-gradient(90deg, var(--blue), var(--green))' }} />
              </div>
              <div className="flex-between mt-8 text-sm text-muted">
                <span>Collected: {fmt(totalCollected)}</span>
                <span>Expected: {fmt(totalExpected)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Member Payment Status — {currentPeriod}</span>
              <div className="flex-center gap-8">
                <span className="badge badge-green">{paidCount} Paid</span>
                <span className="badge badge-red">{unpaidCount} Pending</span>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Amount Due</th>
                    <th>Total Invested</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const key = `${currentPeriod}_${m.memberId}`;
                    const isPaid = paidMap[key];
                    return (
                      <tr key={m._id}>
                        <td>
                          <div className="flex-center gap-8">
                            <div className="avatar" style={{ width: 36, height: 36, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 12 }}>{initials(m.name)}</div>
                            <div>
                              <div className="fw-600">{m.name}</div>
                              <div className="text-sm text-muted">{m.memberId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="fw-600 text-amber">{fmt(settings.amount)}</td>
                        <td className="text-blue">{fmt(m.invested)}</td>
                        <td>
                          {isPaid
                            ? <span className="badge badge-green"><i className="ti ti-check" /> Paid</span>
                            : <span className="badge badge-red"><i className="ti ti-clock" /> Pending</span>}
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${isPaid ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => togglePaid(m.memberId, m.name, m._id)}
                          >
                            {isPaid
                              ? <><i className="ti ti-x" /> Unmark</>
                              : <><i className="ti ti-check" /> Mark Paid</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 500 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title"><i className="ti ti-settings" /> Investment Settings</span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Payment Frequency</label>
                <select className="form-control" value={tempSettings.frequency} onChange={e => setTempSettings(s => ({ ...s, frequency: e.target.value }))}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Per Member (₹)</label>
                <input className="form-control" type="number" value={tempSettings.amount} onChange={e => setTempSettings(s => ({ ...s, amount: e.target.value }))} min="1" style={{ fontSize: 16 }} />
                <div className="text-sm text-muted mt-8">
                  Total expected per period: {fmt(tempSettings.amount * members.length)} ({members.length} members)
                </div>
              </div>
              {tempSettings.frequency === 'monthly' ? (
                <div className="form-group">
                  <label className="form-label">Due Day of Month</label>
                  <select className="form-control" value={tempSettings.dueDay} onChange={e => setTempSettings(s => ({ ...s, dueDay: e.target.value }))}>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>Day {d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of every month</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Due Day of Week</label>
                  <select className="form-control" value={tempSettings.dueDayWeekly} onChange={e => setTempSettings(s => ({ ...s, dueDayWeekly: e.target.value }))}>
                    {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div className="text-sm fw-600 text-blue mb-8"><i className="ti ti-info-circle" /> Preview</div>
                <div className="text-sm text-muted">Frequency: <span className="fw-600 text-blue">{tempSettings.frequency === 'monthly' ? 'Monthly' : 'Weekly'}</span></div>
                <div className="text-sm text-muted">Amount: <span className="fw-600 text-amber">{fmt(tempSettings.amount)} per member</span></div>
                <div className="text-sm text-muted">Due: <span className="fw-600">{tempSettings.frequency === 'monthly' ? `Day ${tempSettings.dueDay} of every month` : `Every ${tempSettings.dueDayWeekly}`}</span></div>
                <div className="text-sm text-muted">Total per period: <span className="fw-600 text-green">{fmt(tempSettings.amount * members.length)}</span></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveSettings}>
                <i className="ti ti-check" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Investment Payment History</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Period</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {members.map(m =>
                  Object.keys(paidMap)
                    .filter(k => k.includes(m.memberId) && paidMap[k])
                    .map(k => (
                      <tr key={k}>
                        <td>
                          <div className="flex-center gap-8">
                            <div className="avatar" style={{ width: 30, height: 30, background: (m.color || '#3b82f6') + '22', color: m.color || '#3b82f6', fontSize: 11 }}>{initials(m.name)}</div>
                            <span className="fw-600">{m.name}</span>
                          </div>
                        </td>
                        <td className="text-muted">{k.replace(`_${m.memberId}`, '')}</td>
                        <td className="fw-600 text-green">{fmt(settings.amount)}</td>
                        <td><span className="badge badge-green"><i className="ti ti-check" /> Paid</span></td>
                      </tr>
                    ))
                )}
                {members.every(m => !Object.keys(paidMap).some(k => k.includes(m.memberId) && paidMap[k])) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No payment history yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}