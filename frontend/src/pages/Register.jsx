// Import hooks and API function.
import { useState } from 'react';
import { registerUser } from '../services/api';
import '../styles/pages.css';

// Register page creates a new user in backend.
function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  // Update local form state while typing.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Submit new user to backend API.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await registerUser(formData);
      setMessage('Registration successful');
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="page-container small-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}

export default Register;
