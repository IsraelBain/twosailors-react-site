import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg"; // Update the path if necessary
import "./Navbar.css"; // Ensure the CSS file for Navbar is correctly imported

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Two Sailors Bartending Logo" className="logo" />
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/blog">Blog</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
