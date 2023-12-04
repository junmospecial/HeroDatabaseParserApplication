import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Login from './components/Login';
import Signup from './components/Signup';
import EmailVerification from './components/EmailVerification';
import HeroFinder from './components/HeroFinder'; // Import the HeroFinder component
import UnauthUsers from './components/UnauthUsers'; // Adjust the path as necessary
import AwaitVerify from './components/AwaitVerify';
import UpdatePassword from './components/updatepassword';
import AdminPage from './components/AdminPage';
import DisabledPage from './components/DisabledPage';
import PrivacyPolicy from './components/PrivacyPolicy';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<Login />} />
        <Route path = "/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/updatepassword" element={<UpdatePassword />} />
        <Route path = "/AdminPage" element={<AdminPage />} />
        <Route path = "/DisabledPage" element={<DisabledPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path = "/awaitVerify" element ={<AwaitVerify />} />
        <Route path = "/unauthusers" element={<UnauthUsers />} />
        <Route path="/herofinder" element={<HeroFinder />} /> {/* Add this line */}
        <Route path="/users/verify/:userId/:uniqueString" element={<EmailVerification />} />
      </Routes>
    </Router>
  );
}

export default App;
