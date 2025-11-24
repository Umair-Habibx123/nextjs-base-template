"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Table } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/10 backdrop-blur-md z-1000 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md border border-base-300/30 p-6 space-y-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-warning/10 text-warning">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-base-content">
                {title}
              </h2>
            </div>

            {/* Message */}
            <p className="text-base-content/70 leading-relaxed">{message}</p>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                className="btn btn-ghost rounded-lg"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                className={`btn btn-error rounded-lg flex items-center gap-2 ${
                  loading ? "loading" : ""
                }`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
