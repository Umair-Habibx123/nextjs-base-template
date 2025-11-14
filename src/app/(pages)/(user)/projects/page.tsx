"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Loading from "../../components/layout/Loading";
import {
  Calendar,
  Clock,
  ArrowRight,
  Star,
  BookOpen,
  Search,
  Filter,
  Eye,
  User,
  TrendingUp,
  Sparkles,
  X,
  Tag,
  Folder,
  EyeOff,
  List,
  Grid,
  SortAsc,
  SortDesc,
} from "lucide-react";

type Project = {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string;
  is_featured: number;
  createdAt: string;
  view_count: number;
  order_number: number | null;
  author_name: string;
  tags?: string;
  categories?: string;
  read_time?: number;
};

type FilterState = {
  sortBy: string;
  sortOrder: "asc" | "desc";
  featured: string;
  timeRange: string;
  tags: string[];
  categories: string[];
  viewCount: string;
};

type ViewMode = "grid" | "list" | "table";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setprojects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredprojects, setFeaturedprojects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [filters, setFilters] = useState<FilterState>({
    sortBy: "createdAt",
    sortOrder: "desc",
    featured: "",
    timeRange: "",
    tags: [],
    categories: [],
    viewCount: "",
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setprojects(data.projects);
          setPagination(data.pagination);
          setFeaturedprojects(
            data.projects.filter((b: Project) => b.is_featured).slice(0, 3)
          );
        } else console.error("Failed to load projects");
      })
      .catch(() => console.error("Network error"))
      .finally(() => setLoading(false));
  }, [page]);

  // Apply filters and search
  const filteredprojects = projects
    .filter((project) => {
      // Search term filter
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.categories?.toLowerCase().includes(searchTerm.toLowerCase());

      // Featured filter
      const matchesFeatured = !filters.featured || 
        (filters.featured === "featured" && project.is_featured === 1) ||
        (filters.featured === "not-featured" && project.is_featured === 0);

      // Time range filter
      const projectDate = new Date(project.createdAt);
      const now = new Date();
      const matchesTimeRange = 
        !filters.timeRange ||
        (filters.timeRange === "week" && (now.getTime() - projectDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
        (filters.timeRange === "month" && (now.getTime() - projectDate.getTime()) < 30 * 24 * 60 * 60 * 1000) ||
        (filters.timeRange === "year" && (now.getTime() - projectDate.getTime()) < 365 * 24 * 60 * 60 * 1000);

      // View count filter
      const matchesViewCount = 
        !filters.viewCount ||
        (filters.viewCount === "popular" && project.view_count > 100) ||
        (filters.viewCount === "trending" && project.view_count > 50) ||
        (filters.viewCount === "new" && project.view_count < 10);

      return matchesSearch && matchesFeatured && matchesTimeRange && matchesViewCount;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "views":
          aValue = a.view_count;
          bValue = b.view_count;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "featured":
          aValue = a.is_featured;
          bValue = b.is_featured;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const clearFilters = () => {
    setFilters({
      sortBy: "createdAt",
      sortOrder: "desc",
      featured: "",
      timeRange: "",
      tags: [],
      categories: [],
      viewCount: "",
    });
    setSearchTerm("");
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSort = (field: string) => {
    if (filters.sortBy === field) {
      updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      updateFilter("sortBy", field);
      updateFilter("sortOrder", "desc");
    }
  };

  const isSearching = searchTerm.length > 0;
  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== '' && filter !== 'createdAt' && filter !== 'desc'
  );

  // Extract unique values for filters
  const allTags = projects.flatMap(project => project.tags ? project.tags.split(',') : []).filter(Boolean);
  const uniqueTags = [...new Set(allTags)].slice(0, 10); // Limit to 10 tags
  const allCategories = projects.flatMap(project => project.categories ? project.categories.split(',') : []).filter(Boolean);
  const uniqueCategories = [...new Set(allCategories)].slice(0, 8); // Limit to 8 categories

  if (loading) return <Loading message={t("Fetching Projects...")} />;

  return (
    <main className="min-h-screen bg-linear-to-br from-base-100 via-base-100 to-primary/5 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <section className="container mx-auto px-4 py-8 animate-fade-in relative z-10">
        {/* 🌟 Modern Header */}
        <div className="text-center mb-16 space-y-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-6 rounded-3xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-2xl">
                <BookOpen className="w-10 h-10" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-accent-content" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent leading-tight">
              {isSearching ? t("Search Results") : t("Our Project")}
            </h1>
            <p className="text-base-content/70 text-xl max-w-3xl mx-auto leading-relaxed">
              {isSearching
                ? t(`Found ${filteredprojects.length} results for "${searchTerm}"`)
                : t(
                    "Discover insights, stories, and updates from our platform. Explore featured content and latest publications."
                  )}
            </p>
          </div>

          {/* 📊 Enhanced Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {projects.length}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Total")}
              </div>
            </div>
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-secondary mb-1">
                {projects.filter((project) => project.is_featured).length}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Featured")}
              </div>
            </div>
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-accent mb-1">
                {projects.reduce((sum, project) => sum + (project.view_count || 0), 0)}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Total Views")}
              </div>
            </div>
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-info mb-1">
                {filteredprojects.length}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Filtered")}
              </div>
            </div>
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-warning mb-1">
                {uniqueTags.length}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Tags")}
              </div>
            </div>
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-lg">
              <div className="text-2xl font-bold text-success mb-1">
                {uniqueCategories.length}
              </div>
              <div className="text-base-content/60 text-xs font-medium">
                {t("Categories")}
              </div>
            </div>
          </div>

          {/* 🔍 Enhanced Search & Controls */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-base-content/40 w-6 h-6 transition-all duration-300 group-focus-within:text-primary" />
              <input
                type="text"
                placeholder={t("Search Projects by title, content, author, tags...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-32 py-5 bg-base-100 border-2 border-base-300/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-lg shadow-lg backdrop-blur-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-24 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/60 transition-colors duration-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? "bg-primary text-primary-content"
                      : "text-base-content/40 hover:text-base-content/60"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-base-300/50"></div>
                <div className="flex items-center gap-1 bg-base-200/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === "grid" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content/60"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === "list" ? "bg-primary text-primary-content" : "text-base-content/40 hover:text-base-content/60"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-base-100 border-2 border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-base-content">Advanced Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline btn-sm rounded-lg"
                    disabled={!hasActiveFilters && !searchTerm}
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort By */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Sort By</span>
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="select select-bordered w-full rounded-lg"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="title">Title</option>
                      <option value="views">View Count</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Order</span>
                    </label>
                    <button
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="btn btn-outline w-full rounded-lg flex items-center gap-2"
                    >
                      {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>

                  {/* Featured */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Featured</span>
                    </label>
                    <select
                      value={filters.featured}
                      onChange={(e) => updateFilter('featured', e.target.value)}
                      className="select select-bordered w-full rounded-lg"
                    >
                      <option value="">All Posts</option>
                      <option value="featured">Featured Only</option>
                      <option value="not-featured">Not Featured</option>
                    </select>
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Time Range</span>
                    </label>
                    <select
                      value={filters.timeRange}
                      onChange={(e) => updateFilter('timeRange', e.target.value)}
                      className="select select-bordered w-full rounded-lg"
                    >
                      <option value="">All Time</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="year">Past Year</option>
                    </select>
                  </div>
                </div>

                {/* Quick Filter Buttons */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-semibold text-base-content/70">Popularity:</span>
                    {["popular", "trending", "new"].map(type => (
                      <button
                        key={type}
                        onClick={() => updateFilter('viewCount', filters.viewCount === type ? '' : type)}
                        className={`badge badge-lg gap-2 capitalize transition-all ${
                          filters.viewCount === type 
                            ? 'badge-primary' 
                            : 'badge-outline hover:badge-primary'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Tags */}
                  {uniqueTags.length > 0 && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Tags</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => updateFilter('tags', 
                              filters.tags.includes(tag) 
                                ? filters.tags.filter(t => t !== tag)
                                : [...filters.tags, tag]
                            )}
                            className={`badge badge-lg gap-2 transition-all ${
                              filters.tags.includes(tag) 
                                ? 'badge-secondary' 
                                : 'badge-outline hover:badge-secondary'
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ⭐ Featured projects Section - Only show when not searching */}
        {!isSearching && featuredprojects.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-linear-to-br from-warning to-warning/80 text-warning-content shadow-lg">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-base-content">
                  Featured Stories
                </h2>
                <p className="text-base-content/60">
                  Handpicked content worth exploring
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {featuredprojects.map((project, index) => (
                <article
                  key={project.id}
                  className="group relative bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 overflow-hidden"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-base-100/50 to-transparent z-10"></div>

                  {/* Image */}
                  {project.cover_image && (
                    <figure className="relative h-48 overflow-hidden">
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-linear-to-r from-warning to-warning/80 text-warning-content px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold">
                          <Star className="w-4 h-4 fill-current" />
                          Featured
                        </div>
                      </div>
                    </figure>
                  )}

                  {/* Content */}
                  <div className="relative z-20 p-6 space-y-4">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {project.title}
                    </h3>

                    {project.excerpt && (
                      <p className="text-base-content/70 text-sm leading-relaxed line-clamp-3">
                        {project.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4 text-xs text-base-content/50">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{project.view_count || 0} views</span>
                        </div>
                      </div>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="btn btn-primary btn-sm rounded-xl group/btn transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 📝 project Content - Dynamic Views */}
        {filteredprojects.length === 0 ? (
          <div className="text-center py-20 space-y-8">
            <div className="w-32 h-32 mx-auto bg-base-200 rounded-full flex items-center justify-center shadow-2xl">
              <BookOpen className="w-16 h-16 text-base-content/30" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-base-content/60">
                {isSearching || hasActiveFilters
                  ? t("No Projects found matching your criteria.")
                  : t("No Projects published yet.")}
              </h3>
              <p className="text-base-content/50 text-lg max-w-md mx-auto">
                {isSearching || hasActiveFilters
                  ? "Try adjusting your search terms or filters to see more results."
                  : "Check back soon for new content and updates."}
              </p>
            </div>
            {(isSearching || hasActiveFilters) && (
              <button
                onClick={clearFilters}
                className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <span>Clear Search & Filters</span>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    isSearching
                      ? "bg-linear-to-br from-info to-info/80 text-info-content"
                      : "bg-linear-to-br from-primary to-primary/80 text-primary-content"
                  }`}
                >
                  {isSearching ? (
                    <Search className="w-6 h-6" />
                  ) : (
                    <TrendingUp className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-base-content">
                    {isSearching ? "Search Results" : "All Articles"}
                  </h2>
                  <p className="text-base-content/60">
                    {isSearching
                      ? `Found ${filteredprojects.length} results for "${searchTerm}"`
                      : `Showing ${filteredprojects.length} of ${projects.length} articles`}
                  </p>
                </div>
              </div>
              <div className="text-base-content/60 text-sm hidden md:block">
                Sorted by: {filters.sortBy.replace('_', ' ')} ({filters.sortOrder})
              </div>
            </div>

            {/* Dynamic View Modes */}
            {viewMode === "grid" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredprojects.map((project) => (
                  <ProjectGridCard key={project.id} project={project} isSearching={isSearching} />
                ))}
              </div>
            )}

            {viewMode === "list" && (
              <div className="space-y-6">
                {filteredprojects.map((project) => (
                  <ProjectListCard key={project.id} project={project} isSearching={isSearching} />
                ))}
              </div>
            )}

            {viewMode === "table" && (
              <div className="bg-base-100 border border-base-300/30 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-base-200/80 border-b border-base-300/30">
                      <tr className="text-base-content">
                        <th className="py-4 font-semibold">Article</th>
                        <th className="py-4 font-semibold">Author</th>
                        <th className="py-4 font-semibold">Views</th>
                        <th className="py-4 font-semibold">Status</th>
                        <th className="py-4 font-semibold">Date</th>
                        <th className="py-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredprojects.map((project) => (
                        <ProjectTableRow key={project.id} project={project} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 📄 Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-16">
          <button
            className="btn btn-outline btn-primary rounded-xl disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
          >
            ← Prev
          </button>

          <span className="text-base-content/70">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            className="btn btn-primary rounded-xl disabled:opacity-50"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={!pagination.hasNext}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}

// Component for Grid View
const ProjectGridCard = ({ project, isSearching }: { project: Project; isSearching: boolean }) => (
  <article className="group relative bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
    {project.is_featured && !isSearching && (
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-linear-to-r from-warning to-warning/80 text-warning-content px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-xs font-semibold">
          <Star className="w-3 h-3 fill-current" />
          Featured
        </div>
      </div>
    )}

    {isSearching && (
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-linear-to-r from-info to-info/80 text-info-content px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-xs font-semibold">
          <Search className="w-3 h-3" />
          Match
        </div>
      </div>
    )}

    {project.cover_image && (
      <figure className="relative h-48 overflow-hidden">
        <img
          src={project.cover_image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-base-100/20 to-transparent"></div>
      </figure>
    )}

    <div className="p-6 space-y-4">
      <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-14">
        {project.title}
      </h3>

      {project.excerpt && (
        <p className="text-base-content/70 text-sm leading-relaxed line-clamp-3">
          {project.excerpt}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-base-content/50 pt-2">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{project.view_count || 0} views</span>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href={`/projects/${project.slug}`}
          className="btn btn-primary btn-sm rounded-xl w-full group/btn transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Read More</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  </article>
);

// Component for List View
const ProjectListCard = ({ project, isSearching }: { project: Project; isSearching: boolean }) => (
  <article className="group bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div className="flex flex-col md:flex-row">
      {project.cover_image && (
        <div className="md:w-48 shrink-0">
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="flex-1 p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {project.is_featured && !isSearching && (
                <Star className="w-4 h-4 text-warning fill-current" />
              )}
              <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {project.title}
              </h3>
            </div>
            {project.excerpt && (
              <p className="text-base-content/70 text-sm leading-relaxed line-clamp-2 mb-3">
                {project.excerpt}
              </p>
            )}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="btn btn-primary btn-sm rounded-xl shrink-0 group/btn transition-all duration-300 transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs text-base-content/50">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{project.author_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{project.view_count || 0} views</span>
          </div>
        </div>
      </div>
    </div>
  </article>
);

// Component for Table View
const ProjectTableRow = ({ project }: { project: Project }) => (
  <tr className="hover:bg-base-200/50 transition-colors duration-200 group">
    <td className="py-4">
      <div className="flex items-center gap-3">
        {project.cover_image && (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-12 h-12 object-cover rounded-lg border border-base-300"
          />
        )}
        <div>
          <div className="font-semibold text-base-content group-hover:text-primary transition-colors duration-200">
            {project.title}
          </div>
          {project.excerpt && (
            <div className="text-sm text-base-content/60 line-clamp-1 mt-1">
              {project.excerpt}
            </div>
          )}
        </div>
      </div>
    </td>
    <td className="py-4">
      <div className="text-sm text-base-content/80">{project.author_name}</div>
    </td>
    <td className="py-4">
      <div className="flex items-center gap-1 text-sm">
        <Eye className="w-4 h-4 text-base-content/60" />
        {project.view_count || 0}
      </div>
    </td>
    <td className="py-4">
      <div className="flex items-center gap-2">
        {project.is_featured && (
          <Star className="w-4 h-4 text-warning fill-current" />
        )}
        <span className={`badge badge-sm capitalize ${
          project.is_featured ? 'badge-warning' : 'badge-outline'
        }`}>
          {project.is_featured ? 'Featured' : 'Standard'}
        </span>
      </div>
    </td>
    <td className="py-4">
      <div className="text-sm text-base-content/70">
        {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </td>
    <td className="py-4 text-center">
      <Link
        href={`/projects/${project.slug}`}
        className="btn btn-primary btn-sm rounded-lg group/btn transition-all duration-300 transform hover:scale-105"
      >
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
      </Link>
    </td>
  </tr>
);