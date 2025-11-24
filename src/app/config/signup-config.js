// src/config/signup-config.js

export const getRoleSchemas = () => {
  try {
    const roleSchemas = process.env.NEXT_PUBLIC_ROLE_SCHEMAS;
    
    if (!roleSchemas) {
      console.warn("NEXT_PUBLIC_ROLE_SCHEMAS environment variable is not set");
      return { roles: {} };
    }

    const parsedSchemas = JSON.parse(roleSchemas);
    return parsedSchemas;
    
  } catch (err) {
    console.error("Error parsing NEXT_PUBLIC_ROLE_SCHEMAS:", err);
    return { roles: {} };
  }
};

export const getSignupConfig = (type = "customer") => {
  try {
    const schemas = getRoleSchemas();
    const roleConfig = schemas.roles[type];

    if (!roleConfig) {
      console.warn(`Signup config for role '${type}' not found. Falling back to customer.`);
      // Fallback to customer if role doesn't exist
      const customerConfig = schemas.roles.customer || {
        signup: { additionalFields: [], additionalInfoOptional: false },
        self_signup: true,
        title: "Customer",
        description: "General customer account",
        belongs_to_organization: false,
        scope: "public"
      };
      
      return {
        signupRole: "customer",
        additionalFields: customerConfig.signup?.additionalFields || [],
        additionalInfoOptional: customerConfig.signup?.additionalInfoOptional || false,
        self_signup: customerConfig.self_signup || false,
        title: customerConfig.title || "Customer",
        description: customerConfig.description || "",
        belongs_to_organization: customerConfig.belongs_to_organization || false,
        scope: customerConfig.scope || "public",
        color: customerConfig.color || "#4287f5"
      };
    }

    const signup = roleConfig.signup || {};

    return {
      signupRole: type,
      additionalFields: signup.additionalFields || [],
      additionalInfoOptional: signup.additionalInfoOptional || false,
      self_signup: roleConfig.self_signup || false,
      title: roleConfig.title || type,
      description: roleConfig.description || "",
      belongs_to_organization: roleConfig.belongs_to_organization || false,
      scope: roleConfig.scope || "public",
      color: roleConfig.color || "#4287f5",
      appliesTo: roleConfig.appliesTo || "user",
      hierarchy_level: roleConfig.hierarchy_level || 99
    };

  } catch (err) {
    console.error("Invalid NEXT_PUBLIC_ROLE_SCHEMAS JSON:", err);
    return {
      signupRole: "customer",
      additionalFields: [],
      additionalInfoOptional: false,
      self_signup: true,
      title: "Customer",
      description: "General customer account",
      belongs_to_organization: false,
      scope: "public",
      color: "#4287f5",
      appliesTo: "user",
      hierarchy_level: 99
    };
  }
};

// Get all roles that allow self-signup
export const getSelfSignupRoles = () => {
  try {
    const schemas = getRoleSchemas();
    const roles = schemas.roles;
    
    return Object.entries(roles)
      .filter(([roleName, roleConfig]) => roleConfig.self_signup === true)
      .map(([roleName, roleConfig]) => ({
        value: roleName,
        label: roleConfig.title || roleName,
        description: roleConfig.description || "",
        color: roleConfig.color || "#4287f5",
        scope: roleConfig.scope || "public",
        appliesTo: roleConfig.appliesTo || "user"
      }));
  } catch (err) {
    console.error("Error getting self-signup roles:", err);
    return [
      { 
        value: "customer", 
        label: "Customer", 
        description: "General customer account",
        color: "#4287f5",
        scope: "public",
        appliesTo: "user"
      }
    ];
  }
};

// Get role configuration by type
export const getRoleConfig = (roleType) => {
  try {
    const schemas = getRoleSchemas();
    return schemas.roles[roleType] || null;
  } catch (err) {
    console.error("Error getting role config:", err);
    return null;
  }
};

// Check if role requires organization creation
export const requiresOrganizationCreation = (roleType) => {
  const roleConfig = getRoleConfig(roleType);
  return roleConfig?.belongs_to_organization || false;
};

// Get all available roles for display
export const getAllRoles = () => {
  try {
    const schemas = getRoleSchemas();
    const roles = schemas.roles;
    
    return Object.entries(roles).map(([roleName, roleConfig]) => ({
      value: roleName,
      label: roleConfig.title || roleName,
      description: roleConfig.description || "",
      color: roleConfig.color || "#4287f5",
      scope: roleConfig.scope || "public",
      appliesTo: roleConfig.appliesTo || "user",
      self_signup: roleConfig.self_signup || false,
      hierarchy_level: roleConfig.hierarchy_level || 99
    }));
  } catch (err) {
    console.error("Error getting all roles:", err);
    return [];
  }
};