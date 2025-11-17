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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN_FEATURES } from "../../../config/features";

const Sidebar = ({
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
      id: "appinfo",
      label: t("App Dashboard"),
      icon: <Smartphone className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.appinfo,
      description: t("Analytics & metrics"),
    },
    {
      id: "theme",
      label: t("Theme Settings"),
      icon: <Palette className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.theme,
      description: t("Customize appearance"),
    },
    {
      id: "systeminfo",
      label: t("System Information"),
      icon: <Monitor className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.systeminfo,
      description: t("Server status & resources"),
    },
    {
      id: "langmanage",
      label: t("Language Manager"),
      icon: <Globe className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.langmanage,
      description: t("Multilingual content"),
    },
    {
      id: "contacts",
      label: t("Contact Messages"),
      icon: <Inbox className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.contacts,
      description: t("User inquiries"),
    },
    {
      id: "newsletter",
      label: t("Newsletter"),
      icon: <Mail className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.newsletter,
      description: t("Email subscribers"),
    },
    {
      id: "announcement",
      label: t("Announcements"),
      icon: <Megaphone className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.announcement,
      description: t("Site announcements"),
    },
    {
      id: "emailtemplates",
      label: t("Email Templates"),
      icon: <LayoutTemplate className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.emailtemplates,
      description: t("Design emails"),
    },
    {
      id: "blogs",
      label: t("Blog Management"),
      icon: <GalleryHorizontal className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.blogs,
      description: t("Blogs management"),
    },
    {
      id: "projects",
      label: t("Project Management"),
      icon: <FolderGit2 className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.projects,
      description: t("Projects management"),
    },
    {
      id: "case_studies",
      label: t("Case Studies Management"),
      icon: <BookOpenCheck className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.case_studies,
      description: t("Case Studies management"),
    },
    {
      id: "settings",
      label: t("Settings"),
      icon: <Settings className="w-5 h-5" />,
      enabled: ADMIN_FEATURES.settings,
      description: t("Global Settings"),
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
                  Admin Panel
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
