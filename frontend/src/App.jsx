// Import route helpers and pages.
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Wallet from './pages/Wallet';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminEditProfile from './pages/AdminEditProfile';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminIncome from './pages/AdminIncome';

// Main app component with page routing.
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/register" element={<Auth initialMode="register" />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin/login" element={<Auth initialMode="admin" />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/restaurants" element={<AdminRestaurants />} />
        <Route path="/admin/income" element={<AdminIncome />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/profile/edit" element={<AdminEditProfile />} />
      </Routes>
    </div>
  );
}

export default App;
