import React from "react";
import "./LandingPage.css";
import logo from "../assets/logo.jpg"; // Import logo
import backgroundImage from "../assets/back2back.jpg"; // Import background image
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const LandingPage = () => {
    const navigate = useNavigate();
    const sendEmail = (e) => {
        e.preventDefault();
        emailjs
          .sendForm(
            "service_ds9yha8", // Your Service ID
            "template_7rzxizn", // Your Template ID
            e.target, // The form element
            "8rp67ph2Lbxxkvc5a" // Your Public Key
          )
          .then(
            (result) => {
              console.log("Email sent successfully:", result.text);
              navigate("/thank-you"); // Redirect to Thank You page
            },
            (error) => {
              console.error("Error sending email:", error.text);
              alert("An error occurred. Please try again later.");
            }
          );
      };
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <img src={logo} alt="Two Sailors Bartending Logo" className="logo" />
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className ="hero-overlay">
          <h1 className="title">Bartending Services in Halifax and Eastern Canada</h1>
          <p className="subtitle">
          We specialize in making your events memorable with our cocktail crafting expertise.
          </p>

        </div>
      </header>

      {/* Form Section */}
      <div className="form-header">
        <h2>Fill out this form to book us today!</h2>
      </div>
      <form className="event-form" onSubmit={sendEmail}>
        <label>
          Name:
          <input type="text" name="name" placeholder="Your Name" required />
        </label>
        <label>
          Email:
          <input type="email" name="email" placeholder="Your Email" required />
        </label>
        <label>
          Event Date:
          <input type="date" name="date" required />
        </label>
        <label>
          Number of Guests:
          <input type="number" name="guests" placeholder="Approximate number of guests" required />
        </label>
        <label>
          Location:
          <input type="text" name="location" placeholder="Event Location" required />
        </label>
        <label>
          Budget:
          <input type="text" name="budget" placeholder="Estimated Budget" />
        </label>
        <label>
          Bar Type:
          <div className="radio-group">
            <span>
              <input type="radio" name="barType" value="Open Bar" required /> Open Bar
            </span>
            <span>
              <input type="radio" name="barType" value="Cash Bar" required /> Cash Bar
            </span>
          </div>
        </label>
        <label>
          Preferred Spirits/Menu Ideas:
          <textarea name="spirits" placeholder="Let us know your preferences!" />
        </label>
        <label>
          Allergies or Special Requests:
          <textarea name="specialRequests" placeholder="Tell us about any special requests or allergies" />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LandingPage;
