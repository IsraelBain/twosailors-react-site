import React from "react";
import { motion } from "framer-motion";

// Import wave and drink images
import waater from "../assets/wateer.png";
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";
import comfortcock from "../assets/comfortcock.jpg";
import sirenacock from "../assets/sirenacock.jpeg";
import bananaRama from "../assets/BananaRama.jpg";
import strawMoj from "../assets/StrawMoj.JPG";

const images = [coldcock, bluecock, applecock, comfortcock, sirenacock, bananaRama, strawMoj];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-blue-900 pt-0 pb-6">
      {/* Wave PNG Divider */}
      <img
        src={waater}
        alt="Wave Divider"
        className="w-full h-auto"
        style={{ marginBottom: "-1px" }} // optional for seamless visual edge
      />

      {/* Animated Drink Loop */}
      <div className="w-full flex justify-center">
        <motion.div
          className="flex gap-24"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          }}
        >
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
