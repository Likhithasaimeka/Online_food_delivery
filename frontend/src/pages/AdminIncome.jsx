// Admin Income Dashboard with filters.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import '../styles/admin.css';

function AdminIncome() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ totalTransactions: 0, totalIncome: 0, averageOrderValue: 0 });
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate, filter]);

  const loadData = async () => {
    try {
      const [statsData, paymentsData] = await Promise.all([
        fetch(`${BASE_URL}/payments/income/${filter}`).then(r => r.json()),
        fetch(`${BASE_URL}/payments`).then(r => r.json())
      ]);
      setStats(statsData);
      setPayments(paymentsData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-bg">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Income Dashboard</h1>
          <div className="admin-nav">
            <button onClick={() => navigate('/admin/dashboard')} className="admin-nav-btn">
              Dashboard
            </button>
            <button onClick={() => navigate('/admin/restaurants')} className="admin-nav-btn">
              Restaurants
            </button>
            <button onClick={() => navigate('/admin/profile')} className="admin-nav-btn">
              Profile
            </button>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            📅 Today
          </button>
          <button 
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            📅 This Week
          </button>
          <button 
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            📅 This Month
          </button>
          <button 
            className={`filter-btn ${filter === 'year' ? 'active' : ''}`}
            onClick={() => setFilter('year')}
          >
            📅 This Year
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📊 All Time
          </button>
        </div>

        {/* Income Stats Cards */}
        <div className="income-stats">
          <div className="income-card">
            <div className="income-icon">💰</div>
            <div className="income-details">
              <h3>Total Income</h3>
              <p className="income-amount">₹{Number(stats.totalIncome || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="income-card">
            <div className="income-icon">🛒</div>
            <div className="income-details">
              <h3>Total Transactions</h3>
              <p className="income-amount">{stats.totalTransactions || 0}</p>
            </div>
          </div>
          <div className="income-card">
            <div className="income-icon">📊</div>
            <div className="income-details">
              <h3>Average Order Value</h3>
              <p className="income-amount">₹{Number(stats.averageOrderValue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="admin-section">
          <h2>Payment History ({payments.length})</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.transactionId || `TXN${payment.id}`}</td>
                    <td>{payment.userName} ({payment.userEmail})</td>
                    <td className="amount-cell">₹{Number(payment.amount || 0).toFixed(2)}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      <span className={`status-badge ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminIncome;
