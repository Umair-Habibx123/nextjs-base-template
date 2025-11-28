// src/app/pages/super-admin-dashboard/pages/components/UsersTab.tsx
import React from "react";
import { User, Edit, Ban, Unlock, Trash2, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { User as UserType } from "../../pages/UserManagement";

interface UsersTabProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
  onOpenConfirmModal: (type: "delete" | "ban" | "unban" | "remove", id: string, user?: UserType) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onEditUser, onOpenConfirmModal }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">User Accounts</h3>
        <button
          onClick={() => {/* implement add user */}}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-300/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-base-200/30">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-base-content/60">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        user.role === "admin" ? "badge-warning" :
                        user.role === "superadmin" ? "badge-error" : "badge-primary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.banned ? (
                      <span className="badge badge-error badge-sm">Banned</span>
                    ) : (
                      <span className="badge badge-success badge-sm">Active</span>
                    )}
                  </td>
                  <td>
                    {user.emailVerified ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error" />
                    )}
                  </td>
                  <td>
                    <div className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="btn btn-ghost btn-xs"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.banned ? (
                        <button
                          onClick={() => onOpenConfirmModal("unban", user.id, user)}
                          className="btn btn-ghost btn-xs text-success"
                          title="Unban User"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenConfirmModal("ban", user.id, user)}
                          className="btn btn-ghost btn-xs text-warning"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenConfirmModal("delete", user.id, user)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete User"
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
    </div>
  );
};

export default UsersTab;