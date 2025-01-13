import React from "react";
import Navbar from "../components/Navbar"; // Import Navbar component
import "./AboutUs.css";
import drew from "../assets/Drew.jpg";
import izzy2 from "../assets/izzy2.jpg";
import izzypour from "../assets/izzypour.jpg";
import izzypfp from "../assets/izzypfp.JPG";
import drewpfp from "../assets/drewpfp.jpg";
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";
import comfortcock from "../assets/comfortcock.jpg";
import sirenacock from "../assets/sirenacock.jpeg";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Navbar */}
      <Navbar />

      {/* Collage Section */}
      <div className="collage">
        <img src={drew} alt="Drew" className="collage-img" />
        <img src={izzy2} alt="Izzy" className="collage-img" />
        <img src={izzypour} alt="Izzy Pouring" className="collage-img" />
      </div>

      {/* About Us Section */}
      <div className="about-us-section">
        <h1>About Us</h1>
        <div className="profiles">
          {/* Profile 1 */}
          <div className="profile">
            <img src={izzypfp} alt="Izzy" className="profile-pic" />
            <h2>Izzy Bain</h2>
            <p>
              Izzy is a passionate bartender with years of experience crafting
              exceptional cocktails. From elegant events to lively parties, Izzy
              ensures every guest leaves with a smile.
            </p>
            <p><strong>Favorite Drink:</strong> Espresso Martini</p>
          </div>

          {/* Profile 2 */}
          <div className="profile">
            <img src={drewpfp} alt="Drew" className="profile-pic" />
            <h2>Drew Sailor</h2>
            <p>
              Drew brings creativity and precision to every drink he makes.
              Known for his innovative twists on classics, Drew keeps the
              energy high and the drinks flowing.
            </p>
            <p><strong>Favorite Drink:</strong> Old Fashioned</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <img src={coldcock} alt="Cold Cocktail" className="footer-drink" />
        <img src={bluecock} alt="Blue Cocktail" className="footer-drink" />
        <img src={applecock} alt="Apple Cocktail" className="footer-drink" />
        <img src={comfortcock} alt="Comfort Cocktail" className="footer-drink" />
        <img src={sirenacock} alt="Sirena Cocktail" className="footer-drink" />
      </footer>
    </div>
  );
};

export default AboutUs;
