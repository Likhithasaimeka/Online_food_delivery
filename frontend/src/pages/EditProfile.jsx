// Edit Profile page — update name, email, and upload profile image.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, uploadUserProfileImage } from '../services/api';
import '../styles/edit-profile.css';

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (!loggedInUser) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(loggedInUser.id);
        setFormData({
          name: data.name || '',
          email: data.email || ''
        });
        setPreviewUrl(data.profileImage || '');
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if (!loggedInUser) return;

    try {
      await updateUserProfile(loggedInUser.id, formData);

      let uploadedImage = previewUrl;
      if (selectedFile) {
        const uploadResult = await uploadUserProfileImage(loggedInUser.id, selectedFile);
        uploadedImage = uploadResult.profileImage;
      }

      // Update local storage to keep UI in sync.
      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({ ...loggedInUser, ...formData, profileImage: uploadedImage })
      );

      setMessage('Profile updated successfully');
      setTimeout(() => navigate('/profile'), 600);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  if (loading) {
    return (
      <div className="edit-bg">
        <div className="edit-card">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="edit-bg">
      <div className="edit-card">
        <h2>Edit Profile</h2>
        <p className="edit-subtitle">Update your personal details</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
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
          <div className="image-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" />
            ) : (
              <span>No image selected</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit" className="edit-btn">Save Changes</button>
          <button type="button" className="edit-btn ghost" onClick={() => navigate('/profile')}>
            Cancel
          </button>
        </form>
        {message && <p className="edit-message">{message}</p>}
      </div>
    </div>
  );
}

export default EditProfile;
