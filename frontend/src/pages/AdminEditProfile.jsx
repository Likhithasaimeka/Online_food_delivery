// Admin Edit Profile page — update admin email/password.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminProfile, updateAdminProfile } from '../services/api';
import '../styles/admin.css';

function AdminEditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getAdminProfile();
        setFormData((prev) => ({ ...prev, email: data.email || '' }));
      } catch (error) {
        setMessage(error.message);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await updateAdminProfile(formData);
      localStorage.setItem('adminInfo', JSON.stringify({ email: formData.email, role: 'admin' }));
      setMessage('Admin profile updated');
      setTimeout(() => navigate('/admin/profile'), 500);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="admin-bg">
      <div className="admin-card">
        <h2>Edit Admin Profile</h2>
        <p className="admin-subtitle">Update admin credentials</p>
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
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="admin-btn">Save</button>
          <button type="button" className="admin-btn ghost" onClick={() => navigate('/admin/profile')}>Cancel</button>
        </form>
        {message && <p className="admin-message">{message}</p>}
      </div>
    </div>
  );
}

export default AdminEditProfile;
