"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Home,
  BookOpen,
  Users,
  Mail,
  Sparkles,
  FolderGit2,
  GalleryHorizontal,
  BookOpenCheck,
} from "lucide-react";
import { useAuth } from "../../../context/auth/authContext";
import ThemeApplyButton from "../../admin-dashboard/components/ThemeApplyButton";
import LanguageSwitcher from "../../admin-dashboard/components/LanguageSwitcher";
import AnnouncementBar from "./AnnouncementBar";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > 80) {
            if (currentY > lastScrollY) {
              setHidden(true);
              document.documentElement.style.setProperty(
                "--header-visible",
                "0"
              );
            } else {
              setHidden(false);
              document.documentElement.style.setProperty(
                "--header-visible",
                "1"
              );
            }
          } else {
            setHidden(false);
            document.documentElement.style.setProperty("--header-visible", "1");
          }

          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const rect = document.querySelector("header")?.getBoundingClientRect();
      if (rect) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${rect.height}px`
        );
      }
    };

    // Run initially
    updateHeaderHeight();

    // Re-run when window resizes
    window.addEventListener("resize", updateHeaderHeight);

    // Observe dynamic changes (announcement visibility, DOM mutations)
    const observer = new MutationObserver(updateHeaderHeight);
    const headerEl = document.querySelector("header");
    if (headerEl)
      observer.observe(headerEl, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { href: "/", label: t("Home"), icon: <Home className="w-4 h-4" /> },
    {
      href: "/blogs",
      label: t("Blogs"),
      icon: <GalleryHorizontal className="w-4 h-4" />,
    },
    {
      href: "/projects",
      label: t("Projects"),
      icon: <FolderGit2 className="w-4 h-4" />,
    },
    {
      href: "/case-studies",
      label: t("Case-Studies"),
      icon: <BookOpenCheck className="w-4 h-4" />,
    },
    {
      href: "/about-us",
      label: t("About Us"),
      icon: <Users className="w-4 h-4" />,
    },
    {
      href: "/contact-us",
      label: t("Contact Us"),
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={`w-full border-b border-base-300/30 bg-base-100/80 backdrop-blur-lg shadow-lg z-50 fixed top-0 left-0 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <AnnouncementBar />

      <div className="navbar container mx-auto px-6 justify-between h-20">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost btn-circle lg:hidden hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("Toggle Menu")}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                MyApp
              </h1>
              <p className="text-xs text-base-content/60 hidden sm:block">
                {t("Modern Platform")}
              </p>
            </div>
          </Link>
        </div>

        {/* Middle: Navigation Links (Desktop Only) */}
        <nav className="hidden lg:flex gap-1 font-medium items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-primary text-primary-content shadow-lg scale-105"
                  : "text-base-content/80 hover:text-base-content hover:bg-base-200/50 hover:scale-105"
              }`}
            >
              {link.icon}
              <span className="font-semibold">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Theme + Auth */}
        <div className="flex items-center gap-3">
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <ThemeApplyButton />
              <LanguageSwitcher />
            </div>
          )}

          {!user ? (
            <Link
              href="/login"
              className="btn btn-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {t("Login")}
            </Link>
          ) : (
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="avatar btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
                aria-label={t("User menu")}
              >
                {user.image ? (
                  <div className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden shadow-lg">
                    <img
                      src={user.image}
                      alt={t("Profile picture")}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </button>

              <ul
                tabIndex={0}
                className="menu menu-lg dropdown-content mt-3 right-0 p-4 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-300/30 w-64 z-50 space-y-2"
              >
                <li className="border-b border-base-300/30 pb-3 mb-2">
                  <div className="flex items-center gap-3 p-2">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg shadow-lg">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt="Profile"
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base-content truncate">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-sm text-base-content/60 truncate">
                        {user.role === "admin" || user.role === "superadmin"
                          ? "Administrator"
                          : "User"}
                      </p>
                    </div>
                  </div>
                </li>

                <li className="hidden lg:flex flex-col gap-3 border-b border-base-300/30 pb-3 mb-2">
                  <div className="flex items-center justify-between">
                    <ThemeApplyButton />
                  </div>
                  <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                  </div>
                </li>

                {(user.role === "admin" || user.role === "superadmin") && (
                  <li>
                    <Link
                      href="/admin-dashboard"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/70 transition-all duration-200"
                    >
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <span className="font-medium">
                        {t("Admin Dashboard")}
                      </span>
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-xl text-error hover:bg-error/10 transition-all duration-200 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t("Logout")}</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 🔸 Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-base-100/95 backdrop-blur-xl border-t border-base-300/30 shadow-2xl animate-fadeIn z-40">
          <div className="flex flex-col py-6 space-y-4 px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-primary text-primary-content shadow-lg scale-105"
                    : "text-base-content/80 hover:text-base-content hover:bg-base-200/50 hover:scale-105"
                }`}
              >
                {link.icon}
                <span className="font-semibold text-lg">{link.label}</span>
              </Link>
            ))}

            <div className="flex flex-col gap-4 pt-6 border-t border-base-300/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base-content">
                  {t("Theme")}
                </span>
                <ThemeApplyButton />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base-content">
                  {t("Language")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
