export const ADMIN_FEATURES = {
  appinfo: process.env.NEXT_PUBLIC_ADMIN_FEATURE_APPINFO === "true",
  theme: process.env.NEXT_PUBLIC_ADMIN_FEATURE_THEME === "true",
  systeminfo: process.env.NEXT_PUBLIC_ADMIN_FEATURE_SYSTEMINFO === "true",
  langmanage: process.env.NEXT_PUBLIC_ADMIN_FEATURE_LANGMANAGE === "true",
  contacts: process.env.NEXT_PUBLIC_ADMIN_FEATURE_CONTACTS === "true",
  newsletter: process.env.NEXT_PUBLIC_ADMIN_FEATURE_NEWSLETTER === "true",
  announcement: process.env.NEXT_PUBLIC_ADMIN_FEATURE_ANNOUNCEMENT === "true",
  emailtemplates:
    process.env.NEXT_PUBLIC_ADMIN_FEATURE_EMAILTEMPLATES === "true",
  blogs: process.env.NEXT_PUBLIC_ADMIN_FEATURE_BLOGS === "true",
  projects: process.env.NEXT_PUBLIC_ADMIN_FEATURE_PROJECTS === "true",
  case_studies: process.env.NEXT_PUBLIC_ADMIN_FEATURE_CASESTUDIES === "true",

};

export const USER_FEATURES = {
};
