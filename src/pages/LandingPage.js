import React, { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import backgroundImage from "../assets/back2back.jpg";
import CoffeeLiqueurPopup from "../components/CoffeeLiqueurPopup";
import quoteEngine from "../utils/quoteEngine";

const LandingPage = () => {
  const navigate = useNavigate();
  const [barType, setBarType] = useState("");
  const [selectedCocktails, setSelectedCocktails] = useState([]);

  const cocktailOptions = [
    "Margarita",
    "Aperol Spritz",
    "Mojito",
    "Tom Collins",
    "Moscow Mule",
    "Raspberry Collins",
    "Dark and Stormy",
    "Old Fashioned",
    "Espresso Martini"
  ];

  const handleCocktailChange = (cocktail) => {
    setSelectedCocktails((prev) =>
      prev.includes(cocktail)
        ? prev.filter((c) => c !== cocktail)
        : [...prev, cocktail]
    );
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const formDataObj = {
      name: e.target.name.value,
      guests: Number(e.target.guests.value),
      barType: e.target.barType.value,
      cocktails: selectedCocktails,
      serviceHours: parseFloat(e.target.barServiceHours.value) || 6,
      drinksPerGuest: 3,
      km: 0 // optional travel distance if you want to capture later
    };

    const quote = quoteEngine(formDataObj);
    console.log("Quote Outputs:", quote);

    // Append clientEmail as hidden field
    const hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = "quoteDetails";
    hiddenField.value = quote.clientEmail;
    e.target.appendChild(hiddenField);

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
      <CoffeeLiqueurPopup />
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

        <motion.form
          className="p-8 bg-white rounded-lg shadow-lg max-w-lg w-11/12 text-left space-y-6"
          onSubmit={sendEmail}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Name */}
          <label className="block text-gray-700 text-lg">
            Name:
            <input type="text" name="name" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Email */}
          <label className="block text-gray-700 text-lg">
            Email:
            <input type="email" name="email" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Date */}
          <label className="block text-gray-700 text-lg">
            Event Date:
            <input type="date" name="date" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Occasion */}
          <label className="block text-gray-700 text-lg">
            Occasion:
            <input type="text" name="occasion" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Service Hours */}
          <label className="block text-gray-700 text-lg">
            Hours of Bar Service:
            <input type="number" name="barServiceHours" placeholder="e.g. 6" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Guests */}
          <label className="block text-gray-700 text-lg">
            Number of Guests:
            <input type="number" name="guests" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          {/* Bar Type */}
          <label className="block text-gray-700 text-lg">
            Bar Type:
            <div className="text-sm text-gray-500">Open means you pay, Cash means guests pay</div>
            <div className="flex gap-4 mt-2 items-center">
              <label>
                <input type="radio" name="barType" value="Open Bar" required onChange={() => setBarType("Open Bar")} /> Open Bar
              </label>
              <label>
                <input type="radio" name="barType" value="Cash Bar" required onChange={() => setBarType("Cash Bar")} /> Cash Bar
              </label>
            </div>
          </label>

          {/* Cocktail Selector */}
          {barType === "Open Bar" && (
            <label className="block text-gray-700 text-lg">
              Select Cocktails (choose at least one):
              <div className="mt-2 grid grid-cols-1 gap-2">
                {cocktailOptions.map((cocktail) => (
                  <label key={cocktail} className="flex items-center">
                    <input
                      type="checkbox"
                      value={cocktail}
                      onChange={() => handleCocktailChange(cocktail)}
                      required={selectedCocktails.length === 0}
                      className="mr-2"
                    />
                    {cocktail}
                  </label>
                ))}
              </div>
            </label>
          )}

          <button type="submit" className="bg-blue-900 text-white px-6 py-3 rounded-lg mt-4">
            Submit
          </button>
        </motion.form>
      </motion.main>

      <Footer />
    </div>
  );
};

export default LandingPage;
