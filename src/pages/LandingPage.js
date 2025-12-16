import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import backgroundImage from "../assets/back2back.jpg";
import CoffeeLiqueurPopup from "../components/CoffeeLiqueurPopup";
import quoteEngine from "../utils/quoteEngine";
import { haversineKm } from "../utils/geo";

// Import team and drink images for gallery
import bothSailors from "../assets/bothSailors.jpg";
import drewpour from "../assets/drewpour.jpg";
import izzypour from "../assets/izzypour.jpg";
import coldcock from "../assets/coldcock.jpg";
import bluecock from "../assets/bluecock.jpg";
import applecock from "../assets/applecock.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  const [barType, setBarType] = useState("");
  const [wantsCocktails, setWantsCocktails] = useState(false);
  const [selectedCocktails, setSelectedCocktails] = useState([]);
  const [placeLatLng, setPlaceLatLng] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [locationError, setLocationError] = useState("");
  const locationInputRef = useRef(null);

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
    "Custom Cocktails",
  ];

  // FAQ state for accordion
  const [openFaq, setOpenFaq] = useState(null);

  // FAQ data
  const faqItems = [
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 4-6 weeks in advance for most events, and 2-3 months for weddings or large gatherings to ensure availability."
    },
    {
      question: "What's the difference between Open Bar and Cash Bar?",
      answer: "With an Open Bar, you (the host) cover all drink costs for your guests. With a Cash Bar, guests pay for their own drinks. We handle all transactions professionally either way."
    },
    {
      question: "Do you provide the alcohol and supplies?",
      answer: "Yes! We can source all alcohol, mixers, garnishes, and supplies from our trusted local suppliers. Alternatively, you can provide your own and we'll just bring our bartending expertise."
    },
    {
      question: "How many bartenders do I need for my event?",
      answer: "We typically recommend 1 bartender per 50-60 guests for efficient service. For cocktail-heavy events, we may suggest additional staff."
    },
    {
      question: "What areas do you serve?",
      answer: "We serve Halifax and can travel anywhere in Nova Scotia and New Brunswick. Travel fees apply for events outside the Halifax Regional Municipality based on distance."
    },
    {
      question: "Can you create custom cocktails for my event?",
      answer: "Absolutely! We love crafting signature cocktails tailored to your event theme, preferences, or even a special occasion. Just let us know your ideas!"
    },
    {
      question: "What happens if I need to cancel or reschedule?",
      answer: "We understand plans change. Please contact us as soon as possible. Cancellation policies vary based on timing, and we'll work with you to reschedule if possible."
    },
    {
      question: "Do you have liability insurance?",
      answer: "Yes, we carry full liability insurance for all events. The insurance fee is included in our quote to ensure you and your guests are protected."
    }
  ];

  // Testimonials from Google Reviews - All 5-star ratings
  const testimonials = [
    {
      name: "Casey",
      year: "2025",
      event: "Wedding",
      rating: 5,
      text: "BEST. BARTENDERS. EVER. The drinks and service from Two Sailors were truly one of the highlights of our wedding day! From the quality and creativity of their cocktails, to the stunning presentation, everything was outstanding. Drew and Cam's energy was contagious — organized, attentive, and professional from start to finish!"
    },
    {
      name: "Sam",
      year: "2025",
      event: "Wedding",
      rating: 5,
      text: "Cannot recommend these guys more highly. Fast, efficient, friendly, and made mean cocktails, including two signature cocktails concocted specifically for the occasion. The bar was busy all night but they never lost their cool. 10/10 service — you cannot go wrong hiring Two Sailors!"
    },
    {
      name: "Trevor",
      year: "2025",
      event: "Event",
      rating: 5,
      text: "Two Sailors is one of the most genuine, talented, and fun wedding bartending groups. Affordable pricing, awesome vibes, and delicious drinks! Very professional and talented gents!"
    },
    {
      name: "Michael",
      year: "2025",
      event: "Wedding",
      rating: 5,
      text: "I would highly recommend them! Quick to respond, provided help and recommendations for alcohol count, and arrived hassle-free. The espresso martini was a fan fav. Both Cam and Drew were a highlight amongst our guests. They went above and beyond!"
    },
    {
      name: "Niva",
      year: "2024",
      event: "Wedding",
      rating: 5,
      text: "Highly recommend - they know how to bring the energy and make phenomenal drinks!"
    },
    {
      name: "Coltin",
      year: "2025",
      event: "Event",
      rating: 5,
      text: "The Two Sailors team bring a great energy and professionalism to every event. Great guys, and very talented bartenders!"
    }
  ];

  // Service packages
  const packages = [
    {
      name: "Essential",
      description: "Perfect for intimate gatherings",
      features: ["Professional bartender", "Basic bar setup", "Classic cocktails", "3-hour minimum"],
      popular: false
    },
    {
      name: "Premium",
      description: "Our most popular option",
      features: ["2 professional bartenders", "Full bar setup & teardown", "Signature cocktails menu", "Mixers & garnishes included", "Glassware rental"],
      popular: true
    },
    {
      name: "Luxe",
      description: "The ultimate experience",
      features: ["Full bartending team", "Complete bar service", "Custom cocktail creation", "Premium spirits selection", "Full event coordination", "Unlimited guests"],
      popular: false
    }
  ];

  const handleCocktailChange = (cocktail) => {
    setSelectedCocktails((prev) =>
      prev.includes(cocktail)
        ? prev.filter((c) => c !== cocktail)
        : [...prev, cocktail]
    );
  };

  // Load Google Maps and initialize autocomplete
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }

        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!key) {
          setLocationError("Location service configuration missing. Please contact support.");
          reject(new Error("Missing API key"));
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
          setLocationError("Location services failed to load. Please check your connection.");
          reject(new Error("Failed to load Google Maps"));
        };
        document.head.appendChild(script);
      });
    };

    const initAutocomplete = () => {
      const input = locationInputRef.current;
      if (!input || !window.google || !window.google.maps || !window.google.maps.places) {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["name", "formatted_address", "geometry"],
        types: ["establishment", "geocode"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setPlaceLatLng({ lat, lng });
          setPlaceName(place.formatted_address || place.name || "");
          setLocationError("");
        } else {
          setPlaceLatLng(null);
          setLocationError("Please select a suggested location.");
        }
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        initAutocomplete();
        setLocationError("");
      })
      .catch((error) => {
        console.error("Google Maps loading error:", error);
      });
  }, []);

  // Create-or-update hidden inputs
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

    const placesAvailable = !!window.google?.maps?.places;
    if (placesAvailable && !placeLatLng) {
      setLocationError("Please select a suggested location from the list.");
      locationInputRef.current?.focus();
      return;
    }

    const barServiceHoursNum = Number(form.barServiceHours.value || 0);
    const derivedCrowdType =
      form.barType.value === "Open Bar"
        ? wantsCocktails
          ? "heavy_cocktail"
          : "wedding_40_35_25"
        : "cash_bar";

    const ORIGIN = { lat: 44.6366, lng: -63.5859 };
    const kmOneWay = placeLatLng
      ? Math.round(haversineKm(ORIGIN.lat, ORIGIN.lng, placeLatLng.lat, placeLatLng.lng) * 10) / 10
      : 0;

    const formDataObj = {
      name: form.name.value,
      email: form.email.value,
      date: form.date.value,
      occasion: form.occasion.value,
      barServiceHours: barServiceHoursNum,
      liquorProvider: form.liquorProvider.value,
      guests: Number(form.guests.value || 0),
      location: placeName || "",
      budget: form.budget.value,
      barType: form.barType.value,
      spirits: form.spirits.value,
      beerWine: form.beerWine.value,
      cupPreference: form.cupPreference.value,
      specialRequests: form.specialRequests.value,
      referralSource: form.referralSource.value,
      wantsCocktails,
      cocktails: selectedCocktails,
      drinksPerGuest: 6,
      crowdType: derivedCrowdType,
      km: kmOneWay,
    };

    const quote = quoteEngine(formDataObj);

    setHidden(form, "bookingFee", quote.bookingFee);
    setHidden(form, "insuranceFee", quote.insuranceFee);
    setHidden(form, "travelFee", quote.travelFee);
    setHidden(form, "nonProductSubtotal", quote.nonProductSubtotal);
    setHidden(form, "productAlcoholPreTax", quote.productAlcoholPreTax);
    setHidden(form, "productNonAlcoholPreTax", quote.productNonAlcoholPreTax);
    setHidden(form, "grandTotal", quote.grandTotal);
    setHidden(form, "costBreakdownHTML", quote.costBreakdownHTML);
    setHidden(form, "clientQuoteHTML", quote.clientQuoteHTML);
    setHidden(form, "cocktails", (formDataObj.cocktails || []).join(", "));
    setHidden(form, "laborCost", quote.laborCost);
    setHidden(form, "prepCost", quote.prepCost);
    setHidden(form, "fees", quote.fees);
    setHidden(form, "totalCost", quote.totalCost);
    setHidden(form, "costTableHTML", quote.costTableHTML);
    setHidden(form, "shoppingListHTML", quote.shoppingListHTML);
    setHidden(form, "ordersBySupplierHTML", quote.ordersBySupplierHTML);
    setHidden(form, "quoteDetails", quote.quoteDetails);
    setHidden(form, "productCostPreTax", quote.productCostPreTax);
    setHidden(form, "productTax", quote.productTax);
    setHidden(form, "productTotal", quote.productTotal);
    setHidden(form, "productCostHTML", quote.productCostHTML);
    setHidden(form, "wantsCocktails", wantsCocktails ? "Yes" : "No");
    setHidden(form, "crowdType", formDataObj.crowdType);
    setHidden(form, "drinksPerGuest", String(formDataObj.drinksPerGuest));
    setHidden(form, "generatorVersion", "LandingPage v3.0 / Engine v2.4.1");
    setHidden(form, "km", String(kmOneWay));

    if (process.env.NODE_ENV === 'development') {
      console.log("[TwoSailors] LandingPage v3.0 submit", formDataObj);
    }

    try {
      await emailjs.sendForm(
        "service_ds9yha8",
        "template_7rzxizn",
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
    <div className="flex flex-col min-h-screen bg-cream text-gray-900 font-sans">
      <CoffeeLiqueurPopup />

      <Helmet>
        <title>Two Sailors Bartending | Halifax & Atlantic Canada Bartenders</title>
        <meta
          name="description"
          content="Two Sailors Bartending offers professional bartending services for weddings, parties, and private events across Halifax and Atlantic Canada."
        />
      </Helmet>

      <Navbar />

      {/* Hero Section with Video/Image Background */}
      <motion.header
        className="relative flex items-center justify-center min-h-screen w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-navy-dark/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.h1
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-white font-serif mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Crafting Unforgettable
            <span className="block text-coral">Cocktail Experiences</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Professional bartending services for weddings, parties, and private events
            across Halifax and Atlantic Canada.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <a
              href="#inquiry-form"
              className="bg-coral hover:bg-coral-dark text-white font-mont font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get a Free Quote
            </a>
            <a
              href="#services"
              className="border-2 border-white text-white hover:bg-white hover:text-navy-dark font-mont font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300"
            >
              View Services
            </a>
          </motion.div>
        </div>
      </motion.header>

      {/* Trust Badges Section */}
      <section className="bg-navy-dark py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-6 md:flex md:flex-wrap md:justify-center md:items-center md:gap-16 text-white/90">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Fully Insured</p>
                <p className="text-sm text-gray-400">$2M Liability Coverage</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className="font-semibold text-lg">100+ Events</p>
                <p className="text-sm text-gray-400">Served Successfully</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
              <div>
                <p className="font-semibold text-lg">5-Star Rated</p>
                <p className="text-sm text-gray-400">On Google Reviews</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Serve Right Certified</p>
                <p className="text-sm text-gray-400">Licensed Professionals</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-navy-dark font-serif text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            From inquiry to last call, we make it effortless
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tell Us About Your Event", desc: "Fill out our quick form with your event details, and we'll craft a personalized quote within 24 hours." },
              { step: "2", title: "Plan the Perfect Menu", desc: "We'll collaborate with you to create a menu that matches your vision and wows your guests." },
              { step: "3", title: "Relax & Celebrate", desc: "On event day, we handle everything. You'll feel like a guest at your own party while we pour perfection." }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <span className="text-7xl font-bold text-coral/20 absolute top-4 right-6 font-serif">{item.step}</span>
                <h3 className="text-2xl font-bold text-navy-dark mb-4 font-serif relative z-10">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Packages Section */}
      <section id="services" className="py-20 bg-navy-dark">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white font-serif text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Service Packages
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Tailored solutions for every event size and style
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                className={`relative rounded-2xl p-8 ${pkg.popular ? 'bg-coral text-white scale-105' : 'bg-white text-gray-800'} shadow-xl`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {pkg.popular && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-navy-dark text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold font-serif mb-2">{pkg.name}</h3>
                <p className={`mb-6 ${pkg.popular ? 'text-white/80' : 'text-gray-500'}`}>{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className={`${pkg.popular ? 'text-white' : 'text-coral'} font-bold`}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#inquiry-form"
                  className={`block text-center py-3 rounded-lg font-semibold transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-white text-coral hover:bg-gray-100'
                      : 'bg-navy-dark text-white hover:bg-navy'
                  }`}
                >
                  Get Quote
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-cream-dark overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-navy-dark font-serif text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 text-center mb-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Don't just take our word for it
          </motion.p>
          <motion.div
            className="flex justify-center gap-1 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-coral text-2xl">★</span>
            ))}
            <span className="ml-2 text-gray-600 font-semibold">5.0 on Google</span>
          </motion.div>

          {/* Scrollable testimonials on mobile, grid on desktop */}
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible scrollbar-hide px-2 -mx-2 md:px-0 md:mx-0">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 w-[calc(100vw-4rem)] sm:w-80 md:w-auto bg-white rounded-2xl p-6 shadow-lg snap-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-coral text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-base mb-4 italic leading-relaxed line-clamp-4">"{testimonial.text}"</p>
                <div className="border-t pt-3">
                  <p className="font-semibold text-navy-dark">{testimonial.name}, {testimonial.year}</p>
                  <p className="text-gray-500 text-sm">{testimonial.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-navy">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white font-serif text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Work
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[bothSailors, drewpour, izzypour, coldcock, bluecock, applecock].map((img, i) => (
              <motion.div
                key={i}
                className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-coral/0 group-hover:bg-coral/30 transition-all duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <motion.main
        id="inquiry-form"
        className="flex flex-col items-center justify-center py-20 px-6 bg-cream"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-navy-dark font-serif mb-4 text-center">
          Get Your Free Quote
        </h2>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl">
          Tell us about your event and we'll create a custom proposal within 24 hours
        </p>

        <motion.form
          className="p-8 md:p-10 bg-white rounded-2xl shadow-xl max-w-2xl w-full text-left space-y-6"
          onSubmit={sendEmail}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700 font-medium">Name</span>
              <input
                type="text"
                name="name"
                required
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                placeholder="Your full name"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Email</span>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700 font-medium">Event Date</span>
              <input
                type="date"
                name="date"
                required
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Occasion</span>
              <input
                type="text"
                name="occasion"
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                placeholder="Wedding, Birthday, etc."
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-gray-700 font-medium">Hours of Bar Service</span>
              <input
                type="number"
                name="barServiceHours"
                placeholder="e.g. 8"
                min="1"
                step="0.5"
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                required
              />
              <span className="text-xs text-gray-500 mt-1 block">
                We add 1 hour setup + 1 hour teardown automatically.
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Number of Guests</span>
              <input
                type="number"
                name="guests"
                required
                className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                placeholder="Expected guest count"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700 font-medium">Location</span>
            <input
              type="text"
              name="location"
              ref={locationInputRef}
              value={placeName}
              onChange={(e) => { setPlaceName(e.target.value); setPlaceLatLng(null); }}
              placeholder="Start typing venue or address..."
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              autoComplete="off"
              required
            />
            {locationError && (
              <span className="text-xs text-red-600 mt-1 block">{locationError}</span>
            )}
            <span className="text-xs text-gray-500 mt-1 block">
              Travel fee calculated from South End Halifax.
            </span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Liquor Provider</span>
            <select
              name="liquorProvider"
              required
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              defaultValue=""
            >
              <option value="" disabled>Select an option</option>
              <option value="Two Sailors">Two Sailors (we source everything)</option>
              <option value="Client Will">Client Will Provide</option>
              <option value="Undecided">Undecided</option>
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Budget</span>
            <input
              type="text"
              name="budget"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              placeholder="Optional - helps us tailor recommendations"
            />
          </label>

          <div className="border-t pt-6">
            <span className="text-gray-700 font-medium block mb-4">Bar Type</span>
            <p className="text-sm text-gray-500 mb-3">Open Bar: you pay for all drinks | Cash Bar: guests pay</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="barType"
                  value="Open Bar"
                  required
                  onChange={() => setBarType("Open Bar")}
                  className="w-5 h-5 text-coral focus:ring-coral"
                />
                <span className="font-medium">Open Bar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="barType"
                  value="Cash Bar"
                  required
                  onChange={() => setBarType("Cash Bar")}
                  className="w-5 h-5 text-coral focus:ring-coral"
                />
                <span className="font-medium">Cash Bar</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <span className="text-gray-700 font-medium block mb-4">Would you like cocktails?</span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wantsCocktails"
                  value="yes"
                  onChange={() => setWantsCocktails(true)}
                  className="w-5 h-5 text-coral focus:ring-coral"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wantsCocktails"
                  value="no"
                  defaultChecked
                  onChange={() => setWantsCocktails(false)}
                  className="w-5 h-5 text-coral focus:ring-coral"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <AnimatePresence>
            {wantsCocktails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <label className="block">
                  <span className="text-gray-700 font-medium">Choose your cocktails:</span>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {cocktailOptions.map((cocktail) => (
                      <label
                        key={cocktail}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCocktails.includes(cocktail)
                            ? 'bg-coral/10 border-coral'
                            : 'border-gray-200 hover:border-coral/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={cocktail}
                          checked={selectedCocktails.includes(cocktail)}
                          onChange={() => handleCocktailChange(cocktail)}
                          className="w-4 h-4 text-coral focus:ring-coral rounded"
                        />
                        <span className={cocktail === "Custom Cocktails" ? "font-semibold text-coral" : ""}>
                          {cocktail}
                        </span>
                      </label>
                    ))}
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="block">
            <span className="text-gray-700 font-medium">Preferred Spirits/Custom Cocktail Ideas:</span>
            <input
              type="text"
              name="spirits"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              placeholder="Tell us your preferences..."
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Beer/Wine Offerings:</span>
            <input
              type="text"
              name="beerWine"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              placeholder="Any specific brands or styles?"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Do You Need Cups/Glassware?</span>
            <input
              type="text"
              name="cupPreference"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              placeholder="Plastic, glassware, or venue provides?"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Allergies or Special Requests:</span>
            <textarea
              name="specialRequests"
              rows="3"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all resize-none"
              placeholder="Anything else we should know?"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">How did you hear about us?</span>
            <input
              type="text"
              name="referralSource"
              className="w-full p-3 border border-gray-300 mt-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
              placeholder="Google, Instagram, referral..."
            />
          </label>

          <input type="hidden" name="km" value="" />

          <button
            type="submit"
            className="w-full bg-coral hover:bg-coral-dark text-white font-mont font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg mt-4"
          >
            Submit Inquiry
          </button>
        </motion.form>
      </motion.main>

      {/* FAQ Section */}
      <motion.section
        className="py-20 px-6 bg-cream-dark"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-navy-dark font-serif mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything you need to know about hiring us
          </motion.p>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-navy-dark text-lg">{item.question}</span>
                  <motion.span
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-coral text-2xl flex-shrink-0 ml-4"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-gray-600 text-lg leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <section className="py-20 bg-coral">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white font-serif mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Make Your Event Unforgettable?
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Let's craft something special together. Get your free quote today.
          </motion.p>
          <motion.a
            href="#inquiry-form"
            className="inline-block bg-white text-coral hover:bg-cream font-mont font-semibold px-10 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get Started Now
          </motion.a>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white">
            <span className="text-gray-400">Questions? Reach out:</span>
            <a
              href="mailto:twosailorsco@gmail.com"
              className="flex items-center gap-2 text-white hover:text-coral transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              twosailorsco@gmail.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
