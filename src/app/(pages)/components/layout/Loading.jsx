// src/app/(pages)/components/layout/loading.jsx

"use client";
import React from "react";
import { Loader2, Sparkles } from "lucide-react";

const Loading = ({ fullscreen = false, message = "Loading...", size = "md" }) => {
  const sizeClass =
    size === "sm"
      ? "w-5 h-5"
      : size === "lg"
      ? "w-12 h-12"
      : "w-8 h-8";

  const textSizeClass =
    size === "sm"
      ? "text-sm"
      : size === "lg"
      ? "text-lg"
      : "text-base";

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center space-y-4"
    >
      <div className="relative">
        <div className={`${sizeClass} animate-spin rounded-full border-2 border-primary border-t-transparent`}></div>
        <Sparkles className="w-3 h-3 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      {message && (
        <p className={`${textSizeClass} text-center text-base-content/70 font-medium animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200/80 backdrop-blur-sm transition-opacity animate-fade-in">
        <div className="bg-base-100/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-base-300/30 p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
