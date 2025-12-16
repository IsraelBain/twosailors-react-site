import { motion } from "framer-motion";

// Import wave and drink images
import wateer from "../assets/longestwave.png";
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";
import comfortcock from "../assets/comfortcock.jpg";
import sirenacock from "../assets/sirenacock.jpeg";
import bananaRama from "../assets/BananaRama.jpg";
import strawMoj from "../assets/StrawMoj.JPG";

const images = [coldcock, bluecock, applecock, comfortcock, sirenacock, bananaRama, strawMoj];

const Footer = () => {
  // Match the navy-dark color - lighter with indigo tint
  const waveBottomColor = "#132c4e";

  return (
    <footer className="relative overflow-hidden pt-0 pb-6" style={{ backgroundColor: waveBottomColor }}>

      {/* Wave PNG Divider - with negative margin to overlap and eliminate gaps */}
      <div style={{ backgroundColor: waveBottomColor, marginBottom: "-2px" }}>
        <img
          src={wateer}
          alt="Wave Divider"
          className="w-full h-auto"
          style={{
            display: "block",
            marginBottom: "-1px",
            transform: "translateY(1px)"
          }}
        />
      </div>

      {/* Animated Drink Loop */}
      <div className="w-full flex justify-center" style={{ backgroundColor: waveBottomColor, position: "relative", zIndex: 1 }}>
        <motion.div
          className="flex gap-16 sm:gap-24"
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
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shadow-md"
            />
          ))}
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
