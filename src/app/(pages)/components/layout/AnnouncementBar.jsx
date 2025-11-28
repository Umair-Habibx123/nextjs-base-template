"use client";
import React, { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";

const AnnouncementBar = () => {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ann, set] = await Promise.all([
          fetch("/api/super-admin/announcements", { cache: "no-store" }).then((r) =>
            r.json()
          ),
          fetch("/api/super-admin/announcements/announcement-settings", {
            cache: "no-store",
          }).then((r) => r.json()),
        ]);
        setAnnouncements(ann.data.filter((a) => a.is_active));
        setSettings(set.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  if (!settings || !announcements.length || !visible) return null;

  const { theme, bg_color, text_color, speed, custom_html, custom_css } = settings;

  if (theme === "custom" && custom_html) {
    const announcementTexts = announcements.map((a) => a.text);
    const announcementsJoined = announcementTexts.join(" • ");
    const announcementsList = `<ul>${announcementTexts
      .map((t) => `<li>${t}</li>`)
      .join("")}</ul>`;

    const renderedHTML = custom_html
      .replaceAll("{{announcements}}", announcementsJoined)
      .replaceAll("{{announcementList}}", announcementsList);

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
        {custom_css && (
          <style jsx global>
            {custom_css}
          </style>
        )}
      </>
    );
  }

  const content = announcements.map((a) => a.text).join(" • ");

  // Function to render scrolling content
  const renderScrollingContent = (direction) => {
    const isRight = direction === "scroll-right";
    const animationName = isRight ? "marquee-right" : "marquee-left";
    
    return (
      <div
        className="relative overflow-hidden w-full py-2 px-4 flex items-center"
        style={{ backgroundColor: bg_color, color: text_color }}
      >
        <Megaphone className="w-4 h-4 mr-2 shrink-0 opacity-80" />

        <div className="relative flex-1 overflow-hidden">
          <div
            className="marquee inline-block whitespace-nowrap"
            style={{
              animationName: animationName,
              animationDuration: `${speed || 25}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              paddingRight: isRight ? "0" : "100%",
              paddingLeft: isRight ? "100%" : "0",
            }}
          >
            {/* {content} &nbsp; {content} &nbsp; {content} */}
              {content}
            {content && " • "}
          </div>
        </div>

        <button 
          onClick={() => setVisible(false)} 
          className="ml-2 shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (theme.includes("scroll")) {
    return (
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
          .marquee {
            display: inline-block;
            white-space: nowrap;
          }
        `}</style>
      </>
    );
  }

  // Static theme
  return (
    <div
      className="flex justify-between items-center px-4 py-2 text-sm shadow-sm"
      style={{ backgroundColor: bg_color, color: text_color }}
    >
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4" />
        <span>{content}</span>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBar;