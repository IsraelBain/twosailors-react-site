import React from "react";
import { motion } from "framer-motion"; // Import Framer Motion

// Import drink images
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";
import comfortcock from "../assets/comfortcock.jpg";
import sirenacock from "../assets/sirenacock.jpeg";
import bananaRama from "../assets/BananaRama.jpg"; // New image
import strawMoj from "../assets/StrawMoj.JPG"; // New image

const images = [coldcock, bluecock, applecock, comfortcock, sirenacock, bananaRama, strawMoj];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-blue-900 py-6">
      <div className="w-full flex justify-center">
        <motion.div
          className="flex gap-24" // Increased spacing between images
          animate={{ x: ["0%", "-100%"] }} // Moves infinitely from right to left
          transition={{
            repeat: Infinity, // Continuous loop
            repeatType: "loop", // Ensures no sudden glitch
            duration: 25, // Slower speed
            ease: "linear", // Smooth movement
          }}
        >
          {/* Duplicate images to make sure it feels like an infinite loop */}
          {[...images, ...images, ...images].map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Drink ${index + 1}`}
              className="w-24 h-24 rounded-lg object-cover shadow-md"
            />
          ))}
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;