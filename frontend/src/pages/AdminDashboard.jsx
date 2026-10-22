// Admin dashboard for managing users, foods, and orders.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  updateAdminUser,
  getAdminFoods,
  createAdminFood,
  updateAdminFood,
  deleteAdminFood,
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminDeliveryStatus
} from '../services/api';
import '../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalFoods: 0, totalOrders: 0 });
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foodForm, setFoodForm] = useState({ name: '', description: '', price: '', imageUrl: '', restaurantId: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Ensure admin is logged in.
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const loadAll = async () => {
      try {
        const [statsData, usersData, foodsData, ordersData, restaurantsData] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminFoods(),
          getAdminOrders(),
          fetch('http://localhost:5000/api/restaurants').then(r => r.json())
        ]);

        setStats(statsData);
        setUsers(usersData);
        setFoods(foodsData);
        setOrders(ordersData);
        setRestaurants(restaurantsData);
      } catch (error) {
        setMessage(error.message);
      }
    };

    loadAll();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await deleteAdminUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleEditUser = async (user) => {
    const email = prompt('New email', user.email) || user.email;
    const password = prompt('New password', '');

    if (!password) {
      setMessage('Password is required to update a user');
      return;
    }

    await updateAdminUser(user.id, { email, password });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, email } : u)));
  };

  const handleFoodChange = (event) => {
    const { name, value } = event.target;
    setFoodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateFood = async (event) => {
    event.preventDefault();
    const payload = { 
      ...foodForm, 
      price: Number(foodForm.price || 0),
      restaurantId: Number(foodForm.restaurantId) || null
    };
    const newFood = await createAdminFood(payload);
    setFoods((prev) => [...prev, newFood]);
    setFoodForm({ name: '', description: '', price: '', imageUrl: '', restaurantId: '' });
  };

  const handleUpdateFood = async (food) => {
    const name = prompt('Food name', food.name) || food.name;
    const description = prompt('Description', food.description || '') || food.description;
    const price = Number(prompt('Price', String(food.price || 0)) || food.price || 0);
    const imageUrl = prompt('Image URL', food.imageUrl || '') || food.imageUrl;
    const restaurantId = Number(prompt('Restaurant ID', String(food.restaurantId || '')) || food.restaurantId);

    await updateAdminFood(food.id, { name, description, price, imageUrl, restaurantId });
    setFoods((prev) => prev.map((f) => (f.id === food.id ? { ...f, name, description, price, imageUrl, restaurantId } : f)));
  };

  const handleDeleteFood = async (id) => {
    if (!confirm('Delete this food item?')) return;
    await deleteAdminFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateOrder = async (order) => {
    const status = prompt('New status (Pending/Delivered/Cancelled)', order.status) || order.status;
    await updateAdminOrderStatus(order.id, status);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
  };

  const handleUpdateDeliveryStatus = async (order) => {
    const deliveryStatus = prompt('Delivery Status (Preparing/Out for Delivery/Delivered)', order.deliveryStatus) || order.deliveryStatus;
    await updateAdminDeliveryStatus(order.id, deliveryStatus);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, deliveryStatus } : o)));
  };

  return (
    <div className="admin-bg">
      <div className="admin-dashboard">
        <header className="admin-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="admin-subtitle">Control panel for your food delivery app</p>
          </div>
          <div className="row-actions">
            <button className="admin-btn ghost" onClick={() => navigate('/admin/restaurants')}>Restaurants</button>
            <button className="admin-btn ghost" onClick={() => navigate('/admin/income')}>Income</button>
            <button className="admin-btn ghost" onClick={() => navigate('/admin/profile')}>Profile</button>
            <button className="admin-btn ghost" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {message && <p className="admin-message">{message}</p>}

        {/* Stats */}
        <section className="admin-stats">
          <div className="stat-tile">
            <h3>{stats.totalUsers}</h3>
            <p>Users</p>
          </div>
          <div className="stat-tile">
            <h3>{stats.totalFoods}</h3>
            <p>Foods</p>
          </div>
          <div className="stat-tile">
            <h3>{stats.totalOrders}</h3>
            <p>Orders</p>
          </div>
        </section>

        {/* Users */}
        <section className="admin-section">
          <h3>Users</h3>
          <div className="admin-table">
            {users.map((user) => (
              <div className="admin-row" key={user.id}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <div className="row-actions">
                  <button className="admin-btn" onClick={() => handleEditUser(user)}>Edit</button>
                  <button className="admin-btn danger" onClick={() => handleDeleteUser(user.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Foods */}
        <section className="admin-section">
          <h3>Foods</h3>
          <form className="food-form" onSubmit={handleCreateFood}>
            <input name="name" placeholder="Name" value={foodForm.name} onChange={handleFoodChange} required />
            <input name="description" placeholder="Description" value={foodForm.description} onChange={handleFoodChange} />
            <input name="price" placeholder="Price" value={foodForm.price} onChange={handleFoodChange} required />
            <input name="imageUrl" placeholder="Image URL" value={foodForm.imageUrl} onChange={handleFoodChange} />
            <select name="restaurantId" value={foodForm.restaurantId} onChange={handleFoodChange}>
              <option value="">Select Restaurant (Optional)</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name} - {r.location}</option>
              ))}
            </select>
            <button className="admin-btn" type="submit">Add Food</button>
          </form>

          <div className="admin-table">
            {foods.map((food) => (
              <div className="admin-row" key={food.id}>
                <span>{food.name}</span>
                <span>₹{Number(food.price || 0).toFixed(2)}</span>
                <div className="row-actions">
                  <button className="admin-btn" onClick={() => handleUpdateFood(food)}>Edit</button>
                  <button className="admin-btn danger" onClick={() => handleDeleteFood(food.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders */}
        <section className="admin-section">
          <h3>Orders</h3>
          <div className="admin-table">
            {orders.map((order) => (
              <div className="admin-row order-row" key={order.id}>
                <div className="order-details">
                  <span className="order-user">{order.userName} • {order.foodName} (x{order.quantity})</span>
                  <span className="order-amount">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                  <span className="order-address">📍 {order.deliveryAddress || 'N/A'}</span>
                </div>
                <div className="order-status-badges">
                  <span className="status-tag payment">
                    💳 {order.paymentStatus || 'Pending'}
                  </span>
                  <span className="status-tag delivery">
                    🚚 {order.deliveryStatus || 'Preparing'}
                  </span>
                </div>
                <div className="row-actions">
                  <button className="admin-btn" onClick={() => handleUpdateOrder(order)}>
                    Update Status
                  </button>
                  <button className="admin-btn ghost" onClick={() => handleUpdateDeliveryStatus(order)}>
                    Update Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
