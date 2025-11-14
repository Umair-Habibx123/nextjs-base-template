"use client";

import React from "react";
import { Megaphone, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

const AnnouncementPreview = ({
  theme,
  bg_color,
  text_color,
  speed,
  html,
  css,
  previewText,
}) => {
  const { t } = useTranslation();

  // Function to render scrolling content consistently
  const renderScrollingContent = (direction) => {
    const isRight = direction === "scroll-right";
    const animationName = isRight ? "marquee-right" : "marquee-left";

    return (
      <div className="relative overflow-hidden flex items-center py-3 px-4">
        <Megaphone className="w-4 h-4 mr-3 opacity-90 shrink-0" />
        <div className="relative flex-1 overflow-hidden">
          <div
            className="inline-block whitespace-nowrap text-sm font-medium"
            style={{
              animationName: animationName,
              animationDuration: `${speed || 25}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              paddingRight: isRight ? "0" : "100%",
              paddingLeft: isRight ? "100%" : "0",
            }}
          >
            {/* {previewText || t("No active announcements")} • {previewText || t("No active announcements")} */}
            {previewText || t("No active announcements")}
            {previewText && " • "}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-info/10 text-info">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
            {t("Live Preview")}
          </h2>
          <p className="text-base-content/60 text-sm">
            {t("Real-time announcement bar preview")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-content/70">{t("Theme")}:</span>
          <span className="badge badge-primary badge-sm capitalize">
            {theme}
          </span>
        </div>

        <div
          className="rounded-xl border-2 border-dashed border-base-300/40 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: bg_color,
            color: text_color,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {theme === "custom" && html ? (
            <>
              <div dangerouslySetInnerHTML={{ __html: html }} />
              {css && (
                <style jsx global>
                  {css}
                </style>
              )}
            </>
          ) : theme.includes("scroll") ? (
            <>
              {renderScrollingContent(theme)}
              <style jsx global>{`
                @keyframes marquee-left {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                @keyframes marquee-right {
                  0% {
                    transform: translateX(-50%);
                  }
                  100% {
                    transform: translateX(0);
                  }
                }
              `}</style>
            </>
          ) : (
            <div className="w-full text-center py-4 px-4 font-medium">
              {previewText || t("No preview available")}
            </div>
          )}
        </div>

        {!previewText && (
          <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-warning text-sm">
              {t("Add and activate announcements to see preview")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPreview;
