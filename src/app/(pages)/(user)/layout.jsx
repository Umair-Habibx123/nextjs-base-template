"use client";

import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "react-toastify/dist/ReactToastify.css";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-base-100 to-base-200 overflow-x-hidden">
      <Header />

      {/* 🔹 Add padding equal to header height */}
      <main className="flex-1" style={{ paddingTop: "var(--header-height)" }}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;
