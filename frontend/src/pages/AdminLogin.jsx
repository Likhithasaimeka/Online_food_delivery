// Admin login page.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import '../styles/admin.css';

function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const data = await adminLogin(formData);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="admin-bg">
      <div className="admin-card">
        <h2>Admin Login</h2>
        <p className="admin-subtitle">Secure access to management tools</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="admin-btn">
            Login
          </button>
        </form>
        {message && <p className="admin-message">{message}</p>}
      </div>
    </div>
  );
}

export default AdminLogin;
