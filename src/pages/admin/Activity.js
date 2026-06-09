import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_ICON = { member: 'ti-user', loan: 'ti-coin', payment: 'ti-cash', interest: 'ti-percentage', system: 'ti-settings', auth: 'ti-login' };
const TYPE_COLOR = { member: '#10b981', loan: '#3b82f6', payment: '#f59e0b', interest: '#8b5cf6', system: '#6b7280', auth: '#06b6d4' };

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/reports/activity')
      .then(r => setLogs(r.data.data))
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;

  return (
    <div>
      <div className="flex-between mb-20">
        <div className="flex-center gap-8">
          {['all', 'member', 'payment', 'interest', 'loan', 'auth'].map(t => (
            <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <span className="badge badge-blue">{filtered.length} events</span>
      </div>

      <div className="card">
        <div className="card-body">
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
              <i className="ti ti-history" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
              No activity found.
            </div>
          )}
          {filtered.map((l, i) => {
            const color = TYPE_COLOR[l.type] || '#3b82f6';
            const icon = TYPE_ICON[l.type] || 'ti-info-circle';
            return (
              <div key={i} className="log-item">
                <div className="log-icon" style={{ background: color + '22', color }}><i className={`ti ${icon}`} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{l.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {l.adminName} · {new Date(l.createdAt).toLocaleString()}
                    {l.targetMember && <span className="tag" style={{ marginLeft: 6 }}>{l.targetMember}</span>}
                  </div>
                </div>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>{l.type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
