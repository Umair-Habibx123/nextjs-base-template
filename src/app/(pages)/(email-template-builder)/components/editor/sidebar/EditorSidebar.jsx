"use client";

import React from "react";
import {
  Square,
  Columns,
  Grid3X3,
  Type,
  Image,
  Hash,
  Minus,
  MessageCircle,
  Monitor,
  Smartphone,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const EditorSidebar = ({
  selectedLayout,
  onLayoutSelect,
  selectedDevice,
  onDeviceSelect,
}) => {
  const layouts = [
    { type: "layout", name: "Column", icon: <Square size={20} /> },
    { type: "layout", name: "2 Column", icon: <Columns size={20} /> },
    { type: "layout", name: "3 Column", icon: <Grid3X3 size={20} /> },
    { type: "layout", name: "4 Column", icon: <Grid3X3 size={20} /> },
  ];

  const elements = [
    { type: "element", name: "Button", icon: <Square size={20} /> },
    { type: "element", name: "Text", icon: <Type size={20} /> },
    { type: "element", name: "Image", icon: <Image size={20} /> },
    { type: "element", name: "Divider", icon: <Minus size={20} /> },
    { type: "element", name: "Social Icon", icon: <MessageCircle size={20} /> },
    { type: "element", name: "HTML Block", icon: <Hash size={20} /> },
  ];

  return (
    <>
      <div className="p-4 space-y-8">
        {/* 🌐 Device View Section */}
        <div className="card bg-base-200 shadow-sm border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-medium mb-3 text-base-content/80">
              Device Preview
            </h3>
            <div className="join w-full flex justify-center">
              <button
                onClick={() => onDeviceSelect("Desktop")}
                className={`join-item btn btn-sm flex items-center gap-2 ${
                  selectedDevice === "Desktop" ? "btn-primary" : "btn-outline"
                }`}
              >
                <Monitor size={14} />
                Desktop
              </button>
              <button
                onClick={() => onDeviceSelect("Mobile")}
                className={`join-item btn btn-sm flex items-center gap-2 ${
                  selectedDevice === "Mobile" ? "btn-primary" : "btn-outline"
                }`}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* 🧱 Layouts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base-content">Layouts</h3>
            <span className="badge badge-primary badge-sm">Drag & Drop</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {layouts.map((layout) => (
              <SidebarItem
                key={layout.name}
                item={layout}
                isSelected={selectedLayout === layout.name}
                onClick={() => onLayoutSelect(layout.name)}
              >
                <div className="card card-compact transition-all duration-300 group cursor-pointer">
                  <div className="card-body items-center justify-center p-3 text-center">
                    <div
                      className={`${
                        selectedLayout === layout.name
                          ? "text-primary"
                          : "text-base-content/70 group-hover:text-primary"
                      }`}
                    >
                      {layout.icon}
                    </div>
                    <div className="text-xs font-medium mt-2">
                      {layout.name}
                    </div>
                  </div>
                </div>
              </SidebarItem>
            ))}
          </div>
        </div>

        {/* 🧩 Elements Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base-content">Elements</h3>
            <span className="badge badge-primary badge-sm">Drag & Drop</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {elements.map((element) => (
              <SidebarItem key={element.name} item={element} isSelected={false}>
                <div className="card card-compact transition-all duration-300 group cursor-pointer">
                  <div className="card-body items-center justify-center p-3 text-center">
                    <div className="text-base-content/70 group-hover:text-primary transition-all duration-200">
                      {element.icon}
                    </div>
                    <div className="text-xs font-medium mt-2">
                      {element.name}
                    </div>
                  </div>
                </div>
              </SidebarItem>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorSidebar;
