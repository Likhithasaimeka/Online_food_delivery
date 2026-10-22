// Profile page — displays logged-in user details and full order history.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, API_ORIGIN } from '../services/api';
import OrderTracker from '../components/OrderTracker';
import '../styles/profile.css';

// Default SVG avatar used when user has no profileImage set.
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='38' r='22' fill='%23888'/%3E%3Cellipse cx='50' cy='96' rx='36' ry='26' fill='%23888'/%3E%3C/svg%3E";
const ASSET_BASE = API_ORIGIN;

function Profile() {
  // profile holds: user fields + orders[] returned by /api/users/profile/:id
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Read logged-in user from localStorage (set during Login).
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (!loggedInUser) {
      // No session found — redirect to login page.
      navigate('/login');
      return;
    }

    // Fetch full profile (including totalOrders) from backend.
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(loggedInUser.id);
        setProfile(data);
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Navigate to edit-profile page (separate page to be built later).
  const handleEdit = () => navigate('/edit-profile');

  // Clear session and go back to login.
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('cart');
    navigate('/login');
  };

  // Format SQLite/ISO timestamp to readable date string.
  const formatDate = (ds) => {
    if (!ds) return 'N/A';
    const d = new Date(ds);
    if (isNaN(d)) return ds;
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Return colour class name based on order status.
  const statusClass = (status = '') =>
    ({ Pending: 'badge-pending', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled' }[status] || 'badge-pending');

  // Resolve profile image for absolute/relative URLs.
  const resolveImage = (src) => {
    if (!src) return DEFAULT_AVATAR;
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return `${ASSET_BASE}${src}`;
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="profile-bg">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <div className="profile-center">
          <div className="spinner" />
          <p className="loading-text">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="profile-bg">
        <div className="profile-center"><div className="error-box">{error}</div></div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────
  return (
    <div className="profile-bg">
      {/* Moving background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="profile-wrapper">

        {/* ── Profile card ── */}
        <div className="profile-card">

          {/* Round profile image with glowing gradient ring */}
          <div className="avatar-ring">
            <img
              src={resolveImage(profile?.profileImage)}
              alt="Profile"
              className="avatar-img"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
          </div>

          <h2 className="p-name">{profile?.name}</h2>
          <p className="p-email">{profile?.email}</p>

          {/* Stats: total orders + member since */}
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-num">{profile?.totalOrders ?? 0}</span>
              <span className="stat-lbl">Orders</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-num" style={{ fontSize: '13px' }}>{formatDate(profile?.createdAt)}</span>
              <span className="stat-lbl">Member Since</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="action-row">
            <button className="btn-edit" onClick={handleEdit}>✏️&nbsp; Edit Profile</button>
            <button className="btn-wallet" onClick={() => navigate('/wallet')}>💳&nbsp; My Wallet</button>
            <button className="btn-logout" onClick={handleLogout}>🚪&nbsp; Logout</button>
          </div>
        </div>

        {/* ── Order history ── */}
        <div className="orders-section">
          <h3 className="orders-heading">
            🧾 Order History
            <span className="orders-count">{profile?.orders?.length ?? 0}</span>
          </h3>

          {profile?.orders?.length === 0 ? (
            <div className="orders-empty">
              <span>🍽️</span>
              <p>No orders placed yet.</p>
            </div>
          ) : (
            <div className="orders-list">
              {profile.orders.map((order) => (
                <div className="order-card-wrapper" key={order.id}>
                  <div className="order-card">

                    {/* Left: icon + food name + quantity */}
                    <div className="order-left">
                      <div className="order-food-icon">🍴</div>
                      <div>
                        <p className="order-food-name">{order.foodName}</p>
                        <p className="order-qty">Qty: {order.quantity}</p>
                      </div>
                    </div>

                    {/* Right: price + payment status + date */}
                    <div className="order-right">
                      <p className="order-price">
                        ₹{(order.totalAmount || (Number(order.foodPrice) * Number(order.quantity))).toFixed(2)}
                      </p>
                      <span className={`status-badge ${order.paymentStatus === 'Completed' ? 'badge-delivered' : 'badge-pending'}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>

                  </div>
                  
                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="order-delivery-info">
                      <p className="delivery-label">🏠 Delivery Address:</p>
                      <p className="delivery-address">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Order Tracker */}
                  {order.deliveryStatus && (
                    <OrderTracker deliveryStatus={order.deliveryStatus} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
