import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import ThankYou from "./pages/ThankYou";
import HalifaxBartender from "./pages/HalifaxBartender";
import WeddingBartenderHalifax from "./pages/WeddingBartenderHalifax";
import MobileBartending from "./pages/MobileBartending";
import Navbar from "./components/Navbar"; 

function App(){
  return(
    <Router>
      <ScrollToTop />
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/thank-you" element={<ThankYou />} />
        {/* SEO Landing Pages */}
        <Route path="/halifax-bartender" element={<HalifaxBartender />} />
        <Route path="/wedding-bartender-halifax" element={<WeddingBartenderHalifax />} />
        <Route path="/mobile-bartending" element={<MobileBartending />} />
      </Routes>
    </Router>
  );
};

export default App;
