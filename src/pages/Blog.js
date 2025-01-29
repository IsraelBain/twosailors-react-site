import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Instagram Video Links
const instagramVideos = [
  "https://www.instagram.com/p/DCC4lRsp2Cg/embed",
  "https://www.instagram.com/p/DAEmw1zp8z6/embed",
  "https://www.instagram.com/p/DE8XGF0pd8M/embed",
  "https://www.instagram.com/p/DE3CCiRy2Lu/embed",
  "https://www.instagram.com/p/DBPOLadS0V0/embed",
  "https://www.instagram.com/p/DDKvzPKpBS8/embed",
  "https://www.instagram.com/p/DD4iLeGJHbt/embed",
  "https://www.instagram.com/p/C-_FUJqJ4Mf/embed",
];

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF1E6] text-black"> {/* Cream Background */}
      <Navbar />

      <h1 className="text-4xl font-bold text-center mt-6 font-serif">
        Featured Instagram Posts
      </h1>

      {/* Instagram Video Section */}
      <div className="flex flex-wrap justify-center gap-8 py-8">
        {instagramVideos.map((video, index) => (
          <div key={index} className="w-80 md:w-96 shadow-lg rounded-lg overflow-hidden">
            <iframe
              src={video}
              width="100%"
              height="400"
              className="rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>

      {/* Follow Us on Instagram Button */}
      <div className="flex justify-center py-6">
        <a
          href="https://www.instagram.com/twosailorsbartending/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-900 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all"
        >
          Follow Us on Instagram
        </a>
      </div>

      {/* Footer at Bottom */}
      <Footer />
    </div>
  );
};

export default Blog;
