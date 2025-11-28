// src/app/(pages)/signup/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/client";
import { toast } from "react-toastify";
import { decrypt } from "@/utils/crypto";
import {
  getSignupConfig,
  getSelfSignupRoles,
} from "../../../config/signup-config";
import BasicInfoStep from "./components/BasicInfoStep";
import RoleSelectionStep from "./components/RoleSelectionStep";
import OTPVerificationStep from "./components/OTPVerificationStep";
import AdditionalInfoStep from "./components/AdditionalInfoStep";
import {
  Building2,
  Users,
  Shield,
  Heart,
  Crown,
  Settings,
  CheckCircle2,
} from "lucide-react";

const SignupPage = () => {
  const { user, ensureSessionLimit, socialSignUp, setUser } = useAuth();

  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("customer");

  const {
    signupRole,
    additionalFields,
    additionalInfoOptional,
    title,
    description,
    belongs_to_organization,
    scope,
    color,
    appliesTo,
  } = getSignupConfig(selectedRole);

  // Enhanced getStepIcon function
  const getStepIcon = () => {
    const roleIcons = {
      superadmin: Crown,
      admin: Settings,
      org_superadmin: Building2,
      org_admin: Shield,
      customer: Users,
      patient: Heart,
    };

    const IconComponent = roleIcons[selectedRole] || Users;
    return <IconComponent className="w-8 h-8" />;
  };

  // Get available roles for self-signup
  const availableRoles = getSelfSignupRoles();

  // Initialize form data with dynamic fields
  const initialFormData = {
    // Step 1: Role Selection
    app_role: "customer",

    // Step 2: Basic Information
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,

    // Step 3: OTP Verification
    otp: "",

    // Step 4: Additional Information (dynamic)
  };

  // Add dynamic fields to initial form data based on selected role
  useEffect(() => {
    const newFormData = { ...initialFormData, app_role: selectedRole };

    additionalFields.forEach((field) => {
      newFormData[field.name] =
        field.default || (field.type === "checkbox" ? false : "");
    });

    setFormData(newFormData);
  }, [selectedRole]);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && additionalFields.length > 0) {
      const socialAuthComplete = searchParams.get("social_auth") === "complete";

      let stored = null;
      if (typeof window !== "undefined") {
        const encrypted = sessionStorage.getItem("signup_role");
        stored = encrypted ? decrypt(encrypted) : null;
      }

      const socialRole = searchParams.get("role") || stored;

      if (socialAuthComplete && socialRole) {
        setSelectedRole(socialRole);
        setFormData((prev) => ({ ...prev, app_role: socialRole }));
        setCurrentStep(4);

        sessionStorage.removeItem("signup_role");

        router.replace("/signup", { scroll: false });
      }
    }
  }, [user, searchParams, additionalFields.length]);

  const handleRoleSelect = (app_role) => {
    setSelectedRole(app_role);
    setFormData((prev) => ({ ...prev, app_role }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check slug availability when organizationSlug changes
    if (field === "organizationSlug" && value) {
      checkSlugAvailability(value);
    }
  };

  const checkSlugAvailability = async (slug) => {
    setCheckingSlug(true);
    try {
      const { data, error } = await authClient.organization.checkSlug({
        slug: slug.toLowerCase().trim(),
      });

      if (error) {
        setSlugAvailable(false);
        return false;
      }

      setSlugAvailable(data.status);
      return data.status;
    } catch (err) {
      console.error("Error checking slug:", err);
      setSlugAvailable(false);
      return false;
    } finally {
      setCheckingSlug(false);
    }
  };

  const uploadProfilePicture = async (file) => {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/public/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to upload image");
    }

    return json.url;
  };

  const handleProfilePicChange = (file) => {
    if (file) {
      handleInputChange("profilePic", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 2 && !validateStep1()) return;

    if (currentStep === 2) {
      if (!(await ensureSessionLimit())) {
        return false;
      }

      setIsSubmitting(true);
      try {
        let profilePicUrl = null;

        if (formData.profilePic) {
          profilePicUrl = await uploadProfilePicture(formData.profilePic);
        }

        const { data, error } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          image: profilePicUrl,
          app_role: selectedRole,
        });

        if (error) {
          // check for the "PASSWORD_COMPROMISED" code
          if (error.code === "PASSWORD_COMPROMISED") {
            toast.error(
              "That password appears in a known breach. Please choose a brand-new password you haven’t used elsewhere."
            );
          } else {
            toast.error(error.message);
          }
          return;
        }

        // Send OTP
        const sendOtp = await authClient.emailOtp.sendVerificationOtp({
          email: formData.email,
          type: "email-verification",
        });

        if (sendOtp.error) {
          toast.error(sendOtp.error.message);
          return;
        }

        toast.success("OTP sent to your email!");
        setOtpSent(true);
        setCurrentStep(3);
      } catch (err) {
        console.error("Signup error:", err);
        toast.error("Signup failed, try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleOtpVerification = async (otp) => {
    setIsSubmitting(true);
    try {
      const email = formData.email;
      const password = formData.password;

      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      setOtpVerified(true);
      toast.success("Email verified successfully!");

      const { data2, error2 } = await authClient.signIn.email({
        email,
        password,
      });

      if (error2) {
        toast.error(error2.message);
        return false;
      }

      const session = await authClient.getSession();
      if (session?.data?.user) setUser(session.data.user);

      // Move to next step
      if (additionalFields.length > 0) {
        setCurrentStep(4);
      } else {
        await handleFinalRegistration();
      }

      return true;
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("OTP verification failed");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced final registration handler
  const handleFinalRegistration = async (skipAdditionalInfo = false) => {
    setIsSubmitting(true);
    try {
      const finalEmail = formData.email || user?.email;

      if (!finalEmail) {
        toast.error("Unable to determine user email.");
        return;
      }

      // Handle organization creation for organization roles
      if (belongs_to_organization) {
        await handleOrganizationCreation();
        return;
      }

      // For regular roles, save additional profile data only if not skipping
      if (additionalFields.length > 0 && !skipAdditionalInfo) {
        const dynamicData = additionalFields.reduce((acc, field) => {
          // Don't include organization fields in user profile
          if (!field.name.startsWith("organization")) {
            acc[field.name] = formData[field.name];
          }
          return acc;
        }, {});

        // Only save if there's actual user data
        if (Object.keys(dynamicData).length > 0) {
          const res = await fetch("/api/user/save-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: finalEmail,
              data: dynamicData,
            }),
          });

          if (!res.ok) {
            const json = await res.json();
            toast.error(json.error || "Failed to save additional info");
            return;
          }
        }
      }

      toast.success("Registration complete!");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrganizationCreation = async () => {
    try {
      // Check slug availability
      if (!formData.organizationSlug) {
        toast.error("Organization slug is required");
        return;
      }

      const isSlugAvailable = await checkSlugAvailability(
        formData.organizationSlug
      );
      if (!isSlugAvailable) {
        toast.error(
          "Organization slug is not available. Please choose a different one."
        );
        return;
      }

      let organizationLogoUrl = null;
      if (formData.organizationLogo) {
        organizationLogoUrl = await uploadProfilePicture(
          formData.organizationLogo
        );
      }

      // Build metadata from additional fields
      const metadata = {};
      const organizationFields = [
        "organizationType",
        "organizationSize",
        "organizationIndustry",
        "organizationWebsite",
        "organizationDescription",
        "organizationAddress",
        "organizationCity",
        "organizationCountry",
      ];

      organizationFields.forEach((field) => {
        if (formData[field]) {
          // Remove 'organization' prefix from field names for metadata
          const metadataField = field.replace("organization", "").toLowerCase();
          metadata[metadataField] = formData[field];
        }
      });

      // Create organization with enhanced metadata
      const { data: orgData, error: orgError } =
        await authClient.organization.create({
          name: formData.organizationName,
          slug: formData.organizationSlug.toLowerCase().trim(),
          logo: organizationLogoUrl,
          metadata: metadata,
          keepCurrentActiveOrganization: false,
        });

      if (orgError) {
        toast.error(orgError.message || "Failed to create organization");
        return;
      }

      toast.success("Organization created successfully! Please login.");
      router.push("/login");
    } catch (err) {
      console.error("Organization creation error:", err);
      toast.error("Organization creation failed");
    }
  };

  const resendOtp = async () => {
    try {
      const r = await authClient.emailOtp.sendVerificationOtp({
        email: formData.email,
        type: "email-verification",
      });

      if (r.error) {
        toast.error(r.error.message);
      } else {
        toast.success("OTP sent again");
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  const steps = [
    { number: 1, title: "Select Role", completed: currentStep > 1 },
    { number: 2, title: "Basic Info", completed: currentStep > 2 },
    { number: 3, title: "Verify Email", completed: otpVerified },
    { number: 4, title: "Additional Info", completed: currentStep > 4 },
  ];

  // Filter steps based on whether additional fields exist
  const filteredSteps = steps.filter(
    (step) => step.number !== 4 || additionalFields.length > 0
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Signup Card */}
      <section className="card w-full max-w-2xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl transition-all duration-500 hover:shadow-3xl z-10">
        <div className="card-body p-8 space-y-8">
          {/* Enhanced Header */}

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div
                className="p-4 rounded-2xl text-primary-content shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}30, ${color}60)`,
                  border: `1px solid ${color}30`,
                }}
              >
                {getStepIcon()}
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {currentStep === 1
                  ? "Create Account"
                  : `Create ${title} Account`}
              </h1>
              <p className="text-base-content/70 text-lg">
                {currentStep === 1 ? "Choose your account type" : description}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between items-center relative">
            {filteredSteps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step.completed
                        ? "bg-success border-success text-success-content"
                        : currentStep === step.number
                        ? "bg-primary border-primary text-primary-content shadow-lg"
                        : "bg-base-200 border-base-300 text-base-content/40"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium mt-2 transition-colors duration-300 ${
                      currentStep === step.number
                        ? "text-base-content"
                        : "text-base-content/60"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < filteredSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/4 right-1/4 h-0.5 transition-colors duration-300 ${
                      step.completed ? "bg-success" : "bg-base-300"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Components */}
          {currentStep === 1 && (
            <RoleSelectionStep
              availableRoles={availableRoles}
              selectedRole={selectedRole}
              onRoleSelect={handleRoleSelect}
              onNextStep={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <BasicInfoStep
              formData={formData}
              onInputChange={handleInputChange}
              onProfilePicChange={handleProfilePicChange}
              profilePreview={profilePreview}
              onNextStep={handleNextStep}
              selectedRole={selectedRole}
              // onSocialSignup={async (provider) => {
              //   try {
              //     setIsSubmitting(true);
              //     await socialSignUp(provider, selectedRole);
              //   } catch (err) {
              //     toast.error(err.message || "Social signup failed");
              //   } finally {
              //     setIsSubmitting(false);
              //   }
              // }}
              // In the main SignupPage component, update the socialSignUp handler:
              onSocialSignup={async (provider, role) => {
                try {
                  if (!(await ensureSessionLimit())) {
                    return false;
                  }
                  setIsSubmitting(true);
                  // Store the selected role before social signup
                  const signupRole = role || selectedRole;
                  await socialSignUp(provider, signupRole);

                  // After social signup, ensure we have the role context
                  if (user && additionalFields.length > 0) {
                    setCurrentStep(4);
                  }
                } catch (err) {
                  toast.error(err.message || "Social signup failed");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              isSubmitting={isSubmitting}
              t={t}
            />
          )}

          {currentStep === 3 && (
            <OTPVerificationStep
              email={formData.email}
              onOtpVerify={handleOtpVerification}
              onResendOtp={resendOtp}
              isSubmitting={isSubmitting}
              otpVerified={otpVerified}
              otpSent={otpSent}
            />
          )}

          {currentStep === 4 && additionalFields.length > 0 && (
            <AdditionalInfoStep
              formData={formData}
              onInputChange={handleInputChange}
              additionalFields={additionalFields}
              additionalInfoOptional={additionalInfoOptional}
              onFinalRegistration={handleFinalRegistration}
              onPrevStep={handlePrevStep}
              isSubmitting={isSubmitting}
              router={router}
              selectedRole={selectedRole}
              slugAvailable={slugAvailable}
              checkingSlug={checkingSlug}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
