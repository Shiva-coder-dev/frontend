import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function MySamruthy() {
  const { member } = useAuth();

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (member?._id) {
      loadData();
    }
  }, [member]);

  const loadData = async () => {
    try {
      const res = await api.get(`/samruthy/member/${member._id}`);

      setEntries(res.data.data.entries || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load Samruthy data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div>
      <h2>My Samruthy</h2>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3>Total Samruthy Investment</h3>
        <h1>{fmt(total)}</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Transaction History</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="3">No Samruthy investments found</td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{fmt(entry.amount)}</td>
                    <td>{entry.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}