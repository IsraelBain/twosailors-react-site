import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Instagram Video Links - Updated December 2025
const instagramVideos = [
  "https://www.instagram.com/p/DSIopJdka-H/embed",
  "https://www.instagram.com/p/DQ4gHKhD7ot/embed",
  "https://www.instagram.com/p/DQulkJpEQon/embed",
  "https://www.instagram.com/p/DRfezbNkfvi/embed",
  "https://www.instagram.com/p/DRNl2_zEvgl/embed",
  "https://www.instagram.com/p/DQcY2Q6EZEN/embed",
];

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen bg-cream text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 bg-navy-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold font-serif mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Behind the Bar
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Follow our journey crafting cocktails and creating memories across Atlantic Canada
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-coral py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-around text-white text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold">100+</p>
              <p className="text-sm opacity-90">Events</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold">10K+</p>
              <p className="text-sm opacity-90">Cocktails</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold">5.0</p>
              <p className="text-sm opacity-90">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="py-12 px-6 bg-cream flex-grow">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-navy-dark mb-8 text-center">
            Latest from Instagram
          </h2>

          {/* Simple Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instagramVideos.map((url, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <iframe
                  src={url}
                  width="100%"
                  height="450"
                  title={`Instagram post ${index + 1}`}
                  className="w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </motion.div>
            ))}
          </div>

          {/* Instagram Follow Button */}
          <div className="text-center mt-12">
            <a
              href="https://www.instagram.com/twosailorsbartending/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-navy-dark hover:bg-navy text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @twosailorsbartending
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-dark text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Ready for Your Event?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Let us bring the party to you with craft cocktails and professional service.
          </p>
          <a
            href="/"
            className="inline-block bg-coral hover:bg-coral-dark text-white font-semibold px-10 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Get a Free Quote
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
