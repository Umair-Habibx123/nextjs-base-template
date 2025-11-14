// /app/admin/projects/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Image,
  Sparkles,
  RefreshCw,
  Filter,
  X,
  Star,
  User,
  Tag,
  Folder,
  EyeOff,
  BookOpen,
  TrendingUp,
  Zap,
  Briefcase,
  Loader2,
} from "lucide-react";
import ProjectForm from "../components/projects-management/ProjectForm";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal";
import Loading from "../../components/layout/Loading";

type Row = {
  id: number;
  title: string;
  cover_image: string | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  author_name: string;
  author_email: string;
  tags: string;
  categories: string;
  is_featured: number;
  view_count: number;
  excerpt: string;
  order_number: number | null;
};

type FilterState = {
  status: string;
  author: string;
  tags: string[];
  categories: string[];
  featured: string;
  dateRange: {
    start: string;
    end: string;
  };
};

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    author: "",
    tags: [],
    categories: [],
    featured: "",
    dateRange: {
      start: "",
      end: "",
    },
  });

  const fetchProjects = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
      else toast.error("Failed to load projects");
    } catch {
      toast.error("Network error while fetching projects");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Calculate stats
  const publishedCount = projects.filter(
    (b) => b.status === "published"
  ).length;
  const draftCount = projects.filter((b) => b.status === "draft").length;
  const featuredCount = projects.filter((b) => b.is_featured === 1).length;
  const totalViews = projects.reduce(
    (sum, project) => sum + (project.view_count || 0),
    0
  );
  const averageViews =
    projects.length > 0 ? Math.round(totalViews / projects.length) : 0;

  const stats = {
    totalProjects: projects.length,
    published: publishedCount,
    drafts: draftCount,
    featured: featuredCount,
    totalViews: totalViews,
    averageViews: averageViews,
  };

  const requestDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setConfirmLoading(true);
      const res = await fetch(`/api/admin/projects/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Project post deleted successfully");
        fetchProjects();
      } else toast.error("Failed to delete project post");
    } catch {
      toast.error("Network error while deleting");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Extract unique values for filters
  const uniqueAuthors = [
    ...new Set(projects.map((project) => project.author_name).filter(Boolean)),
  ];
  const allTags = projects
    .flatMap((project) => (project.tags ? project.tags.split(",") : []))
    .filter(Boolean);
  const uniqueTags = [...new Set(allTags)];
  const allCategories = projects
    .flatMap((project) =>
      project.categories ? project.categories.split(",") : []
    )
    .filter(Boolean);
  const uniqueCategories = [...new Set(allCategories)];

  // Apply filters
  const filteredProjects = projects.filter((project) => {
    // Search term filter
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.categories?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || project.status === filters.status;

    // Author filter
    const matchesAuthor =
      !filters.author || project.author_name === filters.author;

    // Tags filter
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) => project.tags?.includes(tag));

    // Categories filter
    const matchesCategories =
      filters.categories.length === 0 ||
      filters.categories.some((category) =>
        project.categories?.includes(category)
      );

    // Featured filter
    const matchesFeatured =
      !filters.featured ||
      (filters.featured === "featured" && project.is_featured === 1) ||
      (filters.featured === "not-featured" && project.is_featured === 0);

    // Date range filter
    const projectDate = new Date(project.createdAt);
    const matchesDateRange =
      (!filters.dateRange.start ||
        projectDate >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        projectDate <= new Date(filters.dateRange.end));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesAuthor &&
      matchesTags &&
      matchesCategories &&
      matchesFeatured &&
      matchesDateRange
    );
  });

  const clearFilters = () => {
    setFilters({
      status: "",
      author: "",
      tags: [],
      categories: [],
      featured: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
    setSearchTerm("");
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayFilter = (key: "tags" | "categories", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Briefcase className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            Project Management
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            Dynamic Editor with advanced filtering and analytics
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {statsLoading ? "Loading..." : `${stats.totalProjects} Projects`}
          </span>
        </div>
        {!editingProject && (
          <button
            onClick={() => setEditingProject({})}
            className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {"Refreshing..."}
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                {"New Project"}
              </>
            )}
          </button>
        )}
      </div>

      {/* 📊 Enhanced Stats Overview with Loading States */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : stats.totalProjects}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Total Projects
          </div>
        </div>

        {/* Published */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : stats.published}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Published
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : stats.drafts}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">Drafts</div>
        </div>

        {/* Featured */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-info" />
            <div className="text-2xl font-bold text-info">
              {statsLoading ? "..." : stats.featured}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Featured
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-warning" />
            <div className="text-2xl font-bold text-warning">
              {statsLoading ? "..." : stats.totalViews}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Total Views
          </div>
        </div>

        {/* Average Views */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-success" />
            <div className="text-2xl font-bold text-success">
              {statsLoading ? "..." : stats.averageViews}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Avg Views
          </div>
        </div>
      </div>

      {/* 🔍 Enhanced Search and Filters */}
      {!editingProject && (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search projects by title, excerpt, author, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50"
              />
              <span className="text-sm text-base-content/60 whitespace-nowrap">
                {filteredProjects.length} results
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn rounded-lg flex items-center gap-2 transition-transform ${
                  showFilters ? "btn-primary" : "btn-outline"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(filters.status ||
                  filters.author ||
                  filters.tags.length > 0 ||
                  filters.categories.length > 0 ||
                  filters.featured ||
                  filters.dateRange.start ||
                  filters.dateRange.end) && (
                  <span className="badge badge-primary badge-sm">
                    {
                      [
                        filters.status,
                        filters.author,
                        ...filters.tags,
                        ...filters.categories,
                        filters.featured,
                        filters.dateRange.start,
                        filters.dateRange.end,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>

              <button
                onClick={clearFilters}
                className="btn btn-outline rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
                disabled={
                  !searchTerm &&
                  !filters.status &&
                  !filters.author &&
                  filters.tags.length === 0 &&
                  filters.categories.length === 0 &&
                  !filters.featured &&
                  !filters.dateRange.start &&
                  !filters.dateRange.end
                }
              >
                <X className="w-4 h-4" />
                Clear
              </button>

              <button
                onClick={fetchProjects}
                className="btn btn-outline rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-base-200/30 rounded-xl border border-base-300/20">
              {/* Status Filter */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="select select-bordered w-full rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Author</span>
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => updateFilter("author", e.target.value)}
                  className="select select-bordered w-full rounded-lg"
                >
                  <option value="">All Authors</option>
                  {uniqueAuthors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Filter */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Featured</span>
                </label>
                <select
                  value={filters.featured}
                  onChange={(e) => updateFilter("featured", e.target.value)}
                  className="select select-bordered w-full rounded-lg"
                >
                  <option value="">All Projects</option>
                  <option value="featured">Featured Only</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Created After
                  </span>
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Tag and Category Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200/30 rounded-xl border border-base-300/20 mt-2">
              {/* Tags Filter */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Tags</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleArrayFilter("tags", tag)}
                      className={`badge badge-lg gap-2 cursor-pointer transition-all ${
                        filters.tags.includes(tag)
                          ? "badge-primary"
                          : "badge-outline"
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Categories</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleArrayFilter("categories", category)}
                      className={`badge badge-lg gap-2 cursor-pointer transition-all ${
                        filters.categories.includes(category)
                          ? "badge-secondary"
                          : "badge-outline"
                      }`}
                    >
                      <Folder className="w-3 h-3" />
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎨 Editor Panel */}
      {editingProject && (
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <ProjectForm
            initialData={editingProject}
            onCancel={() => setEditingProject(null)}
            onSaved={() => {
              setEditingProject(null);
              fetchProjects();
            }}
          />
        </div>
      )}

      {/* 📋 Enhanced Project List */}
      {!editingProject &&
        (loading ? (
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-16 text-center">
            <div className="space-y-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/70 text-lg">
                Loading projects...
              </p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-16 text-center">
            <Briefcase className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content/60 mb-2">
              {searchTerm ||
              Object.values(filters).some((filter) =>
                Array.isArray(filter)
                  ? filter.length > 0
                  : filter !== "" &&
                    (typeof filter !== "object" ||
                      Object.values(filter).some((v) => v !== ""))
              )
                ? "No matching projects found"
                : "No projects yet"}
            </h3>
            <p className="text-base-content/50 mb-6">
              {searchTerm ||
              Object.values(filters).some((filter) =>
                Array.isArray(filter)
                  ? filter.length > 0
                  : filter !== "" &&
                    (typeof filter !== "object" ||
                      Object.values(filter).some((v) => v !== ""))
              )
                ? "Try adjusting your search terms or filters"
                : "Create your first project to get started"}
            </p>
            {projects.length === 0 &&
              !searchTerm &&
              !Object.values(filters).some((filter) =>
                Array.isArray(filter)
                  ? filter.length > 0
                  : filter !== "" &&
                    (typeof filter !== "object" ||
                      Object.values(filter).some((v) => v !== ""))
              ) && (
                <button
                  onClick={() => setEditingProject({})}
                  className="btn btn-primary rounded-xl flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create First Project
                </button>
              )}
          </div>
        ) : (
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-500">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/80 border-b border-base-300/30">
                  <tr className="text-base font-semibold text-base-content">
                    <th className="bg-base-300/30 py-4 rounded-tl-2xl">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Project
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Author
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Cover
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Status & Views
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags & Categories
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Dates
                      </div>
                    </th>
                    <th className="bg-base-300/30 py-4 rounded-tr-2xl text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      className={`hover:bg-base-200/50 transition-all duration-200 group ${
                        index % 2 === 0 ? "bg-base-100/50" : "bg-base-200/30"
                      }`}
                    >
                      <td className="py-4 border-r border-base-300/20">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            {project.is_featured === 1 && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <div className="font-semibold text-base-content line-clamp-2">
                              {project.title || "Untitled"}
                            </div>
                          </div>
                          {project.excerpt && (
                            <div className="text-sm text-base-content/60 line-clamp-2 mt-1">
                              {project.excerpt}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-base-content/50">
                              ID: {project.id}
                            </div>
                            {project.order_number !== null && (
                              <div className="text-xs text-primary font-medium">
                                Order: {project.order_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {project.author_name || "Unknown"}
                          </div>
                          <div className="text-xs text-base-content/50">
                            {project.author_email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        {project.cover_image ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={project.cover_image}
                              alt="Cover"
                              className="w-16 h-12 object-cover rounded-lg border-2 border-base-300 shadow-sm hover:shadow-md transition-shadow"
                            />
                            <span className="text-xs text-base-content/60">
                              Cover
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-base-content/40">
                            <Image className="w-4 h-4" />
                            <span className="text-sm">No cover</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        <div className="space-y-2">
                          <span
                            className={`badge badge-lg capitalize ${
                              project.status === "published"
                                ? "badge-success text-success-content"
                                : "badge-warning text-warning-content"
                            }`}
                          >
                            {project.status === "published" ? (
                              <Eye className="w-3 h-3 mr-1" />
                            ) : (
                              <EyeOff className="w-3 h-3 mr-1" />
                            )}
                            {project.status}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-base-content/70">
                            <Eye className="w-3 h-3" />
                            {project.view_count || 0} views
                          </div>
                        </div>
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        <div className="space-y-2 max-w-xs">
                          {project.tags && (
                            <div className="flex flex-wrap gap-1">
                              {project.tags
                                .split(",")
                                .slice(0, 3)
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className="badge badge-outline badge-sm"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              {project.tags.split(",").length > 3 && (
                                <span className="badge badge-ghost badge-sm">
                                  +{project.tags.split(",").length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {project.categories && (
                            <div className="flex flex-wrap gap-1">
                              {project.categories
                                .split(",")
                                .slice(0, 2)
                                .map((cat) => (
                                  <span
                                    key={cat}
                                    className="badge badge-secondary badge-sm"
                                  >
                                    {cat.trim()}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 border-r border-base-300/20">
                        <div className="space-y-1 text-sm">
                          <div>
                            <div className="font-medium">Created:</div>
                            <div className="text-base-content/70">
                              {project.createdAt
                                ? new Date(
                                    project.createdAt
                                  ).toLocaleDateString()
                                : "—"}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Updated:</div>
                            <div className="text-base-content/70">
                              {project.updatedAt
                                ? new Date(
                                    project.updatedAt
                                  ).toLocaleDateString()
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="btn btn-outline btn-sm rounded-lg hover:btn-info hover:text-info-content transition-all duration-200 transform hover:scale-105 group-hover:shadow-lg"
                            onClick={async () => {
                              setLoading(true);
                              const res = await fetch(
                                `/api/admin/projects/${project.id}`
                              );
                              const data = await res.json();
                              setEditingProject(data);
                              setLoading(false);
                            }}
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-outline btn-sm rounded-lg hover:btn-error hover:text-error-content transition-all duration-200 transform hover:scale-105 group-hover:shadow-lg"
                            onClick={() => requestDelete(project.id)}
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
}
