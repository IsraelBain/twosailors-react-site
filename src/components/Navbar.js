import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import tiktokIcon from "../assets/tiktok.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white fixed top-0 w-full z-50 py-5 md:py-8 font-sans">
      <div className="flex items-center justify-between px-4 md:px-10 relative">
        {/* Left: Social Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          <a href="https://www.tiktok.com/@twosailorsbartending" target="_blank" rel="noopener noreferrer">
            <img src={tiktokIcon} alt="TikTok" className="h-6 w-6 md:h-10 md:w-10" />
          </a>
          <a href="https://www.instagram.com/twosailorsbartending/" target="_blank" rel="noopener noreferrer">
            <img src={instagramIcon} alt="Instagram" className="h-6 w-6 md:h-10 md:w-10" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61554763772561" target="_blank" rel="noopener noreferrer">
            <img src={facebookIcon} alt="Facebook" className="h-6 w-6 md:h-10 md:w-10" />
          </a>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/">
            <img src={logo} alt="Two Sailors Bartending Logo" className="h-12 md:h-20 rounded-lg cursor-pointer" />
          </Link>
        </div>

        {/* Right: Desktop Nav */}
        <ul className="hidden md:flex gap-4 md:gap-6 text-lg font-semibold tracking-wide">
          <li><Link to="/" className="hover:text-orange-500">Home</Link></li>
          <li><Link to="/about" className="hover:text-orange-500">About Us</Link></li>
          <li><Link to="/blog" className="hover:text-orange-500">Blog</Link></li>
        </ul>

        {/* Hamburger Icon on Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="focus:outline-none"
          >
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 px-6 pt-4 pb-4">
          <ul className="flex flex-col space-y-3 text-lg font-semibold">
            <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link></li>
            <li><Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
