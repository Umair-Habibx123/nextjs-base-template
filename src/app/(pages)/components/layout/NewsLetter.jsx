"use client";

import React, { useState } from "react";
import { Send, Mail, Bell, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const NewsletterSubscribe = ({
  title,
  description,
  buttonText,
  onSubscribe,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email?.value.trim();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        onSubscribe?.(email);
        toast.success(t("🎉 Successfully subscribed to our newsletter!"));
      } else {
        toast.error(data.message || t("Subscription failed. Please try again."));
      }
    } catch (err) {
      toast.error(t("Something went wrong. Please try again later."));
    } finally {
      setLoading(false);
    }

    e.target.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Bell className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-base-content">
          {title || t("Stay Updated")}
        </h3>
      </div>
      
      <p className="text-base-content/70 text-lg leading-relaxed">
        {description || t("Get the latest updates, news, and exclusive tips straight to your inbox. No spam, ever.")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50" />
          <input
            name="email"
            type="email"
            placeholder={t("Enter your email address")}
            className="input input-bordered w-full pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full flex items-center justify-center gap-3 font-semibold"
        >
          {loading ? (
            <>
              <div className="loading loading-spinner loading-sm"></div>
              {t("Subscribing...")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {buttonText || t("Subscribe Now")}
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-base-content/50 text-center">
        {t("We respect your privacy. Unsubscribe at any time.")}
      </p>
    </div>
  );
};

export default NewsletterSubscribe;