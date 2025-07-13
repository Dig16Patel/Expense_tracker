import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import API from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const Dashboard = () => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expensesRes] = await Promise.all([
          API.get('/income'),
          API.get('/expenses'),
        ]);
        setIncome(incomeRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        // handle error (e.g., show a message)
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Get the 5 most recent transactions (income + expenses)
  const recentTransactions = [
    ...income.map((item) => ({ ...item, type: 'Income' })),
    ...expenses.map((item) => ({ ...item, type: 'Expense' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="dashboard-content" style={{ flex: 1, padding: '2rem' }}>
        <h2>Dashboard Overview</h2>
        <div className="summary-cards" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', flex: 1 }}>
            <h3>Total available Balance</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{balance}</p>
          </div>
          <div className="card" style={{ background: '#c8e6c9', padding: '1rem', borderRadius: '8px', flex: 1 }}>
            <h3>Total Income</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalIncome}</p>
          </div>
          <div className="card" style={{ background: '#ffcdd2', padding: '1rem', borderRadius: '8px', flex: 1 }}>
            <h3>Total Expenses</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalExpenses}</p>
          </div>
        </div>
        <h3>Income & Expenses Overview (Bar Chart)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { name: 'Income', amount: totalIncome },
                { name: 'Expenses', amount: totalExpenses }
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <h3>Expenses by Category (Pie Chart)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={Object.entries(
                  expenses.reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                  }, {})
                ).map(([category, amount]) => ({ name: category, value: amount }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {expenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#1976d2', '#ffc658', '#82ca9d', '#ff8042', '#d32f2f'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <h3>Income & Expenses Over Time (Line Chart)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={
                // Combine and sort by date
                [...income, ...expenses]
                  .map(item => ({
                    date: new Date(item.date).toLocaleDateString(),
                    income: item.source ? item.amount : 0,
                    expense: item.title ? item.amount : 0
                  }))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
              }
            >
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#1976d2" />
              <Line type="monotone" dataKey="expense" stroke="#d32f2f" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <h3>Recent Transactions</h3>
        <ul>
          {recentTransactions.map((tx, idx) => (
            <li key={tx._id || idx}>
              <strong>{tx.type}:</strong> {tx.type === 'Income' ? tx.source : tx.title} — {tx.amount} ({new Date(tx.date).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
