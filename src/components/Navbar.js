import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import tiktokIcon from "../assets/tiktok.png";

const Navbar = () => {
  return (
    <nav className="bg-blue-900 text-white fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-10 py-4 font-sans">
      {/* Left: Social Icons */}
      <div className="flex items-center gap-4">
        <a
          href="https://www.tiktok.com/@twosailorsbartending"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={tiktokIcon} alt="TikTok" className="h-6 w-6" />
        </a>
        <a
          href="https://www.instagram.com/twosailorsbartending/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61554763772561"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
        </a>
      </div>

      {/* Center: Logo */}
      <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
        <img
          src={logo}
          alt="Two Sailors Bartending Logo"
          className="h-16 rounded-lg cursor-pointer"
        />
      </Link>

      {/* Right: Navigation Links */}
      <ul className="flex gap-4 md:gap-6 text-lg font-semibold tracking-wide font-sans">
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
