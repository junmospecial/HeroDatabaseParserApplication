import React, { useState } from 'react';
import axios from 'axios';
import './SignupForm.css'; // Adjust the path according to your project structure
import './Login.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for the error message
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // Clear any existing error messages

    try {
      const response = await axios.post('api/users/signUp', {
        name,
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if(response.data.status === "PENDING") {
        navigate('/AwaitVerify'); // Redirect to AwaitVerify
      } else if(response.data.status === "FAILED") {
        setErrorMessage(response.data.message || 'Signup failed');
      } else {
        console.log(response.data.message); // Handle success
      }
    } catch (error) {
      setErrorMessage('Error during signup: ' + error.message);
    }
  };

  const navigateToLogin = () => {
    navigate('/signin'); // Update this to the correct path for your Login component
  };

  const navigateBack = () => {
    navigate('/');
  };

  return (
    <div className="login-container"> {/* Use the same container class */}
      <form onSubmit={handleSubmit} className="login-form"> {/* Use the same form class */}
        <h1>Signup</h1>
        {errorMessage && <p className="login-error">{errorMessage}</p>}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Sign Up</button>
        <p className="signup-text">Already have an account? Login here!</p>
        <button onClick={navigateToLogin} className="signup-button">Login</button>
        <button onClick={navigateBack} className="back-button">Back</button>
      </form>
    </div>
  );
}

export default Signup;
