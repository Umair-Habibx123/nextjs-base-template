// src/app/pages/admin-dashboard/pages/UserManagement.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  RefreshCw,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal";
import { authClient } from "@/lib/client";
import UsersTab from "../components/user-management/UserTab";
import OrganizationsTab from "../components/user-management/OrganizationTab";
import MembersTab from "../components/user-management/MembersTab";
import StatsOverview from "../components/user-management/StatsOverview";
import SearchFilters from "../components/user-management/SearchFilters";

// Types (move to separate types file if needed)
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  metadata?: any;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user?: User;
  organization?: Organization;
}

export interface Stats {
  totalUsers: number;
  totalOrganizations: number;
  totalMembers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<
    "users" | "organizations" | "members"
  >("users");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalMembers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    verifiedUsers: 0,
  });

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    verified: "",
  });

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "delete" | "ban" | "unban" | "remove"
  >("delete");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadOrganizations(), loadMembers()]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const usersResponse = await loadUsers({ pageSize: 1000 });
      const orgs = await loadOrganizations();
      const members = await loadMembers();

      const verifiedUsers = usersResponse.users.filter(
        (u) => u.emailVerified
      ).length;
      const bannedUsers = usersResponse.users.filter((u) => u.banned).length;

      setStats({
        totalUsers: usersResponse.users.length,
        totalOrganizations: orgs.length,
        totalMembers: members.length,
        activeUsers: usersResponse.users.length - bannedUsers,
        bannedUsers,
        verifiedUsers,
      });
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async (options?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    filters?: { role?: string; status?: string; verified?: string };
  }) => {
    try {
      const {
        searchTerm = "",
        page = 1,
        pageSize = 50,
        filters = {},
      } = options || {};

      const query: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sortBy: "createdAt",
        sortDirection: "desc",
      };

      if (searchTerm) {
        query.searchValue = searchTerm;
        query.searchField = "name";
        query.searchOperator = "contains";
      }

      // Add filters (same as before)
      if (filters.role) {
        query.filterField = "role";
        query.filterValue = filters.role;
        query.filterOperator = "eq";
      }

      if (filters.status === "banned") {
        query.filterField = "banned";
        query.filterValue = true;
        query.filterOperator = "eq";
      } else if (filters.status === "active") {
        query.filterField = "banned";
        query.filterValue = false;
        query.filterOperator = "eq";
      }

      if (filters.verified === "verified") {
        query.filterField = "emailVerified";
        query.filterValue = true;
        query.filterOperator = "eq";
      } else if (filters.verified === "unverified") {
        query.filterField = "emailVerified";
        query.filterValue = false;
        query.filterOperator = "eq";
      }

      const { data, error } = await authClient.admin.listUsers({ query });

      if (error) throw new Error(error.message);

      const users: User[] = (data.users || []).map((user) => ({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        emailVerified: user.emailVerified || false,
        image: user.image,
        role: user.role || "user",
        banned: user.banned || false,
        banReason: user.banReason,
        banExpires: user.banExpires
          ? new Date(user.banExpires).toISOString()
          : undefined,
        createdAt:
          typeof user.createdAt === "string"
            ? user.createdAt
            : new Date(user.createdAt || new Date()).toISOString(),
        updatedAt:
          typeof user.updatedAt === "string"
            ? user.updatedAt
            : new Date(user.updatedAt || new Date()).toISOString(),
      }));

      const total = data.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      setUsers(users);
      return { users, total, page, totalPages };
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
      return { users: [], total: 0, page: 1, totalPages: 0 };
    }
  };

  const loadOrganizations = async (): Promise<Organization[]> => {
    try {
      const { data, error } = await authClient.organization.list({
        query: {
          limit: 1000,
          offset: 0,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (error) throw new Error(error.message);

      const organizations: Organization[] = (data || []).map((org: any) => ({
        id: org.id || "",
        name: org.name || "",
        slug: org.slug || "",
        logo: org.logo,
        createdAt: org.createdAt || new Date().toISOString(),
        metadata: org.metadata,
      }));

      setOrganizations(organizations);
      return organizations;
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations");
      return [];
    }
  };

  const loadMembers = async (): Promise<Member[]> => {
    try {
      const { data, error } = await authClient.organization.listMembers({
        query: {
          limit: 1000,
          offset: 0,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (error) throw new Error(error.message);

      const members: Member[] = (data.members || []).map((member: any) => ({
        id: member.id || "",
        organizationId: member.organizationId || "",
        userId: member.userId || "",
        role: member.role || "",
        createdAt: member.createdAt || new Date().toISOString(),
        user: member.user
          ? {
              id: member.user.id || "",
              name: member.user.name || "",
              email: member.user.email || "",
              emailVerified: member.user.emailVerified || false,
              image: member.user.image,
              role: member.user.role || "user",
              banned: member.user.banned || false,
              banReason: member.user.banReason,
              banExpires: member.user.banExpires
                ? new Date(member.user.banExpires).toISOString()
                : undefined,
              createdAt: member.user.createdAt || new Date().toISOString(),
              updatedAt: member.user.updatedAt || new Date().toISOString(),
            }
          : undefined,
        organization: member.organization
          ? {
              id: member.organization.id || "",
              name: member.organization.name || "",
              slug: member.organization.slug || "",
              logo: member.organization.logo,
              createdAt:
                member.organization.createdAt || new Date().toISOString(),
              metadata: member.organization.metadata,
            }
          : undefined,
      }));

      setMembers(members);
      return members;
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
      return [];
    }
  };

  // Action handlers
  const handleConfirmAction = async () => {
    setConfirmLoading(true);
    try {
      // Implementation remains the same
      // ... (your existing handleConfirmAction logic)
    } catch (error) {
      // Error handled in individual functions
    } finally {
      setConfirmLoading(false);
    }
  };

  const openConfirmModal = (
    type: "delete" | "ban" | "unban" | "remove",
    id: string,
    user?: User
  ) => {
    setActionType(type);
    setSelectedId(id);
    setSelectedUser(user || null);
    setConfirmOpen(true);
  };

  // Filter functions
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus =
      !filters.status ||
      (filters.status === "banned" ? user.banned : !user.banned);
    const matchesVerified =
      !filters.verified ||
      (filters.verified === "verified"
        ? user.emailVerified
        : !user.emailVerified);
    return matchesSearch && matchesRole && matchesStatus && matchesVerified;
  });

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = members.filter(
    (member) =>
      member.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Users className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            Manage users, organizations, and members with advanced controls
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {statsLoading ? "Loading..." : `${stats.totalUsers} Users`}
          </span>
        </div>
        <button
          onClick={loadData}
          className="btn btn-ghost btn-lg rounded-xl flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} statsLoading={statsLoading} />

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200/50 p-1 rounded-2xl">
        <button
          className={`tab tab-lg flex-1 rounded-xl flex items-center gap-2 ${
            activeTab === "users" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users className="w-4 h-4" />
          Users ({users.length})
        </button>
        <button
          className={`tab tab-lg flex-1 rounded-xl flex items-center gap-2 ${
            activeTab === "organizations" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("organizations")}
        >
          <Building2 className="w-4 h-4" />
          Organizations ({organizations.length})
        </button>
        <button
          className={`tab tab-lg flex-1 rounded-xl flex items-center gap-2 ${
            activeTab === "members" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          <UserCheck className="w-4 h-4" />
          Members ({members.length})
        </button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        activeTab={activeTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "users" && (
              <UsersTab
                users={filteredUsers}
                onEditUser={(user) => {
                  /* implement edit */
                }}
                onOpenConfirmModal={openConfirmModal}
              />
            )}
            {activeTab === "organizations" && (
              <OrganizationsTab
                organizations={filteredOrgs}
                members={members}
                onEditOrg={(org) => {
                  /* implement edit */
                }}
                onOpenConfirmModal={openConfirmModal}
              />
            )}
            {activeTab === "members" && (
              <MembersTab
                members={filteredMembers}
                onOpenConfirmModal={openConfirmModal}
              />
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={
          actionType === "delete"
            ? "Confirm Deletion"
            : actionType === "ban"
            ? "Confirm Ban"
            : actionType === "unban"
            ? "Confirm Unban"
            : "Confirm Removal"
        }
        message={
          actionType === "delete"
            ? `Are you sure you want to delete ${
                activeTab === "users" ? "this user" : "this organization"
              }? This action cannot be undone.`
            : actionType === "ban"
            ? `Are you sure you want to ban ${
                selectedUser?.name || "this user"
              }?`
            : actionType === "unban"
            ? `Are you sure you want to unban ${
                selectedUser?.name || "this user"
              }?`
            : "Are you sure you want to remove this member from the organization?"
        }
        confirmText={
          actionType === "delete"
            ? "Delete"
            : actionType === "ban"
            ? "Ban"
            : actionType === "unban"
            ? "Unban"
            : "Remove"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
}
