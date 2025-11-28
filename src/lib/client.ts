// src/lib/client.ts
"use client";

import { createAuthClient } from "better-auth/client";
import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    passkeyClient(),
    multiSessionClient(),
    emailOTPClient(),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = `/verify-2fa`;
      },
    }),
    magicLinkClient(),
  ],
});
