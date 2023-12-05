import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css'; // Make sure to create and import the corresponding CSS file
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
    
    const navigate = useNavigate(); // Initialize navigate


    const handleLogout = () => {
        navigate('/');

    };

    return (
        <div className="privacy-policy-container">
            <h3>HeroFinderPlus Security and Privacy Policy</h3>
            
            <section className="policy-section">
                <h3>Introduction</h3>
                <p>HeroFinderPlus is committed to protecting the security and privacy of all users. This policy outlines our practices regarding the collection, use, and protection of personal information.</p>
            </section>

            <section className="policy-section">
                <h3>Information Collection</h3>
                <ul>
                    <li>We collect information such as email addresses, nicknames, and encrypted passwords during the account creation process.</li>
                    <li>Usage data such as search queries and list interactions may be collected for improving user experience.</li>
                </ul>
            </section>

            <section className="policy-section">
                <h3>Use of Information</h3>
                <ul>
                    <li>The information collected is used for account setup, authentication, and application personalization.</li>
                    <li>We may use the email addresses for communication purposes, such as password recovery and important application updates.</li>
                </ul>
            </section>

            <section className="policy-section">
                <h3>Data Protection</h3>
                <ul>
                    <li>All personal information is stored securely and is accessed only by authorized personnel.</li>
                    <li>We employ industry-standard encryption and security measures to protect data from unauthorized access.</li>
                </ul>
            </section>

            <section className="policy-section">
                <h3>User Rights</h3>
                <ul>
                    <li>Users have the right to access their personal information, request corrections, or delete their accounts.</li>
                    <li>Users may opt out of non-essential communications.</li>
                </ul>
            </section>

            <section className="policy-section">
                <h3>Updates to Policy</h3>
                <p>HeroFinderPlus reserves the right to update this policy. Users will be notified of any significant changes.</p>
            </section>

            <section className="policy-section">
                <h3>Contact</h3>
                <p>For any questions regarding this policy, please contact our support team.</p>
            </section>

            <section className="policy-section">
                <h3>DMCA and Takedown Policy</h3>
                <p>
                    HeroFinderPlus respects the intellectual property rights of others and expects its users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and provide a process for submitting takedown notices.
                </p>
                <ul>
                    <li>Users or rights holders who believe their content has been infringed may submit a DMCA takedown notice.</li>
                    <li>Upon receiving a valid notice, we will remove or disable access to the allegedly infringing material.</li>
                    <li>We provide a counter-notification process for users who believe their content was wrongly removed due to a mistake or misidentification.</li>
                </ul>
                <p>
                    For more details on the procedure, or to file a notice, please contact our DMCA agent.
                </p>
            </section>

            {/* Remaining Sections... */}

            <button onClick={handleLogout} className="button-blue">Back to Home</button>
        </div>
    );
}

export default PrivacyPolicy;
