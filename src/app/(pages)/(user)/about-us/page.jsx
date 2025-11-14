"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Target, Heart, Sparkles, Award, Globe } from "lucide-react";

const AboutPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: t("Our Mission"),
      description: t("To create exceptional digital experiences that empower businesses and delight users through innovative technology solutions.")
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t("Our Values"),
      description: t("We believe in transparency, quality, and continuous innovation. Every project is crafted with passion and attention to detail.")
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t("Our Expertise"),
      description: t("Specializing in modern web technologies including Next.js, React, TailwindCSS, and cutting-edge development practices.")
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("Global Reach"),
      description: t("Serving clients worldwide with localized solutions and multi-language support for diverse audiences.")
    }
  ];


  return (
    <main className="min-h-screen bg-linear-to-br from-base-100 to-base-200 py-16">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent mb-4">
            {t("About Our Company")}
          </h1>
          <p className="text-base-content/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t("We're passionate about crafting modern, user-friendly web applications using the latest technologies like Next.js and TailwindCSS. Our team is dedicated to delivering exceptional digital experiences.")}
          </p>
        </section>

        {/* Stats Section */}
      

        {/* Features Section */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6 p-6 bg-base-100 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-base-content mb-2">{feature.title}</h3>
                <p className="text-base-content/70 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="text-center bg-linear-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-base-content mb-3">
            {t("Ready to Start Your Project?")}
          </h2>
          <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
            {t("Let's work together to bring your vision to life with cutting-edge technology and exceptional design.")}
          </p>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;