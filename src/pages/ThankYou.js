import React from "react";
import Navbar from "../components/Navbar"; // Import Navbar
import Footer from "../components/Footer"; // Import Footer
import { Link } from "react-router-dom";
import chart from "../assets/chart.jpg"; // Updated image

const ThankYou = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] text-gray-900 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Thank You Section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-32 pb-8">
        <h1 className="text-5xl font-bold font-serif text-blue-900 mb-4 animate-fade-in">
          Thank You for Your Request!
        </h1>
        <p className="text-2xl text-gray-700 mb-6 animate-fade-in">
          We’ve received your details and will get back to you shortly.
        </p>

        <img 
          src={chart} 
          alt="Bartending Chart" 
          className="w-full max-w-md rounded-lg shadow-lg transition-transform transform hover:scale-105"
        />

        {/* Back to Home Button */}
        <Link to="/" className="mt-6 px-6 py-3 bg-blue-900 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition-all">
          Back to Home
        </Link>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ThankYou;
