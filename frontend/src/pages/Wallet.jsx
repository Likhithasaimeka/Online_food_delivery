// User Wallet page for managing wallet balance.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/wallet.css';

function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setUser(loggedInUser);
    loadWalletData(loggedInUser.id);
  }, [navigate]);

  const loadWalletData = async (userId) => {
    try {
      const [walletData, paymentsData] = await Promise.all([
        fetch(`http://localhost:5000/api/wallet/${userId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/payments/user/${userId}`).then(r => r.json())
      ]);
      setWallet(walletData);
      setPayments(paymentsData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!amount || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      setWallet(data.wallet);
      setAmount('');
      setPassword('');
      setShowAddMoney(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>💳 My Wallet</h1>
        <button onClick={() => navigate('/profile')} className="back-btn">← Back to Profile</button>
      </div>

      {message && <div className="wallet-message">{message}</div>}

      {/* Wallet Balance Card */}
      <div className="wallet-balance-card">
        <div className="balance-icon">💰</div>
        <div className="balance-details">
          <p className="balance-label">Current Balance</p>
          <h2 className="balance-amount">₹{Number(wallet.balance || 0).toFixed(2)}</h2>
        </div>
        <button 
          className="add-money-btn" 
          onClick={() => setShowAddMoney(!showAddMoney)}
        >
          + Add Money
        </button>
      </div>

      {/* Add Money Form */}
      {showAddMoney && (
        <div className="add-money-form">
          <h3>Add Money to Wallet</h3>
          <form onSubmit={handleAddMoney}>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit" className="submit-btn">Add Money</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddMoney(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Amounts */}
      <div className="quick-add-section">
        <h3>Quick Add</h3>
        <div className="quick-add-buttons">
          {[100, 500, 1000, 2000, 5000].map((amt) => (
            <button
              key={amt}
              className="quick-add-btn"
              onClick={() => {
                setAmount(String(amt));
                setShowAddMoney(true);
              }}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h3>Transaction History</h3>
        {payments.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <div className="transactions-list">
            {payments.map((payment) => (
              <div key={payment.id} className="transaction-item">
                <div className="transaction-icon">
                  {payment.status === 'Completed' ? '✅' : '⏳'}
                </div>
                <div className="transaction-details">
                  <p className="transaction-id">Order #{payment.orderId}</p>
                  <p className="transaction-date">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="transaction-amount">
                  <p className="amount-value">-₹{Number(payment.amount || 0).toFixed(2)}</p>
                  <p className="amount-status">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallet;
