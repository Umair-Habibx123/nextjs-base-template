"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Languages,
  RefreshCcw,
  Trash2,
  PlusCircle,
  Loader2,
  X,
  Globe,
  FileText,
  Edit3,
  Users,
  Sparkles,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Loading from "../../components/layout/Loading";
import ConfirmModal from "../../components/common/ConfirmModal";
import { debounce } from "lodash";

const LanguageManagerPage = () => {
  const [translations, setTranslations] = useState({});
  const [savingKeys, setSavingKeys] = useState(new Set());
  const [selectedLang, setSelectedLang] = useState("english");
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [langToDelete, setLangToDelete] = useState(null);

  // Modal states
  const [addLangModalOpen, setAddLangModalOpen] = useState(false);
  const [newLang, setNewLang] = useState("");
  const [validationError, setValidationError] = useState("");

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyUntranslated, setShowOnlyUntranslated] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [serverStats, setServerStats] = useState([]);
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      const res = await fetch("/api/super-admin/languages");
      const data = await res.json();
      if (data.success) {
        setTranslations(data.data);
        setServerStats(data.stats || []);
      } else {
        throw new Error(data.message || "Failed to load translations");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleSave = async (key, value) => {
    const res = await fetch("/api/super-admin/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang_code: selectedLang, key, value }),
    });

    if (!res.ok) {
      throw new Error("Failed to save translation");
    }

    return res.json();
  };

  // Save a single key's translation (on blur)
  const handleSaveTranslation = async (key, value) => {
    setSavingKeys((prev) => new Set(prev).add(key));
    try {
      await handleSave(key, value);
    } catch (error) {
      console.error("Failed to save translation:", error);
      toast.error(t("Failed to save translation for: ") + key);
    } finally {
      setSavingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // Handle typing (local update only)
  const handleTranslationChange = (key, value) => {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: {
        ...prev[selectedLang],
        [key]: value,
      },
    }));
  };

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showOnlyUntranslated, selectedLang]);

  const handleConfirmDelete = async () => {
    if (!langToDelete) return;
    try {
      setConfirmLoading(true);
      await fetch(`/api/super-admin/languages/${langToDelete}`, {
        method: "DELETE",
      });
      toast.success(t("Language deleted successfully!"));
      await fetchTranslations();
      if (selectedLang === langToDelete) {
        setSelectedLang("english");
      }
      window.dispatchEvent(new Event("translationsUpdated"));
    } catch {
      toast.error(t("Failed to delete language"));
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setLangToDelete(null);
    }
  };

  const requestDeleteLang = (lang) => {
    setLangToDelete(lang);
    setConfirmOpen(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/languages/extract");
      const data = await res.json();
      if (data.success) {
        toast.success(t("Keys refreshed successfully!"));
        await fetchTranslations();
        window.dispatchEvent(new Event("translationsUpdated"));
      } else {
        throw new Error(data.message || "Failed to refresh translations");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced language validation
  const validateLanguageCode = (code) => {
    if (!code.trim()) {
      return t("Language code is required");
    }

    // Only allow letters, numbers, and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(code)) {
      return t("Only letters, numbers, and underscores are allowed");
    }

    // Check if it's a valid ISO code (2-3 letters) or common language name
    if (code.length < 2 || code.length > 20) {
      return t("Language code must be between 2 and 20 characters");
    }

    // Check for reserved names
    const reservedNames = ["english", "base", "default", "admin", "system"];
    if (reservedNames.includes(code.toLowerCase())) {
      return t("This language code is reserved");
    }

    return "";
  };

  const handleCreateLang = () => {
    const error = validateLanguageCode(newLang);
    if (error) {
      setValidationError(error);
      return;
    }

    if (translations[newLang]) {
      toast.info(t("Language already exists!"));
      setSelectedLang(newLang);
      setAddLangModalOpen(false);
      setNewLang("");
      setValidationError("");
      return;
    }

    setTranslations((prev) => ({
      ...prev,
      [newLang]: {},
    }));
    setSelectedLang(newLang);
    toast.success(t("New language added!"));
    setAddLangModalOpen(false);
    setNewLang("");
    setValidationError("");
  };

  const handleNewLangChange = (value) => {
    setNewLang(value.toLowerCase());
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(validateLanguageCode(value));
    }
  };

  const englishBase = translations["english"] || {};
  const selectedLangData = translations[selectedLang] || {};

  // Filter translation keys based on search and filter
  const filteredKeys = useMemo(() => {
    return Object.entries(englishBase).filter(([key, value]) => {
      const matchesSearch =
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase());

      if (showOnlyUntranslated && selectedLang !== "english") {
        const isTranslated =
          selectedLangData[key] && selectedLangData[key].trim() !== "";
        return matchesSearch && !isTranslated;
      }

      return matchesSearch;
    });
  }, [
    englishBase,
    searchTerm,
    showOnlyUntranslated,
    selectedLangData,
    selectedLang,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

  // Stats calculation
  const selectedStats = serverStats.find((s) => s.lang === selectedLang);
  const totalLanguages = serverStats.length;
  const totalKeys = selectedStats?.totalKeys || 0;
  const translatedKeys = selectedStats?.translatedCount || 0;

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/30">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-base-content/70">
          {t("Showing")} {startIndex + 1}-
          {Math.min(endIndex, filteredKeys.length)} {t("of")}{" "}
          {filteredKeys.length} {t("keys")}
        </span>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="select select-bordered select-sm rounded-lg"
        >
          <option value={25}>25 {t("per page")}</option>
          <option value={50}>50 {t("per page")}</option>
          <option value={100}>100 {t("per page")}</option>
          <option value={200}>200 {t("per page")}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 mx-2">
          <span className="text-sm text-base-content/70">
            {t("Page")} {currentPage} {t("of")} {totalPages}
          </span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌍 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Globe className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Language Manager")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Manage and edit your multilingual translations easily.")}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Refreshing...")}
              </>
            ) : (
              <>
                <RefreshCcw className="w-5 h-5" />
                {t("Refresh Keys")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 📊 Stats Overview with Loading States */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Announcements */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : totalLanguages}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Languages")}
          </div>
        </div>

        {/* Active Now */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : totalKeys}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Trasnlation Keys")}
          </div>
        </div>

        {/* Saved Templates */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : translatedKeys}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Trasnlated")}
          </div>
        </div>

        {/* Current Theme */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-info" />
            <div className="text-2xl font-bold text-info">
              {statsLoading
                ? "..."
                : totalKeys > 0
                ? Math.round((translatedKeys / totalKeys) * 100)
                : 0}
              %
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Completion")}
          </div>
        </div>
      </div>

      {/* 🗃 Languages Table */}
      <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Languages className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
              {t("Languages")}
            </h2>
          </div>
          <button
            onClick={() => setAddLangModalOpen(true)}
            className="btn btn-success rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {t("Add Language")}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading message="Loading languages..." />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-base-300/30">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200/80">
                <tr className="text-base font-semibold text-base-content border-b border-base-300/30">
                  <th className="rounded-tl-2xl bg-base-300/30 py-4">
                    {t("Language")}
                  </th>
                  <th className="bg-base-300/30 py-4">{t("Code")}</th>
                  <th className="bg-base-300/30 py-4">
                    {t("Translated Keys")}
                  </th>
                  <th className="bg-base-300/30 py-4">{t("Completion")}</th>
                  <th className="rounded-tr-2xl bg-base-300/30 py-4">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(translations).map(([langCode, langData]) => {
                  const isEnglish = langCode === "english";
                  const langStats = serverStats.find(
                    (s) => s.lang === langCode
                  );
                  const translatedCount = langStats?.translatedCount || 0;
                  const totalCount = langStats?.totalKeys || 0;
                  const completion = langStats?.completion || 0;

                  const isSelected = selectedLang === langCode;

                  return (
                    <tr
                      key={langCode}
                      className={`hover:bg-base-200/50 transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : ""
                      }`}
                    >
                      <td className="py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isEnglish ? "bg-primary" : "bg-secondary"
                            }`}
                          ></div>
                          {langCode.charAt(0).toUpperCase() + langCode.slice(1)}
                          {isEnglish && (
                            <span className="badge badge-primary badge-sm">
                              Base
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <code className="bg-base-300/50 px-2 py-1 rounded text-sm">
                          {langCode}
                        </code>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {translatedCount}
                          </span>
                          <span className="text-base-content/60">/</span>
                          <span>{totalCount}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-base-300 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                completion === 100
                                  ? "bg-success"
                                  : completion >= 50
                                  ? "bg-warning"
                                  : "bg-error"
                              }`}
                              style={{ width: `${completion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12">
                            {completion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedLang(langCode);
                              setTranslationModalOpen(true);
                            }}
                            className={`btn btn-sm rounded-lg flex items-center gap-2 ${
                              isSelected ? "btn-primary" : "btn-outline"
                            }`}
                          >
                            <Edit3 className="w-4 h-4" />
                            {isSelected ? t("Editing") : t("Edit")}
                          </button>

                          {!isEnglish && (
                            <button
                              onClick={() => requestDeleteLang(langCode)}
                              className="btn btn-error btn-outline btn-sm rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {translationModalOpen && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box w-11/12 max-w-11/12 h-[95vh] p-0 overflow-hidden bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-base-300/30 bg-base-200/50">
              <div className="flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                  {selectedLang === "english"
                    ? t("English Base Language")
                    : `${t("Editing")} "${
                        selectedLang.charAt(0).toUpperCase() +
                        selectedLang.slice(1)
                      }" ${t("Translations")}`}
                </h3>
              </div>
              <button
                onClick={() => setTranslationModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {selectedLang === "english" ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-base-content/90">
                      {t("English Base Language")}
                    </h2>
                    <span className="badge badge-primary badge-lg font-semibold">
                      {totalKeys} {t("keys")}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-base-300/30">
                    <table className="table table-zebra w-full">
                      <thead className="bg-base-200/80">
                        <tr className="text-base font-semibold text-base-content border-b border-base-300/30">
                          <th className="rounded-tl-2xl bg-base-300/30 py-4">
                            {t("Key")}
                          </th>
                          <th className="rounded-tr-2xl bg-base-300/30 py-4">
                            {t("Value")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(englishBase).map(([key, val]) => (
                          <tr
                            key={key}
                            className="hover:bg-base-200/50 transition-colors"
                          >
                            <td className="font-mono text-sm font-medium py-3 border-r border-base-300/20">
                              {key}
                            </td>
                            <td className="py-3">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Top Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-base-content/60 text-sm">
                        {translatedKeys} of {totalKeys} {t("keys translated")} (
                        {Math.round((translatedKeys / totalKeys) * 100)}%)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                        <input
                          type="text"
                          placeholder={t("Search keys or values...")}
                          className="input input-bordered pl-10 pr-4 w-full sm:w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {/* Filter Toggle */}
                      <label className="cursor-pointer label justify-start gap-2 bg-base-200/50 rounded-lg px-4 border border-base-300/30">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={showOnlyUntranslated}
                          onChange={(e) =>
                            setShowOnlyUntranslated(e.target.checked)
                          }
                        />
                        <span className="label-text font-medium">
                          {t("Show only untranslated")}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                    <div className="flex items-center gap-2 text-info text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {t("Auto-save enabled")} •{" "}
                        {t("Changes are saved automatically as you type")}
                      </span>
                    </div>
                  </div>

                  {/* Pagination Controls - Top */}
                  {filteredKeys.length > 0 && <PaginationControls />}

                  <div className="overflow-x-auto rounded-2xl border border-base-300/30 max-h-[55vh] overflow-y-auto">
                    <table className="table table-zebra w-full">
                      <thead className="bg-base-200/80 sticky top-0 z-10">
                        <tr className="text-base font-semibold text-base-content border-b border-base-300/30">
                          <th className="rounded-tl-2xl bg-base-300/30 py-4">
                            {t("Key")}
                          </th>
                          <th className="bg-base-300/30 py-4">
                            {t("English")}
                          </th>
                          <th className="rounded-tr-2xl bg-base-300/30 py-4 w-1/2">
                            {selectedLang.toUpperCase()}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedKeys.map(([key, enValue]) => {
                          const isTranslated =
                            selectedLangData[key] &&
                            selectedLangData[key].trim() !== "";
                          const isSaving = savingKeys.has(key);

                          return (
                            <tr
                              key={key}
                              className="hover:bg-base-200/50 transition-colors group"
                            >
                              <td className="font-mono text-sm font-medium py-3 border-r border-base-300/20">
                                <div className="flex items-center gap-2">
                                  {key}
                                  {!isTranslated && (
                                    <span className="badge badge-warning badge-xs">
                                      {t("Missing")}
                                    </span>
                                  )}
                                  {isSaving && (
                                    <Loader2 className="w-3 h-3 animate-spin text-warning" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 border-r border-base-300/20">
                                <div className="text-sm leading-relaxed">
                                  {enValue}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="relative">
                                  <textarea
                                    className={`textarea textarea-bordered w-full min-h-20 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50 bg-base-100 resize-y font-medium text-base leading-relaxed ${
                                      isSaving ? "border-warning" : ""
                                    }`}
                                    value={selectedLangData[key] || ""}
                                    onChange={(e) =>
                                      handleTranslationChange(
                                        key,
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val !== "")
                                        handleSaveTranslation(key, val);
                                    }}
                                    placeholder={`${t(
                                      "Translate"
                                    )}: "${enValue}"`}
                                    rows={3}
                                  />
                                  {isSaving && (
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-warning text-xs">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      {t("Saving...")}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls - Bottom */}
                  {filteredKeys.length > 0 && <PaginationControls />}

                  <div className="mt-6 pt-6 border-t border-base-300/30 text-sm text-base-content/60 text-center">
                    {t("Changes are automatically saved as you type")} •{" "}
                    {translatedKeys} {t("of")} {totalKeys}{" "}
                    {t("keys translated")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ Modern Add Language Modal */}
      {addLangModalOpen && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-md p-0 overflow-hidden bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-base-300/30 bg-base-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success/20 text-success">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                  {t("Add New Language")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddLangModalOpen(false);
                  setValidationError("");
                  setNewLang("");
                }}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="label">
                  <span className="label-text font-semibold text-base">
                    {t("Language Code")}
                  </span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-primary/50 border-base-300/50 ${
                    validationError ? "input-error" : ""
                  }`}
                  placeholder="e.g. french, german, spanish"
                  value={newLang}
                  onChange={(e) => handleNewLangChange(e.target.value)}
                  autoFocus
                />
                {validationError && (
                  <div className="text-error text-sm flex items-center gap-2 mt-1">
                    <X className="w-4 h-4" />
                    {validationError}
                  </div>
                )}
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    {t(
                      "Use 2-20 characters, letters, numbers, and underscores only"
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-base-200/30 rounded-xl p-4 border border-base-300/20">
                <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                  <Sparkles className="w-4 h-4 text-info" />
                  <span className="font-medium">{t("Pro Tip")}</span>
                </div>
                <p className="text-sm text-base-content/60">
                  {t(
                    "Use ISO language codes for better compatibility. Example: 'fr' for French, 'de' for German, 'es' for Spanish."
                  )}
                </p>
              </div>

              <div className="modal-action flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setAddLangModalOpen(false);
                    setValidationError("");
                    setNewLang("");
                  }}
                  className="btn btn-ghost rounded-xl flex-1 border-base-300/50 hover:bg-base-300/50 transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleCreateLang}
                  className="btn btn-success rounded-xl flex-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={!newLang.trim() || !!validationError}
                >
                  <PlusCircle className="w-5 h-5" />
                  {t("Add Language")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Language Deletion")}
        message={t(
          `Are you sure you want to delete "${langToDelete}" language?`
        )}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
};

export default LanguageManagerPage;
