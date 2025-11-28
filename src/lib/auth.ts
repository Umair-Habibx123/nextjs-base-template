// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { getOAuthState } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { sendTemplatedEmail } from "./email-templates";
import { passkey } from "@better-auth/passkey";
import {
  admin as adminPlugin,
  emailOTP,
  haveIBeenPwned,
  magicLink,
  multiSession,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { ac, admin, owner, member, superadmin } from "./permissions";

const config = JSON.parse(process.env.NEXT_PUBLIC_BETTER_AUTH_CONFIG || "{}");

// ---------------------- Database Loader -----------------
function loadDatabase() {
  const db = config.database;

  switch (db?.driver) {
    case "postgre":
      return {
        connectionString: db.postgre.connectionString,
      };

    case "sqlite":
      return new Database(db.sqlite?.path);

    default:
      console.warn("⚠ Unknown database driver. Falling back to SQLite.");
      return new Database("./database/database.sqlite");
  }
}

export const auth = betterAuth({
  appName: config.appName,
  basePath: config.basePath,
  secret: config.secret,
  trustedOrigins: config.trustedOrigins,

  database: loadDatabase(),
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (ctx.path === "/callback/:id") {
            const additionalData = await getOAuthState();

            if (additionalData) {
              return {
                data: {
                  app_role: additionalData.app_role,
                  referredFrom: additionalData.referredFrom,
                },
              };
            }
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      app_role: {
        type: "string",
        input: true,
        // defaultValue: "customer",
      },
    },
  },

  session: {
    expiresIn: config.session?.expiresIn,
    updateAge: config.session?.updateAge,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600,
    autoSignIn: true,

    sendResetPassword: async ({ user, url, token }, request) => {
      await sendTemplatedEmail({
        to: user.email,
        templateName: "password-reset",
        variables: {
          user: {
            name: user.name || user.email,
            email: user.email,
          },
          resetLink: url,
          token: token,
        },
      });
    },

    onPasswordReset: async ({ user }, request) => {

      await sendTemplatedEmail({
        to: user.email,
        templateName: "password-reset-confirmation",
        variables: {
          user: {
            name: user.name || user.email,
            email: user.email,
          },
        },
      });
    },
  },

  socialProviders: {
    ...(config.socialProviders?.google?.enabled && {
      google: {
        clientId: config.socialProviders.google.clientId,
        clientSecret: config.socialProviders.google.clientSecret,
        overrideUserInfoOnSignIn:
          config.socialProviders.google.overrideUserInfoOnSignIn ?? true,
        disableImplicitSignUp: true,
      },
    }),

    ...(config.socialProviders?.github?.enabled && {
      github: {
        clientId: config.socialProviders.github.clientId,
        clientSecret: config.socialProviders.github.clientSecret,
        overrideUserInfoOnSignIn:
          config.socialProviders.github.overrideUserInfoOnSignIn ?? true,
        disableImplicitSignUp: true,
      },
    }),
  },

  emailVerification: {
    sendOnSignUp: true,

    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendTemplatedEmail({
        to: user.email,
        templateName: "email-verification",
        variables: {
          user: {
            name: user.name || user.email,
            email: user.email,
          },
          verificationLink: url,
          token: token,
        },
      });
    },
  },

  plugins: [
    nextCookies(),
    twoFactor({
      issuer: config.appName,
      otpOptions: {
        async sendOTP({ user, otp }, ctx) {
          let templateName = "login-otp";

          await sendTemplatedEmail({
            to: user.email,
            templateName,
            variables: {
              otp,
              user: {
                name: user.name || user.email,
                email: user.email,
              },
            },
          });
        },
      },
    }),
    passkey({
      rpID: process.env.WEBAUTHN_RP_ID || "localhost",
      rpName: "Your App Name",
      origin: process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    }),
    magicLink({
      expiresIn: 300,
      disableSignUp: true,
      sendMagicLink: async ({ email, url, token }, ctx) => {
        await sendTemplatedEmail({
          to: email,
          templateName: "magic-link",
          variables: {
            url: url,
            token: token,
            user: { email: email },
          },
        });
      },
    }),
    multiSession({
      // maximumSessions: 3, // (always +1 of actual number of users auth at a time wanted....)
    }),
    haveIBeenPwned(),
    adminPlugin({
      adminRoles: ["superadmin", "admin"],
      ac,
      roles: {
        admin,
        superadmin,
      },
    }),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
      allowedAttempts: 3,
      expiresIn: 60 * 60 * 24 * 1,
      async sendVerificationOTP({ email, otp, type }) {
        let templateName = "";

        if (type === "sign-in") {
          templateName = "login-otp";
        } else if (type === "email-verification") {
          templateName = "email-verification";
        }

        await sendTemplatedEmail({
          to: email,
          templateName,
          variables: {
            otp,
            user: { email },
          },
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
