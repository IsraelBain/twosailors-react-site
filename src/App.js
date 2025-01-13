import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import ThankYou from "./pages/ThankYou";
import Navbar from "./components/Navbar"; // Import your Navbar component

function App(){
  return(
    <Router>
      {/* Use Navbar component */}
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
