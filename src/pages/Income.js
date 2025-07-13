import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';

const Income = () => {
  const [income, setIncome] = useState([]);
  const [form, setForm] = useState({ source: '', amount: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch income data
  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await API.get('/income');
      setIncome(res.data);
    } catch (err) {
      setError('Failed to fetch income');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new income
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/income', {
        ...form,
        amount: Number(form.amount),
        date: form.date || undefined,
      });
      setForm({ source: '', amount: '', date: '' });
      fetchIncome();
    } catch (err) {
      setError('Failed to add income');
    }
  };

  // Delete income
  const handleDelete = async (id) => {
    try {
      await API.delete(`/income/${id}`);
      fetchIncome();
    } catch (err) {
      setError('Failed to delete income');
    }
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      const res = await API.get('/income/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'income.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export income');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="income-content" style={{ flex: 1, padding: '2rem' }}>
        <h2>Income Management</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            name="source"
            placeholder="Source"
            value={form.source}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <button type="submit">Add Income</button>
        </form>
        <button onClick={handleExport} style={{ marginBottom: '1rem' }}>Export to Excel</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item._id}>
                  <td>{item.source}</td>
                  <td>{item.amount}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(item._id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {income.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No income records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Income;
