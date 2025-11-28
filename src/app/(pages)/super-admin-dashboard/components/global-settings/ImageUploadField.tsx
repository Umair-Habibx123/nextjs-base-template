"use client";

import React, { useEffect, useState } from "react";
import { Upload, Image, Eye, X } from "lucide-react";
import { toast } from "react-toastify";

const ImageUploadField = ({ 
  label, 
  value, 
  onChange, 
  previewClassName = "h-20 w-20" 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || ""); // Ensure preview is never null

  useEffect(() => {
    setPreview(value || ""); // Handle null/undefined values
  }, [value]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/super-admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      
      if (json.url) {
        onChange(json.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Failed to upload image");
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    onChange("");
    setPreview("");
  };

  return (
    <div className="space-y-3">
      <label className="font-semibold text-base-content/90">{label}</label>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview */}
        <div className="flex items-center gap-4">
          {preview ? (
            <div className="relative group">
              <div className={`${previewClassName} rounded-xl border-2 border-base-300/50 bg-base-200 flex items-center justify-center overflow-hidden`}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(preview, '_blank')}
                  className="p-1.5 bg-base-100 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1.5 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={`${previewClassName} rounded-xl border-2 border-dashed border-base-300/50 bg-base-200 flex items-center justify-center`}>
              <Image className="w-8 h-8 text-base-content/40" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-primary/5 cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={`file-upload-${label.replace(/\s+/g, '-')}`}
            />
            <label 
              htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
              className="cursor-pointer block"
            >
              <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="space-y-2">
                <p className="font-medium text-base-content">
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-base-content/60">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </label>
          </div>
          
          {/* URL Input as fallback - FIXED: Ensure value is never null */}
          <div className="mt-3">
            <label className="text-sm font-medium text-base-content/70 mb-2 block">
              Or enter image URL
            </label>
            <input
              type="url"
              value={value || ""} // This is the key fix - ensures value is never null
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input input-bordered w-full text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;