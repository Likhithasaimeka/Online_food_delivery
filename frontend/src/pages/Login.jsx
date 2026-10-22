// Import hooks and API function.
import { useState } from 'react';
import { getUsers } from '../services/api';
import '../styles/pages.css';

// Login page performs simple user match from backend users list.
function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  // Update local form state while typing.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Validate credentials by checking backend users.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const users = await getUsers();
      const matchedUser = users.find(
        (user) => user.email === formData.email && user.password === formData.password
      );

      if (matchedUser) {
        localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
        setMessage('Login successful');
      } else {
        setMessage('Invalid email or password');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="page-container small-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
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
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}

export default Login;
