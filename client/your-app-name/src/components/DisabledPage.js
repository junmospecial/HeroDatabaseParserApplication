import React from 'react';
import { Link } from 'react-router-dom';
import './DisabledPage.css'; // Assuming you have a separate CSS file for styling

function DisabledPage() {
    return (
        <div className="disabled-page-container">
            <h1>Your account is flagged as disabled!</h1>
            <p>Contact the site administrator for help.</p>
            <Link to="/" className="home-link">Return to Home</Link>
        </div>
    );
}

export default DisabledPage;
