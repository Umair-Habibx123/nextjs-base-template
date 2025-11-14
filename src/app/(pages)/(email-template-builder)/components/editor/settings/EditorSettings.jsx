"use client";

import { Input } from "../../ui/input";
import { Input as ColorPicker } from "../../ui/color-picker";

const EditorSettings = ({ selectedElement, onTextPropertyUpdate }) => {
  const fontSizes = [
    { label: "Small", value: 14 },
    { label: "Medium", value: 16 },
    { label: "Large", value: 18 },
    { label: "Extra Large", value: 24 },
    { label: "Heading", value: 32 },
  ];

  // Remove hardcoded colors array since we're using color pickers now

  const buttonShapes = [
    { label: "Rounded", value: "rounded-lg" },
    { label: "Pill", value: "rounded-full" },
    { label: "Square", value: "rounded-none" },
    { label: "Slightly Rounded", value: "rounded-md" },
  ];

  const alignments = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  const fontStyles = [
    { label: "Bold", value: "bold", icon: "B" },
    { label: "Italic", value: "italic", icon: "I" },
    { label: "Underline", value: "underline", icon: "U" },
  ];

  const handleFontSizeChange = (size) => {
    onTextPropertyUpdate("fontSize", `${size}px`);
  };

  const handleColorChange = (color) => {
    onTextPropertyUpdate("color", color);
  };

  const handleBackgroundColorChange = (color) => {
    onTextPropertyUpdate("backgroundColor", color);
  };

  const handleFontStyleChange = (style) => {
    const currentStyles = selectedElement.fontStyles || [];
    let newStyles;

    if (currentStyles.includes(style)) {
      // Remove style if already applied
      newStyles = currentStyles.filter((s) => s !== style);
    } else {
      // Add style if not applied
      newStyles = [...currentStyles, style];
    }

    onTextPropertyUpdate("fontStyles", newStyles);
  };

  // Add this function to handle updating font styles
  const handleUpdateFontStyles = (newStyles) => {
    onTextPropertyUpdate("fontStyles", newStyles);
  };

  const fontFamilies = [
    { label: "Default", value: "" },
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Open Sans", value: "Open Sans" },
    { label: "Geist Sans", value: "Geist Sans" },
    { label: "Geist Mono", value: "Geist Mono" },
  ];

  const handleFontFamilyChange = (family) => {
    onTextPropertyUpdate("fontFamily", family);
  };

  const handleButtonTextChange = (text) => {
    onTextPropertyUpdate("content", text);
  };

  const handleButtonColorChange = (color) => {
    
    onTextPropertyUpdate("buttonColor", color);
  };

  const handleButtonShapeChange = (shape) => {
    onTextPropertyUpdate("buttonShape", shape);
  };

  const handleButtonUrlChange = (url) => {
    onTextPropertyUpdate("buttonUrl", url);
  };

  // Social icon handlers
  const handleSocialIconChange = (icon) => {
    onTextPropertyUpdate("socialIcon", icon);
  };
  const handleSocialUrlChange = (url) => {
    onTextPropertyUpdate("socialUrl", url);
  };
  const handleSocialColorChange = (color) => {
    onTextPropertyUpdate("socialColor", color);
  };
  const handleSocialSizeChange = (size) => {
    onTextPropertyUpdate("socialSize", parseInt(size) || 24);
  };

  const handleAlignmentChange = (alignment) => {
    onTextPropertyUpdate("alignment", alignment);
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      onTextPropertyUpdate("content", imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  // If no element is selected, show a helpful message
  if (!selectedElement) {
    return (
      <>
        <div className="text-center text-base-content/60 py-10">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Element Selected
          </h3>
          <p className="text-sm">
            Click on any element in the canvas to see its settings here
          </p>
        </div>
      </>
    );
  }

  // Show button settings for button elements
  if (selectedElement.name === "Button") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Button Settings</h3>

        {/* Button Text */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Button Text</span>
          </label>
          <input
            type="text"
            value={
              selectedElement.content !== undefined
                ? selectedElement.content
                : "Click Here"
            }
            onChange={(e) => handleButtonTextChange(e.target.value)}
            placeholder="Enter button text..."
            className="input input-bordered w-full"
          />
        </div>

        {/* Padding Settings */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Padding</span>
          </label>

          {[
            { key: "paddingTop", label: "Top" },
            { key: "paddingRight", label: "Right" },
            { key: "paddingBottom", label: "Bottom" },
            { key: "paddingLeft", label: "Left" },
          ].map((pad) => (
            <div key={pad.key} className="mb-3">
              <label className="block text-xs text-base-content/60 mb-1">
                {pad.label}: {selectedElement[pad.key] || "16"}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={parseInt(selectedElement[pad.key] || "16")}
                onChange={(e) => onTextPropertyUpdate(pad.key, e.target.value)}
                className="range range-primary range-xs"
              />
            </div>
          ))}
        </div>

        {/* Button Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Button Color"
            value={selectedElement.buttonColor || "#8B5CF6"}
            onChange={handleButtonColorChange}
          />
        </div>

        {/* Background Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor || "#ffffff"}
            onChange={handleBackgroundColorChange}
          />
        </div>

        {/* Button Shape */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Button Shape</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {buttonShapes.map((shape) => (
              <button
                key={shape.value}
                onClick={() => handleButtonShapeChange(shape.value)}
                className={`btn btn-sm ${
                  selectedElement.buttonShape === shape.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Button URL */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Button URL</span>
          </label>
          <input
            type="url"
            value={selectedElement.buttonUrl || ""}
            onChange={(e) => handleButtonUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="input input-bordered w-full"
          />
          <p className="text-xs text-base-content/60 mt-1">
            Enter the URL where the button should link to
          </p>
        </div>

        {/* Alignment Controls */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Alignment</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleAlignmentChange(align.value)}
                className={`btn btn-sm ${
                  selectedElement.alignment === align.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show image settings for image elements
  if (selectedElement.name === "Image") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Image Settings</h3>

        {/* Image Preview */}
        {selectedElement.content &&
          selectedElement.content.startsWith("data:image") && (
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Image Preview</span>
              </label>
              <div className="border border-base-300 rounded-lg p-2">
                <img
                  src={selectedElement.content}
                  alt="Current image"
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: "150px" }}
                />
              </div>
            </div>
          )}

        {/* Image Size Controls */}
        {selectedElement.content &&
          selectedElement.content.startsWith("data:image") && (
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Image Size</span>
              </label>

              {/* Width */}
              <div className="mb-3">
                <label className="block text-xs text-base-content/60 mb-1">
                  Width
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="10"
                    value={selectedElement.imageWidth || 400}
                    onChange={(e) =>
                      onTextPropertyUpdate(
                        "imageWidth",
                        parseInt(e.target.value)
                      )
                    }
                    className="range range-primary range-xs flex-1"
                  />
                  <span className="text-xs text-base-content/60 w-12 text-right">
                    {selectedElement.imageWidth || 400}px
                  </span>
                </div>
              </div>

              {/* Height */}
              <div className="mb-3">
                <label className="block text-xs text-base-content/60 mb-1">
                  Height
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="10"
                    value={selectedElement.imageHeight || 300}
                    onChange={(e) =>
                      onTextPropertyUpdate(
                        "imageHeight",
                        parseInt(e.target.value)
                      )
                    }
                    className="range range-primary range-xs flex-1"
                  />
                  <span className="text-xs text-base-content/60 w-12 text-right">
                    {selectedElement.imageHeight || 300}px
                  </span>
                </div>
              </div>

              {/* Object Fit */}
              <div className="mb-3">
                <label className="block text-xs text-base-content/60 mb-1">
                  Fit Mode
                </label>
                <select
                  value={selectedElement.objectFit || "cover"}
                  onChange={(e) =>
                    onTextPropertyUpdate("objectFit", e.target.value)
                  }
                  className="select select-bordered select-sm w-full"
                >
                  <option value="cover">Cover (crop to fit)</option>
                  <option value="contain">Contain (fit entire image)</option>
                  <option value="fill">Fill (stretch to fit)</option>
                  <option value="none">None (original size)</option>
                </select>
              </div>

              {/* Border Radius */}
              <div className="mb-3">
                <label className="block text-xs text-base-content/60 mb-1">
                  Border Radius
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) =>
                      onTextPropertyUpdate(
                        "borderRadius",
                        parseInt(e.target.value)
                      )
                    }
                    className="range range-primary range-xs flex-1"
                  />
                  <span className="text-xs text-base-content/60 w-12 text-right">
                    {selectedElement.borderRadius || 0}px
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Background Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor || "#ffffff"}
            onChange={handleBackgroundColorChange}
          />
        </div>

        {/* Padding */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Padding</span>
          </label>

          {[
            { key: "paddingTop", label: "Top" },
            { key: "paddingRight", label: "Right" },
            { key: "paddingBottom", label: "Bottom" },
            { key: "paddingLeft", label: "Left" },
          ].map((pad) => (
            <div key={pad.key} className="mb-3">
              <label className="block text-xs text-base-content/60 mb-1">
                {pad.label}: {selectedElement[pad.key] || "16"}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={parseInt(selectedElement[pad.key] || "16")}
                onChange={(e) => onTextPropertyUpdate(pad.key, e.target.value)}
                className="range range-primary range-xs"
              />
            </div>
          ))}
        </div>

        {/* Image Status */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          {selectedElement.content &&
          selectedElement.content.startsWith("data:image") ? (
            <div className="flex items-center text-success text-xs">
              <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
              Image uploaded successfully
            </div>
          ) : (
            <div className="flex items-center text-base-content/60 text-xs">
              <span className="w-2 h-2 bg-base-content/40 rounded-full mr-2"></span>
              No image uploaded yet
            </div>
          )}
        </div>

        {/* Alignment Controls */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Alignment</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleAlignmentChange(align.value)}
                className={`btn btn-sm ${
                  selectedElement.alignment === align.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show social icon settings
  if (selectedElement.name === "Social Icon") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Social Icon Settings</h3>

        {/* Icon Picker */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Icon</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "instagram", label: "Instagram" },
              { key: "facebook", label: "Facebook" },
              { key: "twitter", label: "Twitter" },
              { key: "linkedin", label: "LinkedIn" },
              { key: "youtube", label: "YouTube" },
              { key: "github", label: "GitHub" },
              { key: "website", label: "Website" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSocialIconChange(opt.key)}
                className={`btn btn-sm w-full ${
                  (selectedElement.socialIcon || "instagram") === opt.key
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Icon Color"
            value={selectedElement.socialColor || "#000000"}
            onChange={handleSocialColorChange}
          />
        </div>

        {/* Icon Size */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">
              Icon Size: {selectedElement.socialSize || 24}px
            </span>
          </label>
          <input
            type="range"
            min="12"
            max="64"
            step="2"
            value={selectedElement.socialSize || 24}
            onChange={(e) => handleSocialSizeChange(e.target.value)}
            className="range range-primary range-xs"
          />
        </div>

        {/* URL */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Profile URL</span>
          </label>
          <input
            type="url"
            value={selectedElement.socialUrl || ""}
            onChange={(e) => handleSocialUrlChange(e.target.value)}
            placeholder="https://instagram.com/yourprofile"
            className="input input-bordered w-full"
          />
          <p className="text-xs text-base-content/60 mt-1">
            Add the link to your social profile
          </p>
        </div>

        {/* Padding Settings */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Padding</span>
          </label>

          {[
            { key: "paddingTop", label: "Top" },
            { key: "paddingRight", label: "Right" },
            { key: "paddingBottom", label: "Bottom" },
            { key: "paddingLeft", label: "Left" },
          ].map((pad) => (
            <div key={pad.key} className="mb-3">
              <label className="block text-xs text-base-content/60 mb-1">
                {pad.label}: {selectedElement[pad.key] || "16"}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={parseInt(selectedElement[pad.key] || "16")}
                onChange={(e) => onTextPropertyUpdate(pad.key, e.target.value)}
                className="range range-primary range-xs"
              />
            </div>
          ))}
        </div>

        {/* Alignment Controls */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Alignment</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleAlignmentChange(align.value)}
                className={`btn btn-sm ${
                  selectedElement.alignment === align.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show divider settings for divider elements
  if (selectedElement.name === "Divider") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Divider Settings</h3>

        {/* Divider Style Options */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Divider Style</span>
          </label>

          <div className="space-y-2">
            {/* Single Line */}
            <button
              className={`w-full flex items-center gap-2 p-2 rounded border-2 transition-all ${
                selectedElement.dividerStyle === "single" ||
                !selectedElement.dividerStyle
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
              onClick={() => onTextPropertyUpdate("dividerStyle", "single")}
            >
              <span className="flex-1 h-0.5 bg-base-content/40"></span>
              <span className="text-xs ml-2">Single Line</span>
            </button>

            {/* Double Arrow */}
            <button
              className={`w-full flex items-center gap-2 p-2 rounded border-2 transition-all ${
                selectedElement.dividerStyle === "double-arrow"
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
              onClick={() =>
                onTextPropertyUpdate("dividerStyle", "double-arrow")
              }
            >
              <span className="flex-1 flex items-center justify-center">
                <span className="text-xl">⇔</span>
              </span>
              <span className="text-xs ml-2">Double Arrow</span>
            </button>

            {/* Dotted Line */}
            <button
              className={`w-full flex items-center gap-2 p-2 rounded border-2 transition-all ${
                selectedElement.dividerStyle === "dotted"
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
              onClick={() => onTextPropertyUpdate("dividerStyle", "dotted")}
            >
              <span className="flex-1 border-t-2 border-dotted border-base-content/40"></span>
              <span className="text-xs ml-2">Dotted Line</span>
            </button>
          </div>
        </div>

        {/* Background Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor || "#ffffff"}
            onChange={handleBackgroundColorChange}
          />
        </div>
      </>
    );
  }

  // Show HTML Block settings
  if (selectedElement.name === "HTML Block") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">HTML Block Settings</h3>

        {/* HTML Content Editor */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">HTML Content</span>
          </label>
          <textarea
            value={selectedElement.content || ""}
            onChange={(e) => onTextPropertyUpdate("content", e.target.value)}
            className="textarea textarea-bordered h-40 font-mono text-sm"
            placeholder="<div>Your HTML content here...</div>"
          />
          <p className="text-xs text-base-content/60 mt-1">
            Enter your custom HTML content. Be careful with malformed HTML.
          </p>
        </div>

        {/* Background Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor || "#ffffff"}
            onChange={handleBackgroundColorChange}
          />
        </div>

        {/* Padding Settings */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Padding</span>
          </label>

          {[
            { key: "paddingTop", label: "Top" },
            { key: "paddingRight", label: "Right" },
            { key: "paddingBottom", label: "Bottom" },
            { key: "paddingLeft", label: "Left" },
          ].map((pad) => (
            <div key={pad.key} className="mb-3">
              <label className="block text-xs text-base-content/60 mb-1">
                {pad.label}: {selectedElement[pad.key] || "16"}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={parseInt(selectedElement[pad.key] || "16")}
                onChange={(e) => onTextPropertyUpdate(pad.key, e.target.value)}
                className="range range-primary range-xs"
              />
            </div>
          ))}
        </div>

        {/* Alignment Controls */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Alignment</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleAlignmentChange(align.value)}
                className={`btn btn-sm ${
                  selectedElement.alignment === align.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Only show text settings for text elements
  if (selectedElement.name !== "Text") {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Settings</h3>

        {/* Placeholder section */}
        <div className="text-center text-base-content/60 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p>Settings for {selectedElement.name} elements coming soon</p>
        </div>

        {/* Alignment Controls */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Alignment</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {alignments.map((align) => (
              <button
                key={align.value}
                onClick={() => handleAlignmentChange(align.value)}
                className={`btn btn-sm ${
                  selectedElement.alignment === align.value
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div className="form-control mb-6">
          <ColorPicker
            label="Background Color"
            value={selectedElement.backgroundColor || "#ffffff"}
            onChange={handleBackgroundColorChange}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Text Settings</h3>

      {/* Text Content Editor */}
      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">Text Content</span>
        </label>
        <textarea
          value={selectedElement.content || ""}
          onChange={(e) => onTextPropertyUpdate("content", e.target.value)}
          className="textarea textarea-bordered h-24"
          placeholder="Enter your text here..."
        />
      </div>

      {/* Font Size Slider */}
      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">
            Font Size: {selectedElement.fontSize || "16px"}
          </span>
        </label>
        <input
          type="range"
          min="12"
          max="48"
          step="1"
          value={parseInt(selectedElement.fontSize?.replace("px", "") || "16")}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
          className="range range-primary"
        />
        <div className="flex justify-between text-xs text-base-content mt-1">
          <span>12px</span>
          <span>48px</span>
        </div>
      </div>

      {/* Text Color */}
      <div className="form-control mb-6">
        <ColorPicker
          label="Text Color"
          value={selectedElement.color || "#000000"}
          onChange={handleColorChange}
        />
      </div>

      {/* Background Color */}
      <div className="form-control mb-6">
        <ColorPicker
          label="Background Color"
          value={selectedElement.backgroundColor || "#ffffff"}
          onChange={handleBackgroundColorChange}
        />
      </div>

      {/* Alignment Controls */}
      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">Alignment</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {alignments.map((align) => (
            <button
              key={align.value}
              onClick={() => handleAlignmentChange(align.value)}
              className={`btn btn-sm ${
                selectedElement.alignment === align.value
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              {align.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Style Options */}
      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">Font Style</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {fontStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => handleFontStyleChange(style.value)}
              className={`btn btn-sm ${
                selectedElement.fontStyles?.includes(style.value)
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              <span className={style.value}>{style.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Family Dropdown */}
      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">Font Family</span>
        </label>
        <select
          value={selectedElement.fontFamily || ""}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="select select-bordered"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default EditorSettings;
