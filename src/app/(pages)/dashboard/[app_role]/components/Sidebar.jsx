"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Palette,
  Monitor,
  Smartphone,
  Globe,
  Mail,
  Megaphone,
  Inbox,
  LayoutTemplate,
  Home,
  X,
  GalleryHorizontal,
  ChevronRight,
  FolderGit2,
  BookOpenCheck,
  Settings,
  User2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SUPER_ADMIN_FEATURES } from "../../../../config/features";

const Sidebar = ({
  user,
  onSelectPage,
  onLogout,
  onClose,
  isCollapsed = false,
  activePage,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePageSelect = (page) => {
    onSelectPage(page);
  };

  const menuItems = [
    {
      id: "overview",
      label: t("Overview"),
      icon: <User className="w-5 h-5" />,
      enabled: SUPER_ADMIN_FEATURES.appinfo,
      description: t("Basic Overview"),
    },
  ];

  return (
    <aside
      className={`h-full flex flex-col backdrop-blur-xl bg-base-100/80 
      border-r border-base-300/30 shadow-2xl transition-all duration-300
      ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b border-base-300/30 ${
          isCollapsed
            ? "flex justify-center"
            : "flex items-center justify-between"
        }`}
      >
        {!isCollapsed ? (
          <>
            <div
              onClick={() => router.replace("/")}
              className="flex items-center gap-3 cursor-pointer hover:bg-base-300/30 px-3 py-2 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base-content text-lg">
                  {user.app_role.charAt(0).toUpperCase()}
                  {user.app_role.slice(1)} Panel
                </h2>
                <p className="text-xs text-base-content/60">
                  Management Console
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
                aria-label="Close Sidebar"
              >
                <X className="w-4 h-4 text-base-content/80" />
              </button>
            )}
          </>
        ) : (
          <div
            onClick={() => router.replace("/")}
            className="p-2 rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg cursor-pointer hover:scale-110 transition-transform"
          >
            <Home className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems
          .filter((item) => item.enabled)
          .map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePageSelect(item.id)}
                className={`flex items-center w-full gap-3 rounded-xl 
                transition-all duration-200 group relative overflow-hidden
                ${
                  isActive
                    ? "bg-linear-to-r from-primary to-primary/80 text-primary-content shadow-lg"
                    : "text-base-content/90 hover:bg-base-300/50 hover:scale-105"
                }
                ${!isActive ? "cursor-pointer" : ""}
                ${isCollapsed ? "justify-center p-3" : "p-3"}`}
              >
                <div
                  className={`${
                    isActive ? "text-primary-content" : "text-base-content/70"
                  } transition-colors`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">
                        {item.label}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? "text-primary-content"
                            : "text-base-content/40"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-current/80 truncate mt-1">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-primary-content rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
