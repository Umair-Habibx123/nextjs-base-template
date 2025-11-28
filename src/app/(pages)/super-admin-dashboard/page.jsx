"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/theme/themeContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ThemeSettingsPage from "./pages/ThemeSettingsPage";
import SystemInfoPage from "./pages/SystemInformationPage";
import AppInfoPage from "./pages/AppInformationPage";
import LanguageManagerPage from "./pages/languageManagerPage";
import ProfilePage from "../components/common/dashboard/ProfilePage";
import ContactMessagesPage from "./pages/ContactMessagesPage";
import NewsletterSubscribe from "./pages/NewsletterPage";
import AnnouncementManagerPage from "./pages/AnnouncementManagerPage";
import TemplatePage from "./pages/EmailTemplatePage";
import { LogOut, Shield, Settings } from "lucide-react";
import { t } from "i18next";
import Loading from "../components/layout/Loading";
import { SUPER_ADMIN_FEATURES } from "../../config/features";
import BlogManagerPage from "./pages/BlogManagerPage";
import ProjectManagerPage from "./pages/ProjectManagerPage";
import CaseStudiesManagerPage from "./pages/CaseStudiesManagerPage";
import { toast } from "react-toastify";
import SuperAdminRoute from "../components/ProtectedRoute/SuperAdminRoute";
import { useAuth } from "../../context/auth/authContext";
import SettingsPage from "./pages/SettingsPage";
import UserManagerPage from "./pages/UserManagement";

const AdminDashboard = () => {
  const { user, logout , listSessions } = useAuth();
  const { theme, mounted } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const router = useRouter();
  const [activePage, setActivePage] = useState("appinfo");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  const handleLogoutCurrent = async () => {
    const currentSession = sessions.find((session) => session.active);
    const otherSessions = sessions.filter((session) => !session.active);

    try {
      if (otherSessions.length > 0) {
        await revokeSession(currentSession.sessionToken);
        await handleSwitchSession(otherSessions[0].sessionToken);
        router.replace("/");
      } else {
        logout();
        router.replace("/");
      }
    } catch (error) {
      toast.error("Failed to logout:", error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handlePageSelect = (page) => {
    setActivePage(page);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-base-100 to-base-200">
        <Loading fullscreen message="Loading ....." />
      </div>
    );
  }

  const pageTitles = {
    appinfo: "App Dashboard",
    theme: "Theme Settings",
    usermanage: "User Management",
    systeminfo: "System Information",
    langmanage: "Language Manager",
    profile: "Profile Settings",
    contacts: "Contact Messages",
    newsletter: "Newsletter Subscribers",
    announcement: "Announcement Manager",
    emailtemplates: "Email Templates",
    blogs: "Blog Management",
    projects: "Project Management",
    case_studies: "Case Studies Management",
    settings: "Settings",
  };

  return (
    <SuperAdminRoute>
      <div
        data-theme={theme}
        className="h-screen flex bg-linear-to-br from-base-100 to-base-200 transition-all duration-500 overflow-hidden"
      >
        {/* 🌟 Sidebar */}
        <div
          className={`fixed md:relative top-0 left-0 h-full 
        backdrop-blur-xl bg-base-100/80 border-r border-base-300/30 
        shadow-2xl z-50 transition-all duration-300 ease-in-out
        ${
          sidebarOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
        >
          <Sidebar
            user={user}
            onSelectPage={handlePageSelect}
            onLogout={() => setShowLogoutModal(true)}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={!sidebarOpen}
            activePage={activePage}
          />
        </div>

        {/* 📱 Mobile Overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 🎯 Main Content Area */}
        <div
          className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
            sidebarOpen ? "md:ml-0" : "md:ml-0"
          }`}
        >
          {/* 🌟 Enhanced Header */}
          <Header
            user={user}
            onProfileClick={() => setActivePage("profile")}
            onLogoutClick={() => setShowLogoutModal(true)}
            sidebarOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentPage={pageTitles[activePage]}
          />

          {/* 📝 Main Content */}
          <main
            className={`flex-1 p-4 md:p-6 overflow-y-auto 
          bg-linear-to-br from-base-100/80 to-base-200/80 
          shadow-inner transition-all duration-300
          ${sidebarOpen ? "md:ml-0" : "md:ml-0"}`}
          >
            {/* Page Content */}
            <div className="animate-fade-in">
              {SUPER_ADMIN_FEATURES.appinfo && activePage === "appinfo" && (
                <AppInfoPage />
              )}
              {SUPER_ADMIN_FEATURES.theme && activePage === "theme" && (
                <ThemeSettingsPage />
              )}
              {SUPER_ADMIN_FEATURES.systeminfo &&
                activePage === "systeminfo" && <SystemInfoPage />}
              {SUPER_ADMIN_FEATURES.langmanage &&
                activePage === "langmanage" && <LanguageManagerPage />}
              {activePage === "profile" && <ProfilePage />}
              {SUPER_ADMIN_FEATURES.contacts && activePage === "contacts" && (
                <ContactMessagesPage />
              )}
              {SUPER_ADMIN_FEATURES.newsletter &&
                activePage === "newsletter" && <NewsletterSubscribe />}
              {SUPER_ADMIN_FEATURES.announcement &&
                activePage === "announcement" && <AnnouncementManagerPage />}
              {SUPER_ADMIN_FEATURES.emailtemplates &&
                activePage === "emailtemplates" && <TemplatePage />}
              {SUPER_ADMIN_FEATURES.blogs && activePage === "blogs" && (
                <BlogManagerPage />
              )}
              {SUPER_ADMIN_FEATURES.projects && activePage === "projects" && (
                <ProjectManagerPage />
              )}
              {SUPER_ADMIN_FEATURES.case_studies &&
                activePage === "case_studies" && <CaseStudiesManagerPage />}
              {SUPER_ADMIN_FEATURES.settings && activePage === "settings" && (
                <SettingsPage />
              )}
              {SUPER_ADMIN_FEATURES.usermanagement &&
                activePage === "usermanage" && <UserManagerPage />}
            </div>
          </main>
        </div>

        {/* 🚪 Enhanced Logout Modal */}
        {showLogoutModal && (
          <dialog open className="modal modal-open">
            <div className="modal-box rounded-3xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg max-w-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-error/10 text-error">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-error">
                    {t("Confirm Logout")}
                  </h3>
                  <p className="text-base-content/60 text-sm">
                    {t("Secure session termination")}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-warning/5 rounded-2xl border border-warning/20 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-warning mb-1">
                      {t("Security Notice")}
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {t(
                        "Are you sure you want to log out from your account? You'll need to sign in again to access the admin panel."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-action flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn btn-outline btn-lg rounded-xl flex-1 hover:scale-105 transition-transform"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleLogoutCurrent}
                  className="btn btn-error btn-lg rounded-xl flex-1 text-error-content shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <LogOut className="w-5 h-5" />
                  {t("Logout")}
                </button>
              </div>
            </div>

            <form
              method="dialog"
              className="modal-backdrop bg-base-content/50 backdrop-blur-sm transition-all"
            >
              <button onClick={() => setShowLogoutModal(false)}>close</button>
            </form>
          </dialog>
        )}
      </div>
    </SuperAdminRoute>
  );
};

export default AdminDashboard;
