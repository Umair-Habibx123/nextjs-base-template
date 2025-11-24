// src/lib/permissions.ts

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  project: ["create"],
});

export const admin = ac.newRole({
  project: ["create", "share", "update", "delete"],
  ...adminAc.statements,
});


export const superadmin = ac.newRole({
  project: admin.statements.project,
  user: [...admin.statements.user, "create", "update", "delete"],
  session: [...admin.statements.session, "list", "revoke", "delete"],
});


export const owner = ac.newRole({
  project: ["create", "update", "delete"],
});
