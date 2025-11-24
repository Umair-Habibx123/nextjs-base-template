// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { sendTemplatedEmail } from "./email-templates";
import {
  admin as adminPlugin,
  emailOTP,
  organization,
} from "better-auth/plugins";
import { ac, admin, owner, member, superadmin } from "./permissions";

const socialConfig = JSON.parse(
  process.env.NEXT_PUBLIC_SOCIAL_AUTH_CONFIG || "{}"
);

export const auth = betterAuth({
  database: new Database("./database/database.sqlite"),
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: ["https://communicatory-raeann-crined.ngrok-free.dev"],

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,

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
      console.log(`Password for user ${user.email} has been reset.`);

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
    ...(socialConfig.google?.enabled && {
      google: {
        prompt: "select_account",
        accessType: "offline",
        clientId: socialConfig.google.clientId,
        clientSecret: socialConfig.google.clientSecret,
      },
    }),

    ...(socialConfig.github?.enabled && {
      github: {
        clientId: socialConfig.github.clientId,
        clientSecret: socialConfig.github.clientSecret,
      },
    }),
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnEmailChange: true,

    // Optional: You can also use templates for email verification
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

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  plugins: [
    nextCookies(),
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
