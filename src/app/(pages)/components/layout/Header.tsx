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
  UserPlus,
  RefreshCw,
  ChevronRight,
  Check,
  Plus,
  Shield,
  Building,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../../context/auth/authContext";
import ThemeApplyButton from "../../super-admin-dashboard/components/ThemeApplyButton";
import LanguageSwitcher from "../../super-admin-dashboard/components/LanguageSwitcher";
import AnnouncementBar from "./AnnouncementBar";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, listSessions, setActiveSession, revokeSession, logout } =
    useAuth();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

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

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    const observer = new MutationObserver(updateHeaderHeight);
    const headerEl = document.querySelector("header");
    if (headerEl)
      observer.observe(headerEl, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const init = async () => {
      setSessionsLoading(true);
      try {
        const allSessions = await listSessions();
        if (mounted) setSessions(allSessions);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        if (mounted) setSessionsLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSwitchSession = async (sessionToken: string) => {
    try {
      const success = await setActiveSession(sessionToken);
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to switch session:", error);
    }
  };

  const handleLogoutCurrent = async () => {
    const currentSession = sessions.find((session) => session.active);
    const otherSessions = sessions.filter((session) => !session.active);

    try {
      if (otherSessions.length > 0) {
        await revokeSession(currentSession.sessionToken);
        await handleSwitchSession(otherSessions[0].sessionToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return null;

    if (user.role === "superadmin" && user.app_role === "superadmin") {
      return "/super-admin-dashboard";
    } else {
      return `/dashboard/${user.app_role}`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Shield className="w-4 h-4" />;
      case "admin":
        return <Building className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "from-purple-500 to-pink-500";
      case "admin":
        return "from-blue-500 to-cyan-500";
      case "user":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const dashboardLink = getDashboardLink();

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

  const handleAddAnotherAccount = () => {
    const dropdown = document.activeElement as HTMLElement;
    if (dropdown) dropdown.blur();

    sessionStorage.setItem("multiAccountLogin", "true");
    router.push("/login");
  };

  const hasMultipleAccounts = sessions.length > 1;
  const canAddAnother = sessions.length < 6;

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
            <div className="flex items-center gap-2">
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
                  aria-label={t("Switch accounts")}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>

                <ul
                  tabIndex={0}
                  className="menu menu-lg dropdown-content mt-3 right-0 p-4 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-300/30 w-80 z-50 space-y-2"
                >
                  <li className="border-b border-base-300/30 pb-3 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base-content">
                        Switch Account
                      </span>
                      <span className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded-full">
                        {sessions.length} accounts
                      </span>
                    </div>
                  </li>

                  {/* Accounts List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessions.map((session) => (
                      <li key={session.sessionId}>
                        <div
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                            session.active
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-base-200/70"
                          }`}
                          onClick={() =>
                            !session.active &&
                            handleSwitchSession(session.sessionToken)
                          }
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor(
                              session.userRole
                            )} flex items-center justify-center text-white font-semibold shadow-lg`}
                          >
                            {session.userEmail?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base-content truncate">
                              {session.userEmail?.split("@")[0]}
                            </p>
                            <p className="text-sm text-base-content/60 truncate">
                              {session.userEmail}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {getRoleIcon(session.userRole)}
                              <span className="text-xs text-base-content/50 capitalize">
                                {session.userRole}
                              </span>
                            </div>
                          </div>
                          {session.active ? (
                            <div className="flex items-center gap-1 text-primary">
                              <Check className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                Active
                              </span>
                            </div>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-base-content/60" />
                          )}
                        </div>
                      </li>
                    ))}
                  </div>
                  {canAddAnother && (
                    <li className="border-t border-base-300/30 pt-3 mt-2">
                      <button
                        onClick={handleAddAnotherAccount}
                        className="w-full flex items-center gap-2 p-3 text-info hover:text-info/80 font-medium hover:bg-base-200/50 rounded-xl transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add Another Account
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Main User Dropdown */}
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="avatar btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110 relative"
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

                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-info rounded-full border-2 border-base-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-info-content">
                      {sessions.length}
                    </span>
                  </div>
                </button>

                <ul
                  tabIndex={0}
                  className="menu menu-lg dropdown-content mt-3 right-0 p-4 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-300/30 w-80 z-50 space-y-2"
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
                          {user.role === "superadmin"
                            ? "Super Admin"
                            : user.app_role}
                        </p>
                        {/* {hasMultipleAccounts && ( */}
                        <p className="text-xs text-info mt-1">
                          {sessions.length} accounts active
                        </p>
                        {/*  )} */}
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

                  {dashboardLink && (
                    <li>
                      <Link
                        href={dashboardLink}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/70 transition-all duration-200"
                      >
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span className="font-medium">
                          {user.app_role.charAt(0).toUpperCase()}
                          {user.app_role.slice(1)} Dashboard
                        </span>
                      </Link>
                    </li>
                  )}

                  <li>
                    <button
                      onClick={handleLogoutCurrent}
                      className="flex items-center gap-3 p-3 rounded-xl text-error hover:bg-error/10 transition-all duration-200 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">{t("Logout")}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
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
