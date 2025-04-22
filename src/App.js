import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import ThankYou from "./pages/ThankYou";
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
      </Routes>
    </Router>
  );
};

export default App;
