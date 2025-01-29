import React from "react";

// Import drink images
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";
import comfortcock from "../assets/comfortcock.jpg";
import sirenacock from "../assets/sirenacock.jpeg";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center gap-8 py-6 bg-blue-900">
      {/* Drink Images */}
      {[coldcock, bluecock, applecock, comfortcock, sirenacock].map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Drink ${index + 1}`}
          className="w-20 h-20 rounded-md object-cover shadow-md transition-transform duration-300 hover:scale-110"
        />
      ))}
    </footer>
  );
};

export default Footer;
