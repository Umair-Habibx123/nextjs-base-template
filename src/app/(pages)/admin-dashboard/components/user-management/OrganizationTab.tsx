// src/app/pages/admin-dashboard/pages/components/OrganizationsTab.tsx
import React from "react";
import { Building, Edit, Trash2, Building2 } from "lucide-react";
import { Organization, Member } from "../../pages/UserManagement";

interface OrganizationsTabProps {
  organizations: Organization[];
  members: Member[];
  onEditOrg: (org: Organization) => void;
  onOpenConfirmModal: (type: "delete" | "ban" | "unban" | "remove", id: string) => void;
}

const OrganizationsTab: React.FC<OrganizationsTabProps> = ({
  organizations,
  members,
  onEditOrg,
  onOpenConfirmModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Organizations</h3>
        <button
          onClick={() => {/* implement add org */}}
          className="btn btn-primary btn-sm rounded-xl flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="card bg-base-100 border border-base-300/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="rounded-xl" />
                    ) : (
                      <Building className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">{org.name}</h3>
                  <p className="text-base-content/60">@{org.slug}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Members:</span>
                  <span className="font-semibold">
                    {members.filter((m) => m.organizationId === org.id).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Created:</span>
                  <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button
                  onClick={() => onEditOrg(org)}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenConfirmModal("delete", org.id)}
                  className="btn btn-ghost btn-sm text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsTab;