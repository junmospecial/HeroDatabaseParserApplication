import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const userId = localStorage.getItem('userId'); // Get user ID from local storage

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('api/users/changePassword', {
        userId,
        currentPassword,
        newPassword
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating password');
    }
  };
  const handleBack = () => {
    navigate('/HeroFinder'); // Navigate back to HeroFinder. Make sure the path is correct as per your routing setup
  };

  return (
    <div>
      <h2>Change Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button type="submit">Update Password</button>
      </form>
      <button onClick={handleBack} className="back-button">Back</button> {/* Add this line for the Back button */}
    </div>
  );
}

export default UpdatePassword;
