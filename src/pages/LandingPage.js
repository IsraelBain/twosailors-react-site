import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import backgroundImage from "../assets/back2back.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_ds9yha8",
        "template_7rzxizn",
        e.target,
        "8rp67ph2Lbxxkvc5a"
      )
      .then(
        (result) => {
          console.log("Email sent successfully:", result.text);
          navigate("/thank-you");
        },
        (error) => {
          console.error("Error sending email:", error.text);
          alert("An error occurred. Please try again later.");
        }
      );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] text-gray-900 font-sans">
      <Helmet>
        <title>Two Sailors Bartending | Halifax & Atlantic Canada Bartenders</title>
        <meta
          name="description"
          content="Two Sailors Bartending offers professional bartending services for weddings, parties, and private events across Halifax and Atlantic Canada. Custom cocktails, quality service, unforgettable experiences."
        />
        <meta property="og:title" content="Two Sailors Bartending" />
        <meta
          property="og:description"
          content="Professional event bartending in Halifax and Atlantic Canada. Book expert bartenders for weddings, parties, and private events."
        />
        <meta
          property="og:image"
          content="https://www.twosailorsbartending.ca/social-preview.jpg"
        />
        <meta property="og:url" content="https://www.twosailorsbartending.ca/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.twosailorsbartending.ca/" />
      </Helmet>

      <Navbar />

      <motion.header
        className="relative flex items-center justify-center h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute inset-0 flex justify-center items-center top-[45%]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center w-[90%] max-w-3xl">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-serif leading-tight tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            >
              Bartending Services in Halifax <br /> & Atlantic Canada
            </motion.h1>

            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-300 font-serif mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            >
              Crafting unforgettable cocktails for weddings, parties, and private events.
            </motion.h2>
          </div>
        </motion.div>
      </motion.header>

      <motion.main
        className="flex flex-col items-center justify-center flex-grow py-16 px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-5xl font-semibold text-gray-800 font-serif mb-12">
          Send Us an Inquiry!
        </h2>

        {/* Form Section with Smooth Fade-in & Scale Effect */}
        <motion.form
          className="p-8 bg-white rounded-lg shadow-lg max-w-lg w-11/12 text-left space-y-6"
          onSubmit={sendEmail}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <label className="block text-gray-700 text-lg">
            Name:
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Email:
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Event Date:
            <input
              type="date"
              name="date"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>
          <label className="block text-gray-700 text-lg">
            Occasion:
            <input
              type="text"
              name="occasion"
              placeholder="e.g. Wedding, Corporate Party, etc."
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>
          <label className="block text-gray-700 text-lg">
            Hours of Bar Service:
            <textarea
              name="barServiceHours"
              placeholder="Specify the hours of bar service"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>
          <label className="block text-gray-700 text-lg">
            Who is providing the liquor?
            <select
              name="liquorProvider"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="">Select an option</option>
              <option value="Two Sailors">Two Sailors</option>
              <option value="Client Will">Client Will</option>
              <option value="Undecided">Undecided</option>
            </select>
          </label>

          <label className="block text-gray-700 text-lg">
            Number of Guests:
            <input
              type="number"
              name="guests"
              placeholder="Approximate number of guests"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Location:
            <input
              type="text"
              name="location"
              placeholder="Event Location"
              required
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Budget:
            <input
              type="text"
              name="budget"
              placeholder="Estimated Budget"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Bar Type:
            <div className="text-sm text-gray-500">
              Open means you pay, Cash means guests pay
            </div>
            <div className="flex gap-4 mt-2 items-center">
              <label className="flex items-center">
                <input type="radio" name="barType" value="Open Bar" required className="mr-2" /> Open Bar
              </label>
              <label className="flex items-center">
                <input type="radio" name="barType" value="Cash Bar" required className="mr-2" /> Cash Bar
              </label>
            </div>
          </label>

          <label className="block text-gray-700 text-lg">
            Preferred Spirits/Menu Ideas:
            <textarea
              name="spirits"
              placeholder="Let us know your preferences!"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Beer/Wine Offerings:
            <textarea
              name="beerWine"
              placeholder="Table Wines and Bar Wines needed?"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>
          <label className="block text-gray-700 text-lg">
            Do you need Cups:
            <textarea
              name="specialRequests"
              placeholder="Glass or Plastic?"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <label className="block text-gray-700 text-lg">
            Allergies or Special Requests:
            <textarea
              name="cupPreference"
              placeholder="Tell us about any special requests or allergies"
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>
          <label className="block text-gray-700 text-lg">
            How did you hear about us?
            <input
              type="text"
              name="referralSource"
              placeholder="Instagram, Google, Friend, etc."
              className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-400 transition"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-700 transition-all font-mont tracking-wider uppercase"
          >
            Submit
          </button>
        </motion.form>
      </motion.main>
            {/* Contact Us Section */}
            <motion.section
        className="bg-white py-12 px-6 text-center shadow-inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-4xl font-serif font-semibold text-gray-800 mb-4">Contact Us</h2>
        <p className="text-lg text-gray-600">Email: <a href="mailto:twosailorsco@gmail.com" className="text-blue-600 underline">twosailorsco@gmail.com</a></p>
      </motion.section>

      {/* Footer Section */}



      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default LandingPage;