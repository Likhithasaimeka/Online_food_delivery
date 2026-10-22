// Import nav link helper for routing.
import { NavLink } from 'react-router-dom';
import '../styles/navbar.css';

// Top navigation for all main pages.
function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">Food Delivery</h1>
      <div className="navbar-links">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        {!(() => {
          const user = localStorage.getItem('loggedInUser');
          const admin = localStorage.getItem('adminToken');
          return Boolean(user || admin);
        })() && (
          <NavLink to="/auth" className="nav-link">
            Auth
          </NavLink>
        )}
        <NavLink to="/cart" className="nav-link">
          Cart
        </NavLink>
        <NavLink to="/profile" className="nav-link profile-link" aria-label="Profile">
          <span className="profile-circle">
            {(() => {
              const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
              return user?.name ? user.name.charAt(0).toUpperCase() : '👤';
            })()}
          </span>
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
