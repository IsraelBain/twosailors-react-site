import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import backgroundImage from "../assets/back2back.jpg";
import CoffeeLiqueurPopup from "../components/CoffeeLiqueurPopup";
import quoteEngine from "../utils/quoteEngine";
import { haversineKm } from "../utils/geo";

const LandingPage = () => {
  const navigate = useNavigate();
  const [barType, setBarType] = useState("");
  const [wantsCocktails, setWantsCocktails] = useState(false);
  const [selectedCocktails, setSelectedCocktails] = useState([]);
  const [placeLatLng, setPlaceLatLng] = useState(null); // { lat, lng }
  const [placeName, setPlaceName] = useState("");       // string shown in input
  const [locationError, setLocationError] = useState("");
  const locationInputRef = useRef(null);
  // no manual session token needed with the Autocomplete widget

  // Cocktail options
  const cocktailOptions = [
    "Margarita",
    "Aperol Spritz",
    "Mojito",
    "Tom Collins",
    "Moscow Mule",
    "Raspberry Collins",
    "Dark and Stormy",
    "Old Fashioned",
    "Espresso Martini",
  ];

  const handleCocktailChange = (cocktail) => {
    setSelectedCocktails((prev) =>
      prev.includes(cocktail)
        ? prev.filter((c) => c !== cocktail)
        : [...prev, cocktail]
    );
  };

  // No-op focus/blur handlers (keep if you want to style the input on focus)
  const handleLocationFocus = () => {};
  const handleLocationBlur = () => {};

  // Lazy-load Google Places if not present and attach autocomplete
  useEffect(() => {
    function initAutocomplete() {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setLocationError("Location services temporarily unavailable. Please try again.");
        return;
      }
      const input = locationInputRef.current;
      if (!input) return;
      
      // Use legacy Autocomplete since it's more widely supported
      const ac = new window.google.maps.places.Autocomplete(input, {
        fields: ["name", "formatted_address", "geometry"],
        types: ["establishment", "geocode"]
      });
      
      ac.addListener("place_changed", () => {
        const p = ac.getPlace();
        if (p && p.geometry && p.geometry.location) {
          const lat = p.geometry.location.lat();
          const lng = p.geometry.location.lng();
          setPlaceLatLng({ lat, lng });
          setPlaceName(p.formatted_address || p.name || "");
          setLocationError("");
        } else {
          setPlaceLatLng(null);
          setLocationError("Please select a suggested location.");
        }
      });
    }

    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLocationError("Location service configuration missing. Please contact support.");
      return;
    }

    // If script already exists, init immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
      return;
    }
    // Otherwise, dynamically load it (idempotent)
    const existing = document.getElementById("google-places-dyn");
    if (existing) {
      existing.addEventListener("load", initAutocomplete);
      existing.addEventListener("error", () => {
        setLocationError("Location services failed to load. Please check your connection.");
      });
      return () => {
        existing.removeEventListener("load", initAutocomplete);
        existing.removeEventListener("error", () => {});
      };
    }
    const script = document.createElement("script");
    script.id = "google-places-dyn";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    script.addEventListener("load", initAutocomplete);
    script.addEventListener("error", () => {
      setLocationError("Location services failed to load. Please check your connection.");
    });
    document.body.appendChild(script);
    return () => {
      script.removeEventListener("load", initAutocomplete);
      script.removeEventListener("error", () => {});
    };
  }, []); // don't re-run on every keystroke

  // Create-or-update hidden inputs (prevents duplicates)
  const setHidden = (form, name, value) => {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.setAttribute("data-injected", "true");
      form.appendChild(input);
    }
    input.value = typeof value === "string" ? value : JSON.stringify(value);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Require a selected suggestion with geometry
    if (!placeLatLng) {
      setLocationError("Please select a suggested location from the list.");
      locationInputRef.current?.focus();
      return;
    }


    // Hours = number only; engine adds +2 (setup/teardown)
    const barServiceHoursNum = Number(form.barServiceHours.value || 0);

    // Auto-derive crowd type (no UI selector)
    const derivedCrowdType =
      form.barType.value === "Open Bar"
        ? wantsCocktails
          ? "heavy_cocktail"
          : "wedding_40_35_25"
        : "cash_bar";

    // Compute one-way km from South End Halifax to selected place
    const ORIGIN = { lat: 44.6366, lng: -63.5859 }; // South End Halifax
    const kmOneWay = Math.round(haversineKm(ORIGIN.lat, ORIGIN.lng, placeLatLng.lat, placeLatLng.lng) * 10) / 10;

    // Build the payload from visible inputs (don’t inject duplicates for these)
    const formDataObj = {
      name: form.name.value,
      email: form.email.value,
      date: form.date.value,
      occasion: form.occasion.value,
      barServiceHours: barServiceHoursNum,
      liquorProvider: form.liquorProvider.value,
      guests: Number(form.guests.value || 0),
      location: placeName || (locationInputRef.current?.value || ""),
      budget: form.budget.value,
      barType: form.barType.value,
      spirits: form.spirits.value,
      beerWine: form.beerWine.value,
      cupPreference: form.cupPreference.value,
      specialRequests: form.specialRequests.value,
      referralSource: form.referralSource.value,

      // New fields / derived
      wantsCocktails,
      cocktails: selectedCocktails,
      drinksPerGuest: 6,
      crowdType: derivedCrowdType,
      km: kmOneWay,
    };

    // Run the quote engine
    const quote = quoteEngine(formDataObj);

    setHidden(form, "bookingFee", quote.bookingFee);
    setHidden(form, "insuranceFee", quote.insuranceFee);
    setHidden(form, "travelFee", quote.travelFee);
    setHidden(form, "nonProductSubtotal", quote.nonProductSubtotal);

    // NEW product split
    setHidden(form, "productAlcoholPreTax", quote.productAlcoholPreTax);
    setHidden(form, "productNonAlcoholPreTax", quote.productNonAlcoholPreTax);

    // NEW grand total + polished blocks
    setHidden(form, "grandTotal", quote.grandTotal);
    setHidden(form, "costBreakdownHTML", quote.costBreakdownHTML);
    setHidden(form, "clientQuoteHTML", quote.clientQuoteHTML);

    // Inject ONLY computed/internal fields (no duplicates of visible ones)
    setHidden(form, "cocktails", (formDataObj.cocktails || []).join(", "));
    setHidden(form, "laborCost", quote.laborCost);
    setHidden(form, "prepCost", quote.prepCost);
    setHidden(form, "fees", quote.fees);
    setHidden(form, "totalCost", quote.totalCost);

    setHidden(form, "costTableHTML", quote.costTableHTML);
    setHidden(form, "shoppingListHTML", quote.shoppingListHTML);
    setHidden(form, "ordersBySupplierHTML", quote.ordersBySupplierHTML);
    setHidden(form, "quoteDetails", quote.quoteDetails);

    // Optional product costing (safe if your EmailJS template doesn't use them)
    setHidden(form, "productCostPreTax", quote.productCostPreTax);
    setHidden(form, "productTax", quote.productTax);
    setHidden(form, "productTotal", quote.productTotal);
    setHidden(form, "productCostHTML", quote.productCostHTML);

    // Debug helpers
    setHidden(form, "wantsCocktails", wantsCocktails ? "Yes" : "No");
    setHidden(form, "crowdType", formDataObj.crowdType);
    setHidden(form, "drinksPerGuest", String(formDataObj.drinksPerGuest));
    setHidden(form, "generatorVersion", "LandingPage v2.5 / Engine v2.4.1");
    setHidden(form, "km", String(kmOneWay));
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("[TwoSailors] LandingPage v2.5 submit", formDataObj);
    }

    try {
      await emailjs.sendForm(
        "service_ds9yha8",
        "template_7rzxizn", // your internal template
        form,
        "8rp67ph2Lbxxkvc5a"
      );
      navigate("/thank-you");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] text-gray-900 font-sans">
      {/* Popup retained */}
      <CoffeeLiqueurPopup />

      <Helmet>
        <title>Two Sailors Bartending | Halifax & Atlantic Canada Bartenders</title>
        <meta
          name="description"
          content="Two Sailors Bartending offers professional bartending services for weddings, parties, and private events across Halifax and Atlantic Canada."
        />
      </Helmet>

      <Navbar />

      {/* Hero with animations */}
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

      {/* Form with animations */}
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
          <label>
            Name:
            <input
              type="text"
              name="name"
              required
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              required
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Event Date:
            <input
              type="date"
              name="date"
              required
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Occasion:
            <input
              type="text"
              name="occasion"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          {/* HOURS = NUMBER ONLY (engine adds +2 hrs) */}
          <label>
            Hours of Bar Service:
            <input
              type="number"
              name="barServiceHours"
              placeholder="e.g. 8"
              min="1"
              step="0.5"
              className="w-full p-3 border mt-2 rounded-md"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              We add 1 hour setup + 1 hour teardown automatically.
            </div>
          </label>

          {/* Liquor Provider */}
          <label>
            Liquor Provider:
            <select
              name="liquorProvider"
              required
              className="w-full p-3 border mt-2 rounded-md"
              defaultValue=""
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="Two Sailors">Two Sailors</option>
              <option value="Client Will">Client Will</option>
              <option value="Undecided">Undecided</option>
            </select>
          </label>

          <label>
            Number of Guests:
            <input
              type="number"
              name="guests"
              required
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Location:
            <input
              type="text"
              name="location"
              ref={locationInputRef}
              value={placeName}
              onFocus={handleLocationFocus}
              onBlur={handleLocationBlur}
              onChange={(e) => { setPlaceName(e.target.value); setPlaceLatLng(null); }}
              placeholder="Start typing address/venue…"
              className="w-full p-3 border mt-2 rounded-md"
              autoComplete="off"
              required
            />
            {locationError && (
              <div className="text-xs text-red-600 mt-1">{locationError}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Travel fee uses one-way distance from South End Halifax.
            </div>
          </label>

          <label>
            Budget:
            <input
              type="text"
              name="budget"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Bar Type:
            <div className="text-sm text-gray-500">
              Open means you pay, Cash means guests pay
            </div>
            <div className="flex gap-4 mt-2">
              <label>
                <input
                  type="radio"
                  name="barType"
                  value="Open Bar"
                  required
                  onChange={() => setBarType("Open Bar")}
                />{" "}
                Open Bar
              </label>
              <label>
                <input
                  type="radio"
                  name="barType"
                  value="Cash Bar"
                  required
                  onChange={() => setBarType("Cash Bar")}
                />{" "}
                Cash Bar
              </label>
            </div>
          </label>

          {/* Cocktails toggle */}
          <label>
            Would you like cocktails?
            <div className="flex gap-6 mt-2">
              <label>
                <input
                  type="radio"
                  name="wantsCocktails"
                  value="yes"
                  onChange={() => setWantsCocktails(true)}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="wantsCocktails"
                  value="no"
                  defaultChecked
                  onChange={() => setWantsCocktails(false)}
                />{" "}
                No
              </label>
            </div>
          </label>

          {/* Cocktail list only when Yes */}
          {wantsCocktails && (
            <label>
              Choose your cocktails:
              <div className="mt-2 grid grid-cols-1 gap-2">
                {cocktailOptions.map((cocktail) => (
                  <label key={cocktail} className="flex items-center">
                    <input
                      type="checkbox"
                      value={cocktail}
                      checked={selectedCocktails.includes(cocktail)}
                      onChange={() => handleCocktailChange(cocktail)}
                      className="mr-2"
                    />
                    {cocktail}
                  </label>
                ))}
              </div>
            </label>
          )}

          <label>
            Preferred Spirits/Menu Ideas:
            <input
              type="text"
              name="spirits"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Beer/Wine Offerings:
            <input
              type="text"
              name="beerWine"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Do You Need Cups:
            <input
              type="text"
              name="cupPreference"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Allergies or Special Requests:
            <input
              type="text"
              name="specialRequests"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          <label>
            Heard About Us From:
            <input
              type="text"
              name="referralSource"
              className="w-full p-3 border mt-2 rounded-md"
            />
          </label>

          {/* Computed distance for travel fee (set in JS on submit) */}
          <input type="hidden" name="km" value="" />

          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg mt-4"
          >
            Submit
          </button>
        </motion.form>
      </motion.main>

      <Footer />
    </div>
  );
};

export default LandingPage;
