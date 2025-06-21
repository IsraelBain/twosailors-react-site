import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const CoffeeLiqueurPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("seenCoffeeModal");
    if (!seen) {
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const closeModal = () => {
    sessionStorage.setItem("seenCoffeeModal", "yes");
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-[#FAF1E6] rounded-xl shadow-xl p-8 max-w-md w-full mx-4 relative text-center"
    >
      <button
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold"
        onClick={closeModal}
        aria-label="Close popup"
      >
        ×
      </button>
      <h2 className="text-2xl font-serif font-bold mb-4 text-gray-900">
        We Launched Our First Product!
      </h2>
      <p className="text-gray-700 mb-6">
        Try our brand-new <strong>Coffee Liqueur</strong> now available online.
      </p>
      <a
        href="https://boatskeg-store.myshopify.com/products/boatskeg-distilling-x-two-sailors-coffee-liqueur-750ml"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-semibold"
      >
        Buy Yours Today
      </a>
    </Modal>
  );
};

export default CoffeeLiqueurPopup;
