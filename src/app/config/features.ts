// filename: lib/config.ts

export const SUPER_ADMIN_FEATURES = parseEnvJson(
  process.env.NEXT_PUBLIC_SUPER_ADMIN_FEATURES,
  {
    appinfo: true,
    theme: true,
    systeminfo: true,
    langmanage: true,
    contacts: true,
    newsletter: true,
    announcement: true,
    emailtemplates: true,
    blogs: true,
    projects: true,
    casestudies: true,
    settings: true,
    usermanagement: true,
  }
);

// User Features Configuration
export const USER_FEATURES = parseEnvJson(
  process.env.NEXT_PUBLIC_USER_FEATURES,
  {
    profile: true,
    dashboard: true,
    notifications: true,
    preferences: true,
  }
);

// Role Schemas
export const ROLE_SCHEMAS = parseEnvJson(process.env.NEXT_PUBLIC_ROLE_SCHEMAS, {
  roles: {},
});

// Social Auth Configuration
export const BETTER_AUTH_CONFIG = parseEnvJson<BetterAuthConfig>(
  process.env.NEXT_PUBLIC_BETTER_AUTH_CONFIG,
  {}
);

export const SOCIAL_AUTH_CONFIG =
  BETTER_AUTH_CONFIG.socialProviders ?? {
    google: { enabled: false },
    github: { enabled: false },
  };

// Helper function to parse environment JSON with fallback
function parseEnvJson<T>(envValue: string | undefined, fallback: T): T {
  if (!envValue) return fallback;
  try {
    return JSON.parse(envValue);
  } catch (err) {
    console.error("Invalid JSON in env:", err);
    return fallback;
  }
}

// Type definitions for better TypeScript support
export interface AdminFeatures {
  appinfo: boolean;
  theme: boolean;
  systeminfo: boolean;
  langmanage: boolean;
  contacts: boolean;
  newsletter: boolean;
  announcement: boolean;
  emailtemplates: boolean;
  blogs: boolean;
  projects: boolean;
  casestudies: boolean;
  settings: boolean;
  usermanagement: boolean;
}

export interface UserFeatures {
  profile: boolean;
  dashboard: boolean;
  notifications: boolean;
  preferences: boolean;
}

export interface BetterAuthSocialProviders {
  google?: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
    overrideUserInfoOnSignIn?: boolean;
  };
  github?: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
  };
}

export interface BetterAuthConfig {
  appName?: string;
  basePath?: string;
  secret?: string;
  trustedOrigins?: string[];

  database?: any; // or you can type this too

  session?: {
    expiresIn?: number;
    updateAge?: number;
  };

  emailAndPassword?: any;
  emailVerification?: any;

  socialProviders?: BetterAuthSocialProviders;

  plugins?: any;
}
