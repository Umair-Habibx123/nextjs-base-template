"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import slugify from "slugify";
import CreatableSelect from "react-select/creatable";
// import editorjsHTML from "editorjs-html";
import {
  FileText,
  Image,
  Tag,
  FolderOpen,
  Star,
  Eye,
  EyeOff,
  Calendar,
  Upload,
  X,
  Save,
  ArrowLeft,
  Sparkles,
  Type,
  Link,
  FileEdit,
  AlertCircle,
} from "lucide-react";

const EditorJSEditor = dynamic(() => import("../EditorJSEditor"), {
  ssr: false,
});

export default function ProjectForm({ initialData, onSaved, onCancel }: any) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured === 1);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(initialData?.content_json || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [tags, setTags] = useState(
    initialData?.tags?.map((t: string) => ({ label: t, value: t })) || []
  );
  const [categories, setCategories] = useState(
    initialData?.categories?.map((c: string) => ({ label: c, value: c })) || []
  );

  const [tagOptions, setTagOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Helper function to validate individual fields
  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };

    switch (name) {
      case "title":
        if (!value?.trim()) {
          newErrors.title = "Title is required";
        } else {
          delete newErrors.title;
        }
        break;
      case "slug":
        if (!value?.trim()) {
          newErrors.slug = "Slug is required";
        } else {
          delete newErrors.slug;
        }
        break;
      case "excerpt":
        if (!value?.trim()) {
          newErrors.excerpt = "Excerpt is required";
        } else {
          delete newErrors.excerpt;
        }
        break;
      case "coverImage":
        if (!value?.trim()) {
          newErrors.coverImage = "Cover image is required";
        } else {
          delete newErrors.coverImage;
        }
        break;
      case "content":
        if (!value || !Object.keys(value).length) {
          newErrors.content = "Content cannot be empty";
        } else {
          delete newErrors.content;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!content || !Object.keys(content).length)
      newErrors.content = "Content cannot be empty";
    if (!coverImage.trim()) newErrors.coverImage = "Cover image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});

    // const edjsParser = editorjsHTML({
    //   // 🧩 Custom handler for linkTool
    //   linkTool: (block: any) => {
    //     const { link, meta } = block.data || {};
    //     if (!link) return "";
    //     const title = meta?.title || link;
    //     const description = meta?.description || "";
    //     const image = meta?.image?.url || meta?.image || "";

    //     return `
    //   <a href="${link}" target="_blank" rel="noopener noreferrer"
    //     class="editorjs-link-block"
    //     style="display:block;border:1px solid #ddd;padding:12px;border-radius:8px;text-decoration:none;color:inherit;">
    //     ${
    //       image
    //         ? `<img src="${image}" alt="${title}" style="max-height:150px;width:100%;object-fit:cover;border-radius:6px;margin-bottom:8px;">`
    //         : ""
    //     }
    //     <div style="font-weight:600;font-size:1rem;margin-bottom:4px;">${title}</div>
    //     <div style="font-size:0.85rem;color:#555;">${description}</div>
    //     <div style="font-size:0.8rem;color:#888;margin-top:4px;">${link}</div>
    //   </a>
    // `;
    //   },

    //   // Optional: handle embeds gracefully
    //   embed: (block: any) => {
    //     const { service, embed } = block.data || {};
    //     if (service === "youtube" || service === "vimeo") {
    //       return `<iframe src="${embed}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:8px;"></iframe>`;
    //     }
    //     return "";
    //   },

    //   // Optional: support tables
    //   table: (block: any) => {
    //     const rows = block.data.content || [];
    //     return `
    //   <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
    //     ${rows
    //       .map(
    //         (r: string[]) =>
    //           `<tr>${r
    //             .map(
    //               (c) =>
    //                 `<td style="border:1px solid #ddd;padding:6px;">${c}</td>`
    //             )
    //             .join("")}</tr>`
    //       )
    //       .join("")}
    //   </table>
    // `;
    //   },
    // });

    let html = "";

    try {
      if (content) {
        const parsed =
          typeof content === "string" ? JSON.parse(content) : content;
        // const parsedBlocks = edjsParser.parse(parsed);
        // html = Array.isArray(parsedBlocks)
        //   ? parsedBlocks.join("")
        //   : String(parsedBlocks || "");
      }
    } catch (err) {
      console.warn("⚠️ Failed to convert EditorJS to HTML", err);
    }

    const payload = {
      title,
      slug: slug || slugify(title, { lower: true, strict: true }),
      cover_image: coverImage,
      excerpt,
      content_json: content,
      content_html: html,
      status,
      is_featured: isFeatured ? 1 : 0,
      tags: tags.map((t) => t.value),
      categories: categories.map((c) => c.value),
      order_number: initialData?.order_number ?? null, // 👈 added
    };


    setSaving(true);
    try {
      const res = await fetch(
        initialData?.id
          ? `/api/admin/projects/${initialData.id}`
          : `/api/admin/projects`,
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save Project");

      toast.success("Project saved successfully!");
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tagRes, catRes] = await Promise.all([
          fetch("/api/admin/tags"),
          fetch("/api/admin/categories"),
        ]);
        const tagsData = await tagRes.json();
        const catsData = await catRes.json();

        setTagOptions(
          tagsData.map((t: any) => ({ label: t.name, value: t.name }))
        );
        setCategoryOptions(
          catsData.map((c: any) => ({ label: c.name, value: c.name }))
        );
      } catch (err) {
        console.error("Failed to fetch tag/category options", err);
      }
    };
    fetchOptions();
  }, []);

  // Error display component
  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="flex items-center gap-1 mt-2 text-error text-sm">
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center justify-between p-6 ">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
            <FileEdit className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
              {initialData?.id ? "Edit Project Post" : "Create New Project Post"}
            </h1>
            <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
              {initialData?.id
                ? "Update your Project content and settings"
                : "Start crafting your next amazing Project post"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            className="select select-bordered select-lg rounded-xl bg-base-200/50 border-base-300/30 focus:ring-2 focus:ring-primary/50 shadow-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft" className="flex items-center gap-2">
              Draft
            </option>
            <option value="published" className="flex items-center gap-2">
              Published
            </option>
          </select>

          <button
            onClick={onCancel}
            className="btn btn-lg btn-ghost rounded-xl flex items-center gap-2 hover:bg-base-300/30 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-lg btn-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Post
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Slug Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Content Basics
                </h2>
                <p className="text-base-content/60 text-sm">
                  Title and URL settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label font-semibold flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Title
                </label>
                <input
                  className={`input w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 ${
                    errors.title
                      ? "input-error border-2 border-error"
                      : "input-bordered"
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    const newSlug = slugify(e.target.value, {
                      lower: true,
                      strict: true,
                    });
                    setSlug(newSlug);
                    validateField("title", e.target.value);
                    validateField("slug", newSlug);
                  }}
                  onBlur={() => validateField("title", title)}
                  placeholder="Enter your Project post title..."
                />
                {errors.title && <ErrorMessage error={errors.title} />}
              </div>

              <div>
                <label className="label font-semibold flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Slug
                </label>
                <input
                  className={`input w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 ${
                    errors.slug
                      ? "input-error border-2 border-error"
                      : "input-bordered"
                  }`}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    validateField("slug", e.target.value);
                  }}
                  onBlur={() => validateField("slug", slug)}
                  placeholder="URL-friendly version..."
                />
                {errors.slug && <ErrorMessage error={errors.slug} />}
              </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Cover Image
                </h2>
                <p className="text-base-content/60 text-sm">
                  Add a beautiful cover image
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className={`input flex-1 rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 ${
                    errors.coverImage
                      ? "input-error border-2 border-error"
                      : "input-bordered"
                  }`}
                  placeholder="https://example.com/cover.jpg"
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    validateField("coverImage", e.target.value);
                  }}
                  onBlur={() => validateField("coverImage", coverImage)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please upload an image file");
                      return;
                    }
                    const formData = new FormData();
                    formData.append("file", file);
                    toast.info("Uploading cover...");
                    try {
                      const res = await fetch("/api/admin/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (res.ok && data.url) {
                        setCoverImage(data.url);
                        validateField("coverImage", data.url);
                        toast.success("Cover uploaded!");
                      } else toast.error("Upload failed");
                    } catch {
                      toast.error("Upload failed");
                    }
                  }}
                  className="file-input file-input-bordered file-input-primary w-48 rounded-xl"
                />
              </div>
              {errors.coverImage && <ErrorMessage error={errors.coverImage} />}

              {coverImage && (
                <div className="relative group">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl"
                  />
                  <button
                    onClick={() => {
                      setCoverImage("");
                      validateField("coverImage", "");
                    }}
                    className="absolute top-3 right-3 btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Excerpt Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">Excerpt</h2>
                <p className="text-base-content/60 text-sm">
                  Brief summary of your article
                </p>
              </div>
            </div>

            <textarea
              className={`textarea w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 min-h-32 ${
                errors.excerpt
                  ? "textarea-error border-2 border-error"
                  : "textarea-bordered"
              }`}
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                validateField("excerpt", e.target.value);
              }}
              onBlur={() => validateField("excerpt", excerpt)}
              placeholder="Write a short, engaging summary that will appear in Project listings and search results..."
            />
            {errors.excerpt && <ErrorMessage error={errors.excerpt} />}
          </div>

          {/* Main Content Editor */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Main Content
                </h2>
                <p className="text-base-content/60 text-sm">
                  Write your amazing content
                </p>
              </div>
            </div>

            <div
              className={
                errors.content ? "border-2 border-error rounded-xl" : ""
              }
            >
              <EditorJSEditor
                initialData={content}
                onChange={(data) => {
                  setContent(data);
                  validateField("content", data);
                }}
              />
            </div>
            {errors.content && (
              <div className="mt-3">
                <ErrorMessage error={errors.content} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Tags Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-success/10 text-success">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">Tags</h2>
                <p className="text-base-content/60 text-sm">
                  Add relevant tags
                </p>
              </div>
            </div>

            <CreatableSelect
              isMulti
              options={tagOptions}
              value={tags}
              onChange={(newValue) => setTags(newValue || [])}
              placeholder="Add or select tags..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: "12px",
                  borderColor: errors.tags
                    ? "hsl(var(--er))"
                    : "hsl(var(--bc) / 0.2)",
                  borderWidth: errors.tags ? "2px" : "1px",
                  backgroundColor: "hsl(var(--b2) / 0.5)",
                  minHeight: "48px",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--b1))",
                }),
              }}
            />
          </div>

          {/* Categories Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-warning/10 text-warning">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Categories
                </h2>
                <p className="text-base-content/60 text-sm">
                  Organize your content
                </p>
              </div>
            </div>

            <CreatableSelect
              isMulti
              options={categoryOptions}
              value={categories}
              onChange={(newValue) => setCategories(newValue || [])}
              placeholder="Add or select categories..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: "12px",
                  borderColor: errors.categories
                    ? "hsl(var(--er))"
                    : "hsl(var(--bc) / 0.2)",
                  borderWidth: errors.categories ? "2px" : "1px",
                  backgroundColor: "hsl(var(--b2) / 0.5)",
                  minHeight: "48px",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--b1))",
                }),
              }}
            />
          </div>

          {/* Featured Toggle Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Featured
                </h2>
                <p className="text-base-content/60 text-sm">
                  Highlight this post
                </p>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/20 cursor-pointer hover:bg-base-300/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <Star
                  className={`w-5 h-5 ${
                    isFeatured
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-base-content/40"
                  }`}
                />
                <span className="font-semibold">Featured Project Post</span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
            </label>
          </div>

          {/* 📊 Order Number Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Display Order
                </h2>
                <p className="text-base-content/60 text-sm">
                  Control where this Project appears in the list
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="number"
                min="1"
                className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                placeholder="Leave blank for auto order"
                value={initialData?.order_number ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  initialData.order_number = val;
                }}
              />
              <p className="text-sm text-base-content/50">
                Lower numbers appear first. Leave blank for default ordering.
              </p>
            </div>
          </div>

          {/* Post Information Card */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  Post Information
                </h2>
                <p className="text-base-content/60 text-sm">Content details</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-base-300/20">
                <span className="text-base-content/60">Status:</span>
                <span
                  className={`badge badge-lg capitalize ${
                    status === "published"
                      ? "badge-success text-success-content"
                      : "badge-warning text-warning-content"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-base-300/20">
                <span className="text-base-content/60">Featured:</span>
                <span
                  className={
                    isFeatured
                      ? "text-success font-semibold"
                      : "text-base-content/60"
                  }
                >
                  {isFeatured ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-base-300/20">
                <span className="text-base-content/60">Tags:</span>
                <span className="text-base-content font-semibold">
                  {tags.length}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-base-content/60">Categories:</span>
                <span className="text-base-content font-semibold">
                  {categories.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
