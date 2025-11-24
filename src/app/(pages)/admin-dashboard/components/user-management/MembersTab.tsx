// src/app/pages/admin-dashboard/pages/components/MembersTab.tsx
import React from "react";
import { User, Building2, Shield, Trash2, UserCheck } from "lucide-react";
import { Member } from "../../pages/UserManagement";

interface MembersTabProps {
  members: Member[];
  onOpenConfirmModal: (type: "delete" | "ban" | "unban" | "remove", id: string) => void;
}

const MembersTab: React.FC<MembersTabProps> = ({ members, onOpenConfirmModal }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Organization Members</h3>
        <button
          onClick={() => {/* implement add member */}}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-300/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>User</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-base-200/30">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {member.user?.image ? (
                            <img src={member.user.image} alt={member.user.name} className="rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{member.user?.name}</div>
                        <div className="text-sm text-base-content/60">{member.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-base-content/60" />
                      <span>{member.organization?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        member.role === "owner" ? "badge-warning" :
                        member.role === "admin" ? "badge-primary" : "badge-secondary"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">{new Date(member.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* implement role change */}}
                        className="btn btn-ghost btn-xs"
                        title="Change Role"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenConfirmModal("remove", member.id)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Remove Member"
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

export default MembersTab;