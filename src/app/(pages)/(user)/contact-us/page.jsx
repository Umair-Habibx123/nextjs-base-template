"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageCircle,
  Loader2,
} from "lucide-react";
import AuthenticatedRoute from "../../components/ProtectedRoute/AuthenticatedRoute";

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Something went wrong"));

      toast.success(t("Message sent successfully!"));
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err.message || t("Failed to send message."));
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: t("Email Us"),
      detail: "hello@myapp.com",
      description: t("Send us an email anytime"),
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: t("Call Us"),
      detail: "+1 (555) 123-4567",
      description: t("Mon to Fri 9am to 6pm"),
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t("Visit Us"),
      detail: "123 Business Ave",
      description: t("New York, NY 10001"),
    },
  ];

  return (
    <AuthenticatedRoute>
      <main className="min-h-screen bg-linear-to-br from-base-100 to-base-200 py-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <MessageCircle className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent mb-4">
              {t("Get In Touch")}
            </h1>
            <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
              {t(
                "Have questions or want to discuss a project? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
              )}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-base-100 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base-content text-lg mb-1">
                      {info.title}
                    </h3>
                    <p className="text-base-content font-semibold">
                      {info.detail}
                    </p>
                    <p className="text-base-content/60 text-sm">
                      {info.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl rounded-2xl p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-base-content flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {t("Your Name")}
                        </span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder={t("Enter your full name")}
                        value={form.name}
                        onChange={handleChange}
                        className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-base-content flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {t("Your Email")}
                        </span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder={t("Enter your email address")}
                        value={form.email}
                        onChange={handleChange}
                        className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base-content flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {t("Your Message")}
                      </span>
                    </label>
                    <textarea
                      name="message"
                      placeholder={t(
                        "Tell us about your project or inquiry..."
                      )}
                      value={form.message}
                      onChange={handleChange}
                      className="textarea textarea-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 min-h-[150px]"
                      rows={6}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("Sending...")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        {t("Send Message")}
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedRoute>
  );
};

export default ContactPage;
