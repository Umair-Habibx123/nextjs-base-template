"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Loading from "../../../components/layout/Loading";
import EditorRenderer from "@/app/(pages)/components/editor/Renderer";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Eye,
  Share2,
  Bookmark,
  Tag,
  Home,
  BookOpen,
  Layers,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const { slug } = params;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlog(data.blog);
          setViewCount(data.blog.view_count || 0);
        }
      })
      .catch(() => console.error("Network error"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = (platform?: string) => {
    if (!blog) return;

    const shareUrl = window.location.href;
    const shareText = `${blog.title} - ${blog.excerpt}`;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: blog.title,
            text: blog.excerpt,
            url: shareUrl,
          });
        } else {
          setShowShareMenu(true);
        }
    }
    setShowShareMenu(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Add your like logic here
  };

  const readingTime = Math.ceil(blog?.content_html?.length / 1000) || 5;

  if (loading) return <Loading message="Loading blog..." />;

  if (!blog)
    return (
      <main className="min-h-screen bg-base-100 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-32 h-32 mx-auto bg-base-200 rounded-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-base-300" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-base-content">
              Article not found
            </h1>
            <p className="text-base-content/60 text-lg leading-relaxed">
              The story you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <Link
            href="/blogs"
            className="btn btn-primary btn-lg rounded-full hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stories
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-base-100">
      {/* 🌟 Modern Navigation */}
      <nav
        className="sticky z-40 bg-base-100/80 backdrop-blur-md border-b border-base-200 transition-all duration-300"
        style={{
          top: "calc(var(--header-height, 80px) * var(--header-visible, 1))",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/blogs"
              className="flex items-center gap-2 text-base-content/60 hover:text-base-content transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Stories</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Reading Progress */}
              <div className="hidden md:flex items-center gap-2 text-sm text-base-content/60">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike()}
                  className={`btn btn-ghost btn-circle ${
                    isLiked ? "text-red-500 bg-red-50" : ""
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </button>

                <div className="dropdown dropdown-end">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="btn btn-ghost btn-circle"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* Share Dropdown */}
                  <div
                    className={`dropdown-content menu p-3 shadow-2xl bg-base-100 rounded-2xl border border-base-200 min-w-48 z-50 ${
                      showShareMenu ? "block" : "hidden"
                    }`}
                  >
                    <div className="space-y-2">
                      <button
                        onClick={() => handleShare("twitter")}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50 transition-colors duration-200 text-base-content"
                      >
                        <Twitter className="w-5 h-5 text-blue-400" />
                        <span>Share on Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50 transition-colors duration-200 text-base-content"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span>Share on Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50 transition-colors duration-200 text-base-content"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <span>Share on LinkedIn</span>
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-base-200 transition-colors duration-200 text-base-content"
                      >
                        <Link2 className="w-5 h-5 text-base-content/60" />
                        <span>Copy link</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`btn btn-ghost btn-circle ${
                    isBookmarked ? "text-green-600 bg-green-50" : ""
                  }`}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 fill-current" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
        {/* 🎯 Article Header */}
        <header className="py-12 text-center">
          {/* Categories */}
          {blog.categories?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {blog.categories.map((cat: string, index: number) => (
                <span
                  key={index}
                  className="badge badge-lg bg-base-200 text-base-content hover:bg-base-300 transition-colors duration-200 cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-base-content/60 leading-relaxed max-w-3xl mx-auto mb-8">
              {blog.excerpt}
            </p>
          )}

          {/* 📊 Author & Meta Information */}
          <div className="flex flex-col items-center gap-6">
            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-content font-semibold text-lg">
                {blog.author_name?.[0] || "U"}
              </div>
              <div className="text-left">
                <div className="font-semibold text-base-content">
                  {blog.author_name || "Unknown Author"}
                </div>
                <div className="flex items-center gap-4 text-sm text-base-content/60 mt-1">
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  {viewCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{viewCount} views</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {blog.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="badge badge-outline badge-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 🖼️ Featured Image */}
        {blog.cover_image && (
          <figure className="mb-12 rounded-2xl overflow-hidden">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-auto max-h-96 object-cover"
            />
          </figure>
        )}

        {/* 📝 Article Content */}
        <article className="max-w-3xl mx-auto">
          {/* Content */}
          <div
            className="prose prose-lg max-w-none 
            prose-headings:text-base-content 
            prose-p:text-base-content/70 prose-p:leading-8
            prose-strong:text-base-content 
            prose-em:text-base-content/60
            prose-a:text-primary hover:prose-a:text-primary-focus
            prose-blockquote:border-l-primary prose-blockquote:bg-primary/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl
            prose-img:rounded-2xl prose-img:shadow-md
            prose-ul:text-base-content/70 prose-ol:text-base-content/70
            prose-hr:border-base-200
            prose-pre:bg-base-300 prose-pre:text-base-content
            prose-code:text-base-content/70 prose-code:bg-base-200 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg
          "
          >
            {blog.content_json ? (
              <EditorRenderer data={JSON.parse(blog.content_json)} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: blog.content_html }} />
            )}
          </div>
        </article>

        {/* 💬 Engagement Section */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-base-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`btn gap-2 rounded-full ${
                  isLiked
                    ? "btn-outline btn-error"
                    : "btn-outline btn-ghost text-base-content/70"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">
                  {isLiked ? "Liked" : "Like"}
                </span>
                <span className="text-sm opacity-75">•</span>
                <span className="text-sm">245</span>
              </button>

              <button className="btn btn-outline btn-ghost gap-2 rounded-full text-base-content/70">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Comment</span>
                <span className="text-sm opacity-75">•</span>
                <span className="text-sm">42</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare("twitter")}
                className="btn btn-ghost btn-circle text-base-content/70 hover:text-blue-400 hover:bg-blue-50"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="btn btn-ghost btn-circle text-base-content/70 hover:text-blue-700 hover:bg-blue-50"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="btn btn-ghost btn-circle text-base-content/70 hover:bg-base-200"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 📚 More Stories */}
        <div className="max-w-3xl mx-auto mt-16 pt-12 border-t border-base-200">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-base-content/60" />
            <h2 className="text-2xl font-bold text-base-content">
              More from our blog
            </h2>
          </div>

          <div className="grid gap-6">
            {/* Sample related articles - you can fetch these from your API */}
            <div className="p-6 rounded-2xl hover:bg-base-200 transition-all duration-200 cursor-pointer border border-transparent hover:border-base-300">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-base-300 rounded-xl shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-base-content mb-2">
                    The Future of Web Development
                  </h3>
                  <p className="text-base-content/60 text-sm line-clamp-2">
                    Exploring the latest trends and technologies shaping the
                    future of web development...
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-base-content/50">
                    <span>John Doe</span>
                    <span>•</span>
                    <span>May 15, 2024</span>
                    <span>•</span>
                    <span>4 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/blogs"
              className="btn btn-outline gap-2 rounded-full hover:bg-base-200 transition-all duration-200 font-medium"
            >
              <BookOpen className="w-5 h-5" />
              View all stories
            </Link>
          </div>
        </div>

        {/* 📱 Mobile Action Bar */}
        <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 px-4 py-3 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500" : "text-base-content/70"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">245</span>
            </button>

            <button className="flex items-center gap-2 text-base-content/70">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">42</span>
            </button>

            <button onClick={() => handleShare()} className="text-base-content/70">
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? "text-green-600" : "text-base-content/70"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 fill-current" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}