import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg"; // Ensure the path is correct

const Navbar = () => {
  return (
    <nav className="bg-blue-900 text-white fixed top-0 w-full z-50 flex justify-between items-center px-10 py-4 font-sans">

      {/* Clickable Logo */}
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Two Sailors Bartending Logo" className="h-24 w-36 rounded-lg cursor-pointer" />
      </Link>

      {/* Navigation Links */}
      <ul className="nav-links flex gap-6 text-lg font-semibold tracking-wide font-sans">
        <li>
          <Link to="/" className="hover:text-orange-500 text-lg font-sans">
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-orange-500 text-lg font-sans">
            About Us
          </Link>
        </li>
        <li>
          <Link to="/blog" className="hover:text-orange-500 text-lg font-sans">
            Blog
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
