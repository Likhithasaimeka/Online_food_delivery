// Set backend base URL in one place.
const BASE_URL = 'http://localhost:5000/api';

// Generic helper for API calls.
const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

// Food API calls.
export const getFoods = () => request('/foods');

// User API calls.
// Fetch full profile: user details + totalOrders + all previous orders.
export const getUserProfile = (id) => request(`/users/profile/${id}`);

// Update a user's profile (name, email, profileImage).
export const updateUserProfile = (id, payload) =>
  request(`/users/profile/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

// Upload profile image (multipart/form-data).
export const uploadUserProfileImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/users/profile/${id}/image`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Image upload failed');
  }

  return response.json();
};

export const registerUser = (payload) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getUsers = () => request('/users');

// Registration OTP flow.
export const requestRegistrationOtp = (payload) =>
  request('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const resendRegistrationOtp = (payload) =>
  request('/users/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const verifyRegistrationOtp = (payload) =>
  request('/users/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

// Order API calls.
export const createOrder = (payload) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getOrders = () => request('/orders');

// Admin auth helpers.
const adminRequest = async (path, options = {}) => {
  const token = localStorage.getItem('adminToken') || '';
  return request(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

// Admin login.
export const adminLogin = (payload) =>
  request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

// Admin dashboard data.
export const getAdminStats = () => adminRequest('/admin/stats');
export const getAdminUsers = () => adminRequest('/admin/users');
export const updateAdminUser = (id, payload) =>
  adminRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteAdminUser = (id) =>
  adminRequest(`/admin/users/${id}`, { method: 'DELETE' });

export const getAdminFoods = () => adminRequest('/admin/foods');
export const createAdminFood = (payload) =>
  adminRequest('/admin/foods', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminFood = (id, payload) =>
  adminRequest(`/admin/foods/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteAdminFood = (id) =>
  adminRequest(`/admin/foods/${id}`, { method: 'DELETE' });

export const getAdminOrders = () => adminRequest('/admin/orders');
export const updateAdminOrderStatus = (id, status) =>
  adminRequest(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
export const updateAdminDeliveryStatus = (id, deliveryStatus) =>
  adminRequest(`/admin/orders/${id}/delivery-status`, {
    method: 'PUT',
    body: JSON.stringify({ deliveryStatus })
  });

// Admin profile.
export const getAdminProfile = () => adminRequest('/admin/profile');
export const updateAdminProfile = (payload) =>
  adminRequest('/admin/profile', { method: 'PUT', body: JSON.stringify(payload) });
