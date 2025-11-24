// src/app/pages/admin-dashboard/pages/components/StatsOverview.tsx
import React from "react";
import { Users, UserCheck, Building2, CheckCircle, Ban } from "lucide-react";
import { Stats } from "../../pages/UserManagement";

interface StatsOverviewProps {
  stats: Stats;
  statsLoading: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, statsLoading }) => {
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-success",
    },
    {
      label: "Organizations",
      value: stats.totalOrganizations,
      icon: Building2,
      color: "text-secondary",
    },
    {
      label: "Members",
      value: stats.totalMembers,
      icon: UserCheck,
      color: "text-info",
    },
    {
      label: "Verified",
      value: stats.verifiedUsers,
      icon: CheckCircle,
      color: "text-accent",
    },
    {
      label: "Banned",
      value: stats.bannedUsers,
      icon: Ban,
      color: "text-error",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex justify-center items-center gap-2 mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className={`text-2xl font-bold ${stat.color}`}>
              {statsLoading ? "..." : stat.value}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;