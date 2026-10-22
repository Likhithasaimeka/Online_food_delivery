// Admin restaurant management page.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    rating: '4.0',
    deliveryTime: '30-40 mins'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadRestaurants();
  }, [navigate]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRestaurantForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...restaurantForm,
          rating: Number(restaurantForm.rating)
        })
      });
      const newRestaurant = await response.json();
      setRestaurants((prev) => [...prev, newRestaurant]);
      setRestaurantForm({
        name: '',
        location: '',
        description: '',
        imageUrl: '',
        rating: '4.0',
        deliveryTime: '30-40 mins'
      });
      setMessage('Restaurant created successfully');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async (restaurant) => {
    const name = prompt('Restaurant name', restaurant.name) || restaurant.name;
    const location = prompt('Location', restaurant.location) || restaurant.location;
    const description = prompt('Description', restaurant.description || '') || restaurant.description;
    const rating = Number(prompt('Rating (0-5)', String(restaurant.rating || 4.0)) || restaurant.rating);
    const deliveryTime = prompt('Delivery time', restaurant.deliveryTime || '30-40 mins') || restaurant.deliveryTime;
    const imageUrl = prompt('Image URL', restaurant.imageUrl || '') || restaurant.imageUrl;

    try {
      await fetch(`http://localhost:5000/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, description, rating, deliveryTime, imageUrl })
      });
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurant.id ? { ...r, name, location, description, rating, deliveryTime, imageUrl } : r))
      );
      setMessage('Restaurant updated successfully');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant?')) return;
    try {
      await fetch(`http://localhost:5000/api/restaurants/${id}`, { method: 'DELETE' });
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setMessage('Restaurant deleted successfully');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  return (
    <div className="admin-bg">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Restaurant Management</h1>
          <div className="admin-nav">
            <button onClick={() => navigate('/admin/dashboard')} className="admin-nav-btn">Dashboard</button>
            <button onClick={() => navigate('/admin/profile')} className="admin-nav-btn">Profile</button>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
        </div>

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-section">
          <h2>Add New Restaurant</h2>
          <form onSubmit={handleCreate} className="admin-form">
            <input
              type="text"
              name="name"
              placeholder="Restaurant Name"
              value={restaurantForm.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location (e.g., Jubilee Hills)"
              value={restaurantForm.location}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={restaurantForm.description}
              onChange={handleChange}
            />
            <input
              type="number"
              step="0.1"
              name="rating"
              placeholder="Rating (0-5)"
              value={restaurantForm.rating}
              onChange={handleChange}
            />
            <input
              type="text"
              name="deliveryTime"
              placeholder="Delivery Time (e.g., 30-40 mins)"
              value={restaurantForm.deliveryTime}
              onChange={handleChange}
            />
            <input
              type="text"
              name="imageUrl"
              placeholder="Image URL"
              value={restaurantForm.imageUrl}
              onChange={handleChange}
            />
            <button type="submit" className="admin-btn">Add Restaurant</button>
          </form>
        </div>

        <div className="admin-section">
          <h2>All Restaurants ({restaurants.length})</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Rating</th>
                  <th>Delivery Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>{restaurant.id}</td>
                    <td>{restaurant.name}</td>
                    <td>{restaurant.location}</td>
                    <td>{restaurant.description}</td>
                    <td>⭐ {restaurant.rating}</td>
                    <td>🕒 {restaurant.deliveryTime}</td>
                    <td>
                      <button onClick={() => handleUpdate(restaurant)} className="admin-edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(restaurant.id)} className="admin-delete-btn">
                        Delete
                      </button>
                    </td>
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

export default AdminRestaurants;
