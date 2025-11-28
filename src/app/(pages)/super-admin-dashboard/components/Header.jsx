"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeApplyButton from "./ThemeApplyButton";
import { Menu, User, LogOut, Settings, UserCog } from "lucide-react";

const Header = ({
  user,
  onProfileClick,
  onLogoutClick,
  sidebarOpen,
  toggleSidebar,
  currentPage = "Dashboard",
}) => {
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-base-100/80 
      border-b border-base-300/30 shadow-lg transition-all duration-300"
    >
      <div className="navbar px-6 flex justify-between items-center h-20">
        {/* 🔹 Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          {!sidebarOpen && (
            <button
              className="btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-105"
              onClick={toggleSidebar}
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5 text-base-content" />
            </button>
          )}

          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-base-content">
                {currentPage}
              </h1>
              <p className="text-sm text-base-content/60">
                {t(
                  `${user.app_role
                    .charAt(0)
                    .toUpperCase()}${user.app_role.slice(1)} Dashboard`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Right Section */}
        <div className="flex items-center gap-3">
          {/* 👤 User Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-base-200/70 cursor-pointer transition-all duration-200 hover:scale-105 border border-base-300/20"
            >
              {/* User Info (Now on the Left) */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-base-content truncate max-w-[120px]">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-base-content/60">
                  {" "}
                  {user.app_role.charAt(0).toUpperCase()}
                  {user.app_role.slice(1)}
                </p>
              </div>

              {/* Avatar (Now on the Right) */}
              <div className="avatar">
                {user?.image ? (
                  <div className="w-10 h-10 rounded-full">
                    <img
                      src={user.image}
                      alt="User Avatar"
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="bg-linear-to-br from-primary to-secondary 
      text-primary-content rounded-full w-10 h-10 flex items-center justify-center 
      font-semibold shadow-lg"
                  >
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* 🔽 Dropdown Menu */}
            <ul
              tabIndex={0}
              className="menu menu-lg dropdown-content mt-3 z-20 p-4 
              bg-base-100/90 backdrop-blur-xl border border-base-300/30 rounded-2xl 
              shadow-2xl w-64 transition-all duration-300"
            >
              {/* User Info */}
              <li className="border-b border-base-300/30 pb-3 mb-2">
                <div className="flex items-center gap-3 p-2">
                  <div className="avatar">
                    {user?.image ? (
                      <div className="w-12 h-12 rounded-full">
                        <img
                          src={user.image}
                          alt="User Avatar"
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-linear-to-br from-primary to-secondary 
      text-primary-content rounded-full w-12 h-12 flex items-center justify-center 
      font-semibold text-lg"
                      >
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base-content truncate">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-sm text-base-content/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </li>

              {/* 🌙 Theme & Language (Always inside dropdown) */}
              <li className="flex flex-col gap-3 py-3 border-b border-base-300/30">
                <div className="flex justify-between items-center">
                  <ThemeApplyButton />
                </div>
                <div className="flex justify-between items-center">
                  <LanguageSwitcher />
                </div>
              </li>

              {/* Menu Items */}
              <li onClick={onProfileClick}>
                <a className="flex items-center gap-3 text-base hover:bg-base-200/70 rounded-xl py-3 transition-all duration-200">
                  <UserCog className="w-5 h-5 text-primary" />
                  <span className="font-medium">{t("Profile Settings")}</span>
                </a>
              </li>

              <li onClick={onLogoutClick}>
                <a className="flex items-center gap-3 text-base text-error hover:bg-error/10 rounded-xl py-3 transition-all duration-200">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t("Logout")}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
