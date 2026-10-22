// Admin profile page (simple view for admin identity).
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function AdminProfile() {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || 'null');

  if (!adminInfo) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="admin-bg">
      <div className="admin-card">
        <h2>Admin Profile</h2>
        <p className="admin-subtitle">Administrator access</p>
        <div className="admin-profile-info">
          <p><strong>Email:</strong> {adminInfo.email}</p>
          <p><strong>Role:</strong> {adminInfo.role}</p>
        </div>
        <div className="row-actions">
          <button className="admin-btn" onClick={() => navigate('/admin/profile/edit')}>
            Edit Profile
          </button>
          <button className="admin-btn ghost" onClick={() => navigate('/admin/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
