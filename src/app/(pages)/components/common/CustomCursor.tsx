"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type CursorType = "default" | "hover" | "click" | "text" | "link" | "button";

const DaisyUICursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [clicking, setClicking] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only run cursor logic on client side
    if (typeof window === "undefined") return;

    const style = document.createElement("style");
    style.innerHTML = `html, body, * { cursor: none !important; }`;
    document.head.appendChild(style);

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        setCursorType("button");
      } else if (target.tagName === 'A' || target.closest('a')) {
        setCursorType("link");
      } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setCursorType("text");
      } else if (window.getComputedStyle(target).cursor === 'pointer') {
        setCursorType("hover");
      } else {
        setCursorType("default");
      }
    };

    const handleMouseOut = () => setCursorType("default");
    const handleMouseDown = () => setClicking(true);
    const handleMouseUp = () => setClicking(false);
    const handleMouseLeave = () => setHidden(true);
    const handleMouseEnter = () => setHidden(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.head.removeChild(style);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  // Daisy UI theme classes
  const getDaisyUIClasses = () => {
    const baseClasses = {
      default: {
        outer: "border-base-content/30 bg-base-content/10",
        inner: "bg-base-content",
        ripple: "border-base-content/50"
      },
      hover: {
        outer: "border-primary bg-primary/20",
        inner: "bg-primary",
        ripple: "border-primary"
      },
      button: {
        outer: "border-success bg-success/20",
        inner: "bg-success",
        ripple: "border-success"
      },
      link: {
        outer: "border-secondary bg-secondary/20",
        inner: "bg-secondary",
        ripple: "border-secondary"
      },
      text: {
        outer: "border-accent bg-accent/20",
        inner: "bg-accent",
        ripple: "border-accent"
      },
      click: {
        outer: "border-info bg-info/30",
        inner: "bg-info",
        ripple: "border-info"
      }
    };

    return baseClasses[cursorType] || baseClasses.default;
  };

  const daisyClasses = getDaisyUIClasses();

  // Don't render on server or if not mounted
  if (!mounted || hidden) return null;

  return (
    <>
      {/* Main Cursor Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: clicking ? 0.9 : cursorType !== "default" ? 1.3 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
      >
        <div className={`w-10 h-10 rounded-full border-2 backdrop-blur-md transition-all duration-200 ${daisyClasses.outer}`} />
      </motion.div>

      {/* Center Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: clicking ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
      >
        <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${daisyClasses.inner}`} />
      </motion.div>

      {/* Hover Pulse Effect */}
      {cursorType !== "default" && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998] hidden md:block"
          animate={{
            x: position.x - 16,
            y: position.y - 16,
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className={`w-8 h-8 rounded-full border ${daisyClasses.outer.replace('bg-', 'bg-opacity-10')}`} />
        </motion.div>
      )}

      {/* Click Animation */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997] hidden md:block"
        initial={false}
        animate={clicking ? { scale: 2.5, opacity: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          x: position.x - 12,
          y: position.y - 12,
        }}
      >
        <div className={`w-6 h-6 rounded-full border-2 ${daisyClasses.ripple}`} />
      </motion.div>
    </>
  );
};

export default DaisyUICursor;