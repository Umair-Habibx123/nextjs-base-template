"use client";

import React, { useState, useEffect } from "react";
import { Type, Image, Hash, Minus } from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";
import { Rnd } from "react-rnd";

function getDefaultContent(type) {
  switch (type) {
    case "Button":
      return "Click Here";
    case "Text":
      return "Enter your text here...";
    case "Image":
      return ""; // Empty for images
    case "Logo":
      return "Logo";
    case "Divider":
      return "";
    case "Social Icon":
      return "Social Media";
    case "HTML Block":
      return '<div style="padding: 16px; background-color: #f5f5f5;">\n  <h3>HTML Block</h3>\n  <p>Edit this HTML content in the settings panel.</p>\n</div>';
    default:
      return "Content";
  }
}

const ElementRenderer = ({
  type,
  id,
  onUpdate,
  onDelete,
  onSelect,
  initialContent,
  fontSize,
  color,
  backgroundColor,
  buttonColor,
  buttonShape,
  buttonUrl,
  imageWidth,
  imageHeight,
  objectFit,
  borderRadius,
  dividerStyle,
  alignment = "left", // Default alignment set to 'left'
  fontStyles = [], // Default to empty array
  fontFamily = "", // Default to empty string
  // Social icon specific props (optional on other types)
  socialIcon = "instagram",
  socialUrl = "",
  socialColor = "#000000",
  socialSize = 24,
  isSelected = false, // Add isSelected prop with default value
  padding = "16px", // Default padding value
  // Individual padding values
  paddingTop = "16",
  paddingRight = "16",
  paddingBottom = "16",
  paddingLeft = "16",
}) => {
  const [localContent, setLocalContent] = useState(
    initialContent !== undefined ? initialContent : getDefaultContent(type)
  );
  const [imageUrl, setImageUrl] = useState(initialContent || null);

  useEffect(() => {
    setLocalContent(
      initialContent !== undefined ? initialContent : getDefaultContent(type)
    );
    if (type === "Image") {
      if (initialContent && initialContent.startsWith("data:image")) {
        setImageUrl(initialContent);
      }
    }
  }, [initialContent, type]);

  const handleContentChange = (newContent) => {
    setLocalContent(newContent);
    if (onUpdate) {
      onUpdate(id, newContent);
    }
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const handleElementClick = (e) => {
    // Stop propagation to prevent column from being selected
    if (e) {
      e.stopPropagation();
    }

    if (onSelect) {
      const elementContent =
        type === "Image"
          ? initialContent || imageUrl || localContent
          : localContent;
      onSelect({
        id,
        name: type,
        content: elementContent,
        fontSize,
        color,
        backgroundColor,
        buttonColor,
        buttonShape,
        buttonUrl, // Make sure this is included
        alignment,
        dividerStyle,
        fontStyles,
        fontFamily,
        socialIcon,
        socialUrl,
        socialColor,
        socialSize,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
      });
    }
  };

  // Determine the alignment class (left, center, or right)
  const alignmentClass =
    alignment === "center"
      ? "flex justify-center"
      : alignment === "right"
      ? "flex justify-end"
      : "flex justify-start";

  const renderElement = () => {
    switch (type) {
      case "Button":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            {buttonUrl ? (
              <a
                href={buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block px-6 py-2 text-white transition-colors ${
                  buttonShape || "rounded-lg"
                } cursor-pointer`}
                style={{ backgroundColor: buttonColor || "#8B5CF6" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick();
                }}
                title={`Click to go to: ${buttonUrl}`}
              >
                {localContent}
              </a>
            ) : (
              <button
                className={`px-6 py-2 text-white transition-colors ${
                  buttonShape || "rounded-lg"
                }`}
                style={{ backgroundColor: buttonColor || "#8B5CF6" }}
                onClick={(e) => handleElementClick(e)}
                title="Click to select button (add URL in settings to make it clickable)"
              >
                {localContent}
              </button>
            )}
          </div>
        );
      case "Text":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <div
              contentEditable
              className="min-h-[60px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer w-full"
              onBlur={(e) => handleContentChange(e.target.textContent)}
              onClick={(e) => handleElementClick(e)}
              onFocus={(e) => {
                if (localContent === getDefaultContent("Text")) {
                  setLocalContent("");
                  e.target.textContent = "";
                }
              }}
              suppressContentEditableWarning={true}
              style={{
                fontSize: fontSize || "16px",
                color: color || "#000000",
                backgroundColor: isSelected
                  ? backgroundColor || "#ffffff"
                  : "transparent",
                textAlign: alignment,
                fontWeight: fontStyles.includes("bold") ? "bold" : "normal",
                fontStyle: fontStyles.includes("italic") ? "italic" : "normal",
                textDecoration: fontStyles.includes("underline")
                  ? "underline"
                  : "none",
                fontFamily: fontFamily || "inherit",
              }}
            >
              {localContent}
            </div>
          </div>
        );

      case "Image":
        const handleImageDrop = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const imageDataUrl = event.target.result;
                setImageUrl(imageDataUrl);
                setLocalContent(imageDataUrl);
                if (onUpdate) {
                  onUpdate(id, imageDataUrl);
                }
              };
              reader.readAsDataURL(file);
            }
          }
        };
        const hasImage =
          (initialContent && initialContent.startsWith("data:image")) ||
          (imageUrl && imageUrl.startsWith("data:image"));
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
            onClick={(e) => handleElementClick(e)}
            tabIndex={0}
            onDrop={handleImageDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {hasImage ? (
              <div
                className={
                  alignment === "center"
                    ? "flex justify-center"
                    : alignment === "right"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <img
                  src={imageUrl || initialContent}
                  alt="Uploaded image"
                  className="rounded-lg"
                  style={{
                    display: "block",
                    backgroundColor: "transparent",
                    width: imageWidth ? `${imageWidth}px` : "100%",
                    height: imageHeight ? `${imageHeight}px` : "auto",
                    objectFit: objectFit || "cover",
                    borderRadius: borderRadius ? `${borderRadius}px` : "8px",
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Image className="w-10 h-10 mb-2" />
                <span className="text-sm">Drop your image here</span>
              </div>
            )}
          </div>
        );

      case "Logo":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="text-center">
                <Hash className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">{localContent}</p>
              </div>
            </div>
          </div>
        );

      case "Divider":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <div className="flex items-center justify-center w-full">
              {dividerStyle === "double-arrow" ? (
                <div className="w-3/4 flex items-center justify-center">
                  <span className="text-2xl">⇔</span>
                </div>
              ) : dividerStyle === "dotted" ? (
                <div className="w-3/4 border-t-2 border-dotted border-gray-400"></div>
              ) : (
                <div className="w-3/4 h-0.5 bg-gray-400"></div>
              )}
            </div>
          </div>
        );

      case "Social Icon":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <div
              className={
                alignment === "center"
                  ? "flex justify-center"
                  : alignment === "right"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              {(() => {
                const size = Number(socialSize) || 24;
                const color = socialColor || "#000000";
                const iconMap = {
                  instagram: FaInstagram,
                  facebook: FaFacebook,
                  twitter: FaTwitter,
                  linkedin: FaLinkedin,
                  youtube: FaYoutube,
                  github: FaGithub,
                  website: FaGlobe,
                };
                const IconCmp =
                  iconMap[(socialIcon || "instagram").toLowerCase()] || FaGlobe;
                const iconEl = <IconCmp size={size} color={color} />;
                if (socialUrl) {
                  return (
                    <a
                      href={socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementClick();
                      }}
                      title={socialUrl}
                      className="inline-flex items-center justify-center"
                    >
                      {iconEl}
                    </a>
                  );
                }
                return (
                  <button
                    className="inline-flex items-center justify-center"
                    onClick={(e) => handleElementClick(e)}
                    title="Click to select social icon"
                  >
                    {iconEl}
                  </button>
                );
              })()}
            </div>
          </div>
        );

      case "HTML Block":
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <div
              className="min-h-[60px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer w-full"
              onClick={(e) => handleElementClick(e)}
              style={{
                backgroundColor: isSelected
                  ? backgroundColor || "#ffffff"
                  : "transparent",
                textAlign: alignment,
              }}
              dangerouslySetInnerHTML={{ __html: localContent }}
            />
          </div>
        );

      default:
        return (
          <div
            className={`rounded-lg transition-colors ${
              isSelected ? "border-2 border-dashed border-gray-300" : ""
            } hover:border-purple-400 ${alignmentClass}`}
            style={{
              backgroundColor: backgroundColor || "#ffffff",
              padding: `${paddingTop || "16"}px ${paddingRight || "16"}px ${
                paddingBottom || "16"
              }px ${paddingLeft || "16"}px`,
            }}
          >
            <p className="text-gray-500">{localContent}</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative group transition-all duration-200 cursor-pointer rounded-lg hover:ring-2 hover:ring-primary/30 ${
        isSelected ? "ring-2 ring-primary ring-opacity-70" : ""
      }`}
      onClick={(e) => handleElementClick(e)}
    >
      {renderElement()}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="btn btn-error btn-xs absolute top-2 right-2 rounded-full shadow-md hover:shadow-lg z-50 tooltip tooltip-left"
          data-tip="Delete element"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ElementRenderer;
