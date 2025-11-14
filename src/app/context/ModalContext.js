// context/ModalContext.js
"use client";
import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    themeManagement: { open: false, selectedTheme: null },
    themePreview: { open: false, selectedTheme: null },
    confirmDelete: { open: false, themeToDelete: null }
  });

  const openModal = (modalName, data = {}) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { ...prev[modalName], open: true, ...data }
    }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { ...prev[modalName], open: false }
    }));
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Export as default
export default ModalProvider;

// Keep named export for the hook
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};