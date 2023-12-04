import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css'; // Import the CSS file

function MainPage() {
    const title = "HeroFinderPlus".split("").map((char, index) => (
        <span key={index} style={{ '--i': index + 1 }}>{char}</span>
    ));

    return (
        <div className="full-page-background">
            <div className="main-container">
                <h1>
                    <div className="waviy">
                        {title}
                    </div>
                </h1>
                <p className="app-description">
                    <b>Welcome to HeroFinderPlus!</b> <br></br>
                    Where you can find whatever character you can dream of! Create your own favorite lists as well as see and rate other's lists as well!
                </p>
                <p>Choose an option:</p>
                <div className="link-container">
                    <Link className="main-link" to="/signin">Login</Link>
                    <span className="link-separator"> | </span>
                    <Link className="main-link" to="/signup">Sign Up</Link>
                    <p className="no-account-text">Don't want to make an account? No worries try it out</p>
                    <Link className="main-link" to="/unauthusers">Here</Link>
                    <p></p>
                    <Link className="main-link" to="/privacypolicy">View Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}

export default MainPage;