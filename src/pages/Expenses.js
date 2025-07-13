import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch expenses data
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to fetch expenses');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/expenses', {
        ...form,
        amount: Number(form.amount),
        date: form.date || undefined,
      });
      setForm({ title: '', amount: '', category: '', date: '' });
      fetchExpenses();
    } catch (err) {
      setError('Failed to add expense');
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      const res = await API.get('/expenses/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export expenses');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="expenses-content" style={{ flex: 1, padding: '2rem' }}>
        <h2>Expense Management</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
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
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          <button type="submit">Add Expense</button>
        </form>
        <button onClick={handleExport} style={{ marginBottom: '1rem' }}>Export to Excel</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.amount}</td>
                  <td>{item.category}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(item._id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No expense records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Expenses;
