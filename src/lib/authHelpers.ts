// src/lib/authHelpers.ts
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

type RequireAuthOptions = {
  roles?: string | string[];      // check against user.role
  app_roles?: string | string[];  // check against user.app_role
};

export async function requireAuth(
  req: NextRequest,
  options: RequireAuthOptions = {}
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      ),
      session: null,
    };
  }

  const { roles, app_roles } = options;

  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(session.user.role)) {
      return {
        errorResponse: NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        ),
        session,
      };
    }
  }

  if (app_roles) {
    const allowedApp = Array.isArray(app_roles) ? app_roles : [app_roles];
    if (!allowedApp.includes(session.user.app_role)) {
      return {
        errorResponse: NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        ),
        session,
      };
    }
  }

  return { session };
}


// const { errorResponse, session } = await requireAuth(req);
// if (errorResponse) return errorResponse;
// // any signed-in user allowed


// const { errorResponse, session } = await requireAuth(req, { roles: "superadmin" });
// if (errorResponse) return errorResponse;


// const { errorResponse, session } = await requireAuth(req, { app_roles: "customer" });
// if (errorResponse) return errorResponse;


// const { errorResponse, session } = await requireAuth(req, {
//   roles: "admin",
//   app_roles: "member"
// });
// if (errorResponse) return errorResponse;



// const { errorResponse, session } = await requireAuth(req, {
//   roles: "superadmin",
//   app_roles: "owner"
// });
// if (errorResponse) return errorResponse;
