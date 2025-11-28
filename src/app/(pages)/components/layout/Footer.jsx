"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import NewsletterSubscribe from "./NewsLetter";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Sparkles, Heart, Shield, Zap } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isActive = (path) => pathname === path;

  const footerLinks = [
    { href: "/", label: t("Home") },
    { href: "/about-us", label: t("About Us") },
    { href: "/contact-us", label: t("Contact Us") },
    { href: "/terms-conditions", label: t("Terms & Conditions") },
    { href: "/privacy-policy", label: t("Privacy Policy") },
  ];

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      text: t("Lightning Fast")
    },
    {
      icon: <Shield className="w-5 h-5 text-success" />,
      text: t("Secure & Reliable")
    },
    {
      icon: <Sparkles className="w-5 h-5 text-secondary" />,
      text: t("Modern Design")
    }
  ];

  
  return (
    <>
      <footer className="bg-linear-to-br from-base-100 to-base-200 border-t border-base-300/30 mt-20 shadow-inner">
        <div className="container mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
          {/* Brand section */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                MyApp
              </h2>
            </div>
            <p className="text-base-content/70 text-lg leading-relaxed max-w-md">
              {t("A modern web experience built with Next.js, TailwindCSS, and DaisyUI. Delivering exceptional performance and user experience.")}
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-base-200/50 px-3 py-2 rounded-xl border border-base-300/20">
                  {feature.icon}
                  <span className="text-sm font-medium text-base-content/80">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-base-content flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t("Quick Links")}
            </h3>
            <ul className="space-y-3 text-base-content/70">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-all duration-200 flex items-center gap-2 py-2 ${
                      isActive(link.href)
                        ? "text-primary font-semibold transform translate-x-2"
                        : "hover:text-primary hover:transform hover:translate-x-2"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <NewsletterSubscribe />
        </div>

        {/* Copyright */}
        <div className="border-t border-base-300/30 py-6">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span>© {new Date().getFullYear()} MyApp. {t("All rights reserved.")}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                {t("Made with")} <Heart className="w-4 h-4 text-error fill-current" /> {t("by our team")}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-base-content/60 hover:text-primary transition-colors"
              >
                {t("Privacy Policy")}
              </Link>
              <Link
                href="/terms-conditions"
                className="text-base-content/60 hover:text-primary transition-colors"
              >
                {t("Terms & Conditions")}
              </Link>
              <Link
                href="/cookies-policy"
                className="text-base-content/60 hover:text-primary transition-colors"
              >
                {t("Cookies Policy")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;