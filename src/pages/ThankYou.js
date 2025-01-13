import React from "react";
import "./ThankYou.css";
import logo from "../assets/logo.jpg"; // Import logo
import izzypour from "../assets/izzypour.jpg"; // Import the image

const ThankYou = () => {
  return (
    <div className="thank-you-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <img src={logo} alt="Two Sailors Bartending Logo" className="logo" />
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </nav>

      {/* Thank You Content */}
      <div className="thank-you-content">
        <h1>Thank You for Your Request!</h1>
        <p>We’ve received your details and will get back to you shortly.</p>
        <img src={izzypour} alt="Bartender Pouring Drink" className="thank-you-image" />
      </div>
    </div>
  );
};

export default ThankYou;
