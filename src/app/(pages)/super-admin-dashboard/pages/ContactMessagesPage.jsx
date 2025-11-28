"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Loader2,
  Eye,
  Reply,
  Edit,
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "../../components/layout/Loading";
import ReplyEditorModal from "../components/contact-messages/ReplyEditorModal";

const ContactMessagesPage = () => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [replies, setReplies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const res = await fetch("/api/super-admin/contact-us");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Failed to load messages"));
      setMessages(data);
    } catch (err) {
      toast.error(
        err.message || t("Something went wrong while fetching messages")
      );
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const fetchReplies = async (contactId) => {
    try {
      const res = await fetch(`/api/super-admin/contact-us/reply?contact_id=${contactId}`);
      const data = await res.json();
      if (data.success) setReplies(data.data);
    } catch {
      setReplies([]);
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
    fetchMessages();
    fetchTemplates();
  }, []);

  // Calculate stats
  const stats = {
    totalMessages: messages.length,
    pendingReplies: messages.filter((m) => !m.replied).length,
    repliedMessages: messages.filter((m) => m.replied).length,
    totalTemplates: templates.length,
  };

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Contact Messages")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("View and respond to user contact form submissions.")}
          </p>
        </div>

        <button
          onClick={fetchMessages}
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
              <RefreshCw className="w-5 h-5" />
              {t("Refresh")}
            </>
          )}
        </button>
      </div>

      {/* 📊 Stats Overview with Loading States */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : stats.totalMessages}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Total Messages")}
          </div>
        </div>

        {/* Pending Replies */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : stats.pendingReplies}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Pending Replies")}
          </div>
        </div>

        {/* Replied Messages */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Reply className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : stats.repliedMessages}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Replied")}
          </div>
        </div>

        {/* Templates */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-info" />
            <div className="text-2xl font-bold text-info">
              {statsLoading ? "..." : stats.totalTemplates}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Templates")}
          </div>
        </div>
      </div>

      {/* 📋 Messages Table */}
      {loading ? (
        <Loading message={t("Fetching data...")} />
      ) : messages.length === 0 ? (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-16 text-center">
          <Mail className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-base-content/60 mb-2">
            {t("No contact messages yet")}
          </h3>
          <p className="text-base-content/50">
            {t("Contact form submissions will appear here")}
          </p>
        </div>
      ) : (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/80 border-b border-base-300/30">
                <tr className="text-base font-semibold text-base-content">
                  <th className="bg-base-300/30 py-4 rounded-tl-2xl">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t("Contact")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("Email")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {t("Message")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("Date")}
                    </div>
                  </th>
                  <th className="bg-base-300/30 py-4 rounded-tr-2xl text-center">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, index) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-base-200/50 transition-all duration-200 group ${
                      index % 2 === 0 ? "bg-base-100/50" : "bg-base-200/30"
                    }`}
                  >
                    <td className="py-4 border-r border-base-300/20">
                      <div>
                        <div className="font-semibold text-base-content">
                          {msg.name}
                        </div>
                        {!msg.replied && (
                          <span className="badge badge-warning badge-sm mt-1">
                            {t("Pending")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 border-r border-base-300/20">
                      <div className="text-base-content/80 font-medium">
                        {msg.email}
                      </div>
                    </td>
                    <td className="py-4 border-r border-base-300/20">
                      <div className="line-clamp-2 max-w-xs text-base-content/70 leading-relaxed">
                        {msg.message}
                      </div>
                    </td>
                    <td className="py-4 border-r border-base-300/20">
                      <div className="text-sm text-base-content/60">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="btn btn-outline btn-sm rounded-lg hover:btn-info hover:text-info-content transition-all duration-200 transform hover:scale-105 group-hover:shadow-lg"
                          onClick={() => {
                            setSelectedMsg(msg);
                            fetchReplies(msg.id);
                            setViewModal(true);
                          }}
                          title={t("View Details")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-primary btn-sm rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105 group-hover:shadow-lg"
                          onClick={() => {
                            setSelectedMsg(msg);
                            setReplyModal(true);
                          }}
                          title={t("Reply")}
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👁️ View Modal */}
      {viewModal && selectedMsg && (
        <dialog open className="modal modal-open">
          <div className="modal-box rounded-2xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-content">
                    {selectedMsg.name}
                  </h3>
                  <p className="text-base-content/70">{selectedMsg.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-base-content/60">
                  {new Date(selectedMsg.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-base-content/40">
                  {new Date(selectedMsg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/20">
              <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t("Message")}
              </h4>
              <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </p>
            </div>

            {replies.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-base-content flex items-center gap-2">
                  <Reply className="w-4 h-4" />
                  {t("Replies")} ({replies.length})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {replies.map((r) => (
                    <div
                      key={r.id}
                      className="bg-base-200/70 p-4 rounded-xl border border-base-300/30 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-base-content">
                          Subject: {r.subject}
                        </span>
                        <span className="text-xs text-base-content/60 bg-base-300/50 px-2 py-1 rounded">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-base-content/80"
                        dangerouslySetInnerHTML={{ __html: r.body }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-outline rounded-lg flex-1"
                onClick={() => setViewModal(false)}
              >
                {t("Close")}
              </button>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop bg-base-content/50 backdrop-blur-sm"
          >
            <button onClick={() => setViewModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* ✉️ Reply Modal */}
      {replyModal && selectedMsg && (
        <ReplyEditorModal
          selectedMsg={selectedMsg}
          onClose={() => {
            setReplyModal(false);
            setSelectedMsg(null);
          }}
          onReplySuccess={(id) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, replied: 1 } : m))
            );
          }}
        />
      )}
    </section>
  );
};

export default ContactMessagesPage;
