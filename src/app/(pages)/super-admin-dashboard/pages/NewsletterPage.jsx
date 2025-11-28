"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Loader2,
  Edit,
  Send,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "../../components/layout/Loading";
import ReplyEditorModal from "../components/contact-messages/ReplyEditorModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function NewsletterSubscribers() {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sendModal, setSendModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const res = await fetch("/api/super-admin/newsletter");
      const data = await res.json();
      if (data.success) setSubscribers(data.data);
      else toast.error(data.message || t("Failed to fetch subscribers"));
    } catch {
      toast.error(t("Network error while fetching subscribers"));
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/public/email-templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch {
      toast.error(t("Failed to load templates"));
    }
  };

  useEffect(() => {
    fetchSubs();
    fetchTemplates();
  }, []);

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalSubscribers: subscribers.length,
    newThisMonth: subscribers.filter(
      (s) =>
        new Date(s.createdAt) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    totalTemplates: templates.length,
    filteredCount: filteredSubscribers.length,
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredSubscribers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredSubscribers.map((s) => s.email));
    }
  };

  const toggleEmailSelection = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleDelete = async () => {
    setConfirmLoading(true);
    await deleteSelectedConfirmed();
    setConfirmLoading(false);
    setConfirmOpen(false);
  };

  const deleteSelectedConfirmed = async () => {
    try {
      const res = await fetch("/api/super-admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: selectedEmails }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("Selected subscribers deleted"));
        setSelectedEmails([]);
        fetchSubs();
      } else toast.error(data.message || t("Failed to delete"));
    } catch {
      toast.error(t("Network error while deleting subscribers"));
    }
  };

  const exportSubscribers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Subscribed Date\n" +
      filteredSubscribers
        .map(
          (sub) =>
            `"${sub.email}","${new Date(sub.createdAt).toLocaleDateString()}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("Subscribers exported successfully!"));
  };


  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Users className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Newsletter Subscribers")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Manage and email all newsletter subscribers.")}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {statsLoading
              ? t("Loading...")
              : `${stats.totalSubscribers} ${t("Subscribers")}`}
          </span>
        </div>

        <button
          onClick={() => setSendModal(true)}
          className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
   disabled={loading}
        >
       
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("Refreshing...")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
               {t("Send Newsletter")}

            </>
          )}

        </button>
      </div>

      {/* 📊 Stats Overview with Loading States */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : stats.totalSubscribers}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Total Subscribers")}
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : stats.newThisMonth}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("New This Month")}
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : stats.totalTemplates}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Email Templates")}
          </div>
        </div>

        {/* Filtered Results */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-info" />
            <div className="text-2xl font-bold text-info">
              {statsLoading ? "..." : stats.filteredCount}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Filtered")}
          </div>
        </div>
      </div>

      {/* 🔍 Search and Actions */}
      <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("Search subscribers by email...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50"
              />
              <Filter className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <span className="text-sm text-base-content/60 whitespace-nowrap">
              {stats.filteredCount} {t("results")}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchSubs}
              className="btn btn-outline rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {t("Refresh")}
            </button>
            <button
              onClick={exportSubscribers}
              className="btn btn-success rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
              disabled={filteredSubscribers.length === 0}
            >
              <Download className="w-4 h-4" />
              {t("Export CSV")}
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="btn btn-error rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
              disabled={selectedEmails.length === 0}
            >
              <Edit className="w-4 h-4" />
              {t("Delete Selected")}
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Subscribers Table */}
      {loading ? (
        <Loading message={t("Fetching subscribers...")} />
      ) : filteredSubscribers.length === 0 ? (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-16 text-center">
          <Mail className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content/60 mb-2">
            {searchTerm
              ? t("No matching subscribers found")
              : t("No newsletter subscribers yet")}
          </h3>
          <p className="text-base-content/50">
            {searchTerm
              ? t("Try adjusting your search terms")
              : t("Subscribers will appear here once they sign up")}
          </p>
        </div>
      ) : (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/80 border-b border-base-300/30">
                <tr className="text-base font-semibold text-base-content">
                  <th className="bg-base-300/30 py-4 rounded-tl-2xl">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      onChange={toggleSelectAll}
                      checked={
                        selectedEmails.length > 0 &&
                        selectedEmails.length === filteredSubscribers.length
                      }
                    />
                  </th>

                  <th className="bg-base-300/30 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("Email")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("Subscribed At")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4 rounded-tr-2xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t("Status")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => {
                  const isNew =
                    new Date(subscriber.createdAt) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return (
                    <tr
                      key={subscriber.id}
                      className={`hover:bg-base-200/50 transition-all duration-200 group ${
                        index % 2 === 0 ? "bg-base-100/50" : "bg-base-200/30"
                      }`}
                    >
                      <td className="py-4 border-r border-base-300/20">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedEmails.includes(subscriber.email)}
                          onChange={() =>
                            toggleEmailSelection(subscriber.email)
                          }
                        />
                      </td>

                      <td className="py-4 border-r border-base-300/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-3 h-3 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-base-content">
                              {subscriber.email}
                            </div>
                            <div className="text-xs text-base-content/50">
                              ID: {subscriber.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        <div className="text-sm text-base-content/80">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-base-content/50">
                          {new Date(subscriber.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge badge-sm ${
                              isNew ? "badge-success" : "badge-outline"
                            }`}
                          >
                            {isNew ? t("New") : t("Active")}
                          </span>
                          {isNew && (
                            <span className="badge badge-warning badge-sm animate-pulse">
                              {t("Recent")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📧 Send Newsletter Modal */}
      {sendModal && (
        <ReplyEditorModal
          isNewsletter={true}
          selectedCount={selectedEmails.length || filteredSubscribers.length}
          selectedEmails={selectedEmails}
          onClose={() => setSendModal(false)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete selected subscribers?")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
}