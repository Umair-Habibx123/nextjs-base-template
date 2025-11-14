"use client";

import React from "react";

const SidebarItem = ({ item, isSelected, onClick, children }) => {
  const handleDragStart = (e) => {
    const dragData = {
      type: item.type,
      name: item.name,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`group cursor-grab active:cursor-grabbing transition-all duration-300 rounded-xl border-2 border-dashed 
      ${
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center select-none">
        {children}
      </div>
    </div>
  );
};

export default SidebarItem;
