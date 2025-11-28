"use client";

import React from "react";
import {
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Loading from "../../../components/layout/Loading";

const AnnouncementList = ({
  list,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { t } = useTranslation();

  const activeCount = list.filter((a) => a.is_active).length;

  return (
    <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
              {t("Announcements")}
            </h2>
            <p className="text-base-content/60 text-sm">
              {activeCount} {t("active")} • {list.length} {t("total")}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Loading message={t("Fetching announcements...")} />
      ) : (
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t("No announcements yet")}</p>
              <p className="text-sm">
                {t("Create your first announcement using the button above")}
              </p>
            </div>
          ) : (
            list.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:shadow-lg ${
                  a.is_active
                    ? "bg-success/10 border-success/20 hover:bg-success/15"
                    : "bg-base-200/50 border-base-300/30 hover:bg-base-200/70"
                }`}
              >
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      a.is_active ? "text-base-content" : "text-base-content/60"
                    }`}
                  >
                    {a.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`badge badge-sm ${
                        a.is_active ? "badge-success" : "badge-outline"
                      }`}
                    >
                      {a.is_active ? t("Active") : t("Hidden")}
                    </span>
                    <span className="text-xs text-base-content/40">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    className="btn btn-square btn-sm btn-outline hover:btn-warning hover:text-warning-content"
                    onClick={() => onEdit(a)}
                    title={t("Edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-square btn-sm btn-outline hover:btn-info hover:text-info-content"
                    onClick={() => onToggleActive(a)}
                    title={a.is_active ? t("Hide") : t("Show")}
                  >
                    {a.is_active ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                  </button>
                  <button
                    className="btn btn-square btn-sm btn-outline hover:btn-error hover:text-error-content"
                    onClick={() => onDelete(a.id)} 
                    title={t("Delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;