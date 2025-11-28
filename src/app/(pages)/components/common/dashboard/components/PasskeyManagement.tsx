"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/client";
import type { Passkey as BetterAuthPasskey } from "@better-auth/passkey";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import {
  Fingerprint,
  Loader2,
  Sparkles,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

type Passkey = BetterAuthPasskey;

const PasskeyManagement = () => {
  const { t } = useTranslation();

  // Passkey Management States
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [editingPasskey, setEditingPasskey] = useState<string | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState<string | null>(null);

  // Fetch user's passkeys
  const fetchPasskeys = async () => {
    setPasskeyLoading(true);
    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) throw new Error(error.message);
      setPasskeys(data || []);
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Add new passkey
  const addPasskey = async () => {
    if (!newPasskeyName.trim()) {
      toast.error("Please enter a passkey name");
      return;
    }

    setAddingPasskey(true);
    try {
      const { data, error } = await authClient.passkey.addPasskey({
        name: newPasskeyName.trim(),
      });

      if (error) throw new Error(error.message);

      toast.success("Passkey added successfully!");
      setNewPasskeyName("");
      fetchPasskeys(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setAddingPasskey(false);
    }
  };

  // Update passkey name
  const updatePasskey = async (id: string, name: string) => {
    if (!name.trim()) {
      toast.error("Passkey name cannot be empty");
      return;
    }

    try {
      const { data, error } = await authClient.passkey.updatePasskey({
        id,
        name: name.trim(),
      });

      if (error) throw new Error(error.message);

      toast.success("Passkey updated successfully!");
      setEditingPasskey(null);
      fetchPasskeys(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    }
  };

  // Delete passkey
  const deletePasskey = async (id: string) => {
    try {
      const { data, error } = await authClient.passkey.deletePasskey({
        id,
      });

      if (error) throw new Error(error.message);

      toast.success("Passkey deleted successfully!");
      setDeleteConfirmOpen(false);
      setPasskeyToDelete(null);
      fetchPasskeys(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Passkey Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-success/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-success to-success/80 text-success-content shadow-lg">
          <Fingerprint className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Passkey Management")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Use biometrics or device PIN for secure, passwordless login.")}
          </p>
        </div>
        <div className="px-4 py-2 rounded-full border font-semibold bg-success/10 border-success/20 text-success">
          {passkeys.length} {t("Passkeys")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🔐 Passkey Setup & Management */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-success/10 text-success">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Add New Passkey")}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">
                    {t("Passkey Name")}
                  </span>
                </label>
                <input
                  type=""
                  value={newPasskeyName}
                  autoComplete="new-password"
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  placeholder={t("e.g., iPhone Face ID, Windows Hello")}
                  className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-success/50 bg-base-200/50"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addPasskey();
                    }
                  }}
                />
              </div>

              <button
                onClick={addPasskey}
                disabled={addingPasskey || !newPasskeyName.trim()}
                className="btn btn-success btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                {addingPasskey ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {t("Add Passkey")}
              </button>
            </div>
          </div>

          {/* 📱 Passkey Benefits */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                {t("Why Use Passkeys?")}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                t("Passwordless login with biometrics or PIN"),
                t("Phishing-resistant and more secure than passwords"),
                t("Syncs securely across your devices"),
                t("No passwords to remember or type"),
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span className="text-base-content/70 text-sm">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📋 Passkeys List */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-base-content">
                  {t("Your Passkeys")}
                </h3>
              </div>
              <div className="badge badge-primary badge-lg font-semibold">
                {passkeys.length}
              </div>
            </div>

            {passkeyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : passkeys.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-base-300 rounded-xl">
                <Fingerprint className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-base-content/50 font-medium">
                  {t("No passkeys yet")}
                </p>
                <p className="text-base-content/40 text-sm mt-1">
                  {t("Add your first passkey for passwordless login")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {passkeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/20 hover:border-base-300/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Fingerprint className="w-5 h-5 text-success shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingPasskey === passkey.id ? (
                          <input
                            type="text"
                            defaultValue={passkey.name}
                            onBlur={(e) =>
                              updatePasskey(passkey.id, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updatePasskey(passkey.id, e.currentTarget.value);
                              }
                            }}
                            className="input input-sm input-bordered w-full bg-base-100"
                            autoFocus
                          />
                        ) : (
                          <div className="space-y-1">
                            <p className="font-semibold text-base-content truncate">
                              {passkey.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-base-content/50">
                              <span>{passkey.deviceType}</span>
                              <span>•</span>
                              <span>
                                {t("Created")}{" "}
                                {new Date(passkey.createdAt).toLocaleDateString()}
                              </span>
                              {passkey.backedUp && (
                                <>
                                  <span>•</span>
                                  <span className="text-success font-medium">
                                    {t("Backed up")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => setEditingPasskey(passkey.id)}
                        className="btn btn-ghost btn-sm text-base-content/60 hover:text-warning hover:bg-warning/10"
                        title={t("Edit name")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPasskeyToDelete(passkey.id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="btn btn-ghost btn-sm text-base-content/60 hover:text-error hover:bg-error/10"
                        title={t("Delete passkey")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ⚠️ Security Notice */}
          <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-warning mb-1">
                  {t("Security Notice")}
                </p>
                <p className="text-xs text-base-content/70">
                  {t(
                    "Keep your passkeys secure. Anyone with access to your registered devices can log into your account."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Passkey Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        title={t("Delete Passkey")}
        message={t(
          "Are you sure you want to delete this passkey? You won't be able to use it for login anymore."
        )}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={() => passkeyToDelete && deletePasskey(passkeyToDelete)}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPasskeyToDelete(null);
        }}
        loading={addingPasskey}
      />
    </section>
  );
};

export default PasskeyManagement;