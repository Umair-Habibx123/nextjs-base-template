// src/app/(pages)/signup/components/RoleSelectionStep.jsx
import React from "react";
import { Check, Building2, Users, User, Shield, ArrowRight, Heart, Crown, Settings } from "lucide-react";

const RoleSelectionStep = ({ availableRoles, selectedRole, onRoleSelect, onNextStep }) => {
  const getRoleIcon = (roleValue) => {
    const roleIcons = {
      "superadmin": Crown,
      "admin": Settings,
      "org_superadmin": Building2,
      "org_admin": Shield,
      "customer": Users,
      "patient": Heart
    };

    const IconComponent = roleIcons[roleValue] || User;
    return <IconComponent className="w-6 h-6" />;
  };

  const getRoleColor = (role) => {
    return role.color || "#4287f5";
  };

  const getRoleBadge = (role) => {
    if (role.scope === "system") {
      return { text: "System", color: "bg-error/20 text-error" };
    } else if (role.scope === "organization") {
      return { text: "Organization", color: "bg-success/20 text-success" };
    } else {
      return { text: "Public", color: "bg-info/20 text-info" };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-4">
        <p className="text-base-content/70">
          Choose your account type. You can always update your profile later.
        </p>
      </div>

      <div className="grid gap-4">
        {availableRoles.map((role) => {
          const badge = getRoleBadge(role);
          return (
            <div
              key={role.value}
              className={`card card-side border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                selectedRole === role.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-base-300 bg-base-200/50 hover:border-primary/50"
              }`}
              onClick={() => onRoleSelect(role.value)}
              style={{
                borderColor: selectedRole === role.value ? getRoleColor(role) : undefined
              }}
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl transition-colors ${
                        selectedRole === role.value
                          ? "text-white"
                          : "bg-base-300 text-base-content"
                      }`}
                      style={{
                        backgroundColor: selectedRole === role.value ? getRoleColor(role) : undefined
                      }}
                    >
                      {getRoleIcon(role.value)}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base-content">{role.label}</h3>
                        <span className={`badge badge-sm ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/70">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedRole === role.value
                        ? "text-white"
                        : "border-base-300"
                    }`}
                    style={{
                      backgroundColor: selectedRole === role.value ? getRoleColor(role) : undefined,
                      borderColor: selectedRole === role.value ? getRoleColor(role) : undefined
                    }}
                  >
                    {selectedRole === role.value && <Check className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Details */}
      {selectedRole && (
        <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/30">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getRoleColor(availableRoles.find(r => r.value === selectedRole)) }}
            ></div>
            <h4 className="font-semibold text-base-content">
              {availableRoles.find(r => r.value === selectedRole)?.label} Details
            </h4>
          </div>
          <p className="text-sm text-base-content/70">
            {availableRoles.find(r => r.value === selectedRole)?.description}
          </p>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNextStep}
          className="btn btn-primary rounded-xl flex items-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionStep;