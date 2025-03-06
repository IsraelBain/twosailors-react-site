import React from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import Navbar from "../components/Navbar"; // Import Navbar
import Footer from "../components/Footer"; // Import new Footer
import drew from "../assets/Drew.jpg";
import izzy2 from "../assets/izzy2.jpg";
import izzypour from "../assets/izzypour.jpg";
import izzypfp from "../assets/izzypfp.JPG";
import drewpfp from "../assets/drewpfp.jpg";
import handsomeDrew from "../assets/HandsomeDrew.JPG"; // Import new image

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] text-blue-900">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 mt-24">
        {/* Collage Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-10 max-w-4xl">
          <motion.img
            src={handsomeDrew}
            alt="Handsome Drew"
            className="w-52 h-52 rounded-lg shadow-lg object-cover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.img
            src={drew}
            alt="Drew"
            className="w-52 h-52 rounded-lg shadow-lg object-cover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          />
          <motion.img
            src={izzy2}
            alt="Izzy"
            className="w-52 h-52 rounded-lg shadow-lg object-cover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
          />
          <motion.img
            src={izzypour}
            alt="Izzy Pouring"
            className="w-52 h-52 rounded-lg shadow-lg object-cover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          />
        </div>

        {/* About Us Section */}
        <div className="text-center max-w-xl mb-7">
          <h1 className="text-6xl font-bold text-gray text-center font-serif leading-tight tracking-wide">About Us</h1>

          <div className="flex flex-wrap justify-center gap-12">
            {/* Profile 1 */}
            <div className="max-w-md text-center bg-white p-6 rounded-lg shadow-md">
              <img src={izzypfp} alt="Izzy" className="w-40 h-40 rounded-full shadow-md object-cover mb-4" />
              <h2 className="text-4xl font-bold text-gray text-center font-serif leading-tight tracking-wide">Israel Bain</h2>
              <p className="text-2xl font-semibold text-gray-800 font-serif">
                Israel is a passionate bartender with years of experience crafting exceptional cocktails.
              </p>
              <p className="mt-2 text-red-500 font-bold">Favorite Drink: Negroni</p>
            </div>

            {/* Profile 2 */}
            <div className="max-w-md text-center bg-white p-6 rounded-lg shadow-md">
              <img src={drewpfp} alt="Drew" className="w-40 h-40 rounded-full shadow-md object-cover mb-4" />
              <h2 className="text-4xl font-bold text-gray text-center font-serif leading-tight tracking-wide">Drew Francis Walsh</h2>
              <p className="text-2xl font-semibold text-gray-800 font-serif">
                Drew brings creativity and precision to every drink he makes.
              </p>
              <p className="mt-2 text-red-500 font-bold">Favorite Drink: Old Fashioned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs;