// Unified Auth page for Login, Register, and Admin Login.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, getUsers, requestRegistrationOtp, resendRegistrationOtp, verifyRegistrationOtp } from '../services/api';
import '../styles/auth.css';

function Auth({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '' });
  const [otpData, setOtpData] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [adminData, setAdminData] = useState({ email: '', password: '' });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setMessage('');
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (event) => {
    const { name, value } = event.target;
    setOtpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (event) => {
    const { name, value } = event.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const users = await getUsers();
      const matchedUser = users.find(
        (user) => user.email === loginData.email && user.password === loginData.password
      );

      if (matchedUser && matchedUser.isVerified) {
        localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
        setMessage('Login successful');
        setTimeout(() => navigate('/profile'), 500);
      } else if (matchedUser && !matchedUser.isVerified) {
        setMessage('Please verify your email before logging in');
      } else {
        setMessage('Invalid email or password');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await requestRegistrationOtp(registerData);
      setOtpSent(true);
      setOtpData({ email: registerData.email, otp: '', password: '', confirmPassword: '' });
      setMessage('OTP sent to your email');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await verifyRegistrationOtp(otpData);
      setMessage('Registration complete! You can now login.');
      setOtpSent(false);
      setRegisterData({ name: '', email: '' });
      setMode('login');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleResendOtp = async () => {
    setMessage('');
    try {
      await resendRegistrationOtp({ email: otpData.email });
      setMessage('OTP resent to your email');
      setResendCooldown(60);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const data = await adminLogin(adminData);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      setMessage('Admin login successful');
      setTimeout(() => navigate('/admin/dashboard'), 500);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Choose how you want to continue</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeChange('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeChange('register')}
          >
            Register
          </button>
          <button
            className={`auth-tab ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => handleModeChange('admin')}
          >
            Admin Login
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleUserLogin} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button className="auth-btn" type="submit">Login</button>
          </form>
        )}

        {mode === 'register' && !otpSent && (
          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <button className="auth-btn" type="submit">Send OTP</button>
          </form>
        )}

        {mode === 'register' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={otpData.email}
              onChange={handleOtpChange}
              disabled
            />
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={otpData.otp}
              onChange={handleOtpChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={otpData.password}
              onChange={handleOtpChange}
              required
              minLength="6"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={otpData.confirmPassword}
              onChange={handleOtpChange}
              required
              minLength="6"
            />
            <button className="auth-btn" type="submit">Complete Registration</button>
            <button
              type="button"
              className="auth-btn ghost"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
            </button>
          </form>
        )}

        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={adminData.email}
              onChange={handleAdminChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={adminData.password}
              onChange={handleAdminChange}
              required
            />
            <button className="auth-btn" type="submit">Admin Login</button>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}

export default Auth;
