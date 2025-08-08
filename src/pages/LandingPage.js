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

  const appendHidden = (form, name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = typeof value === "string" ? value : JSON.stringify(value);
    form.appendChild(input);
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const form = e.target;

    const formDataObj = {
      name: form.name.value,
      email: form.email.value,
      date: form.date.value,
      occasion: form.occasion.value,
      barServiceHours: form.barServiceHours.value,
      liquorProvider: form.liquorProvider.value,
      guests: Number(form.guests.value || 0),
      location: form.location.value,
      budget: form.budget.value,
      barType: form.barType.value,
      spirits: form.spirits.value,
      beerWine: form.beerWine.value,
      cupPreference: form.cupPreference.value,
      specialRequests: form.specialRequests.value,
      referralSource: form.referralSource.value,
      cocktails: selectedCocktails,
      // calculator assumptions
      drinksPerGuest: 3,
      crowdType: "standard_lean_beer",
      km: 0
    };

    const quote = quoteEngine(formDataObj);

    // Make template variables available to EmailJS
    appendHidden(form, "laborCost", quote.laborCost);
    appendHidden(form, "prepCost", quote.prepCost);
    appendHidden(form, "fees", quote.fees);
    appendHidden(form, "totalCost", quote.totalCost);

    appendHidden(form, "cocktails", quote.cocktails);

    // If you keep your {{#each}} loops:
    appendHidden(form, "shoppingList", quote.shoppingList);
    appendHidden(form, "ordersBySupplier", quote.ordersBySupplier);

    // Also include HTML tables (in case you want to render them directly)
    appendHidden(form, "costTableHTML", quote.costTableHTML);
    appendHidden(form, "shoppingListHTML", quote.shoppingListHTML);
    appendHidden(form, "ordersBySupplierHTML", quote.ordersBySupplierHTML);

    // Full JSON for debugging
    appendHidden(form, "quoteDetails", quote.quoteDetails);

    emailjs
      .sendForm(
        "service_ds9yha8",
        "template_7rzxizn",
        form,
        "8rp67ph2Lbxxkvc5a"
      )
      .then(
        () => navigate("/thank-you"),
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
          content="Two Sailors Bartending offers professional bartending services for weddings, parties, and private events across Halifax and Atlantic Canada."
        />
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
            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-serif">
              Bartending Services in Halifax <br /> & Atlantic Canada
            </motion.h1>
            <motion.h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-serif mt-4">
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
        >
          <label>Name:
            <input type="text" name="name" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Email:
            <input type="email" name="email" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Event Date:
            <input type="date" name="date" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Occasion:
            <input type="text" name="occasion" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Hours of Bar Service:
            <input type="text" name="barServiceHours" placeholder="e.g. 4PM-12AM" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Liquor Provider:
            <input type="text" name="liquorProvider" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Number of Guests:
            <input type="number" name="guests" required className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Location:
            <input type="text" name="location" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Budget:
            <input type="text" name="budget" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Bar Type:
            <div className="text-sm text-gray-500">Open means you pay, Cash means guests pay</div>
            <div className="flex gap-4 mt-2">
              <label>
                <input type="radio" name="barType" value="Open Bar" required onChange={() => setBarType("Open Bar")} /> Open Bar
              </label>
              <label>
                <input type="radio" name="barType" value="Cash Bar" required onChange={() => setBarType("Cash Bar")} /> Cash Bar
              </label>
            </div>
          </label>

          {barType === "Open Bar" && (
            <label>Preferred Cocktails:
              <div className="mt-2 grid grid-cols-1 gap-2">
                {cocktailOptions.map((cocktail) => (
                  <label key={cocktail} className="flex items-center">
                    <input
                      type="checkbox"
                      value={cocktail}
                      onChange={() => handleCocktailChange(cocktail)}
                      className="mr-2"
                    />
                    {cocktail}
                  </label>
                ))}
              </div>
            </label>
          )}

          <label>Preferred Spirits/Menu Ideas:
            <input type="text" name="spirits" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Beer/Wine Offerings:
            <input type="text" name="beerWine" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Do You Need Cups:
            <input type="text" name="cupPreference" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Allergies or Special Requests:
            <input type="text" name="specialRequests" className="w-full p-3 border mt-2 rounded-md" />
          </label>

          <label>Heard About Us From:
            <input type="text" name="referralSource" className="w-full p-3 border mt-2 rounded-md" />
          </label>

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
