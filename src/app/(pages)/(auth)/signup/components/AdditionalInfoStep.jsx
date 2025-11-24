// src/app/(pages)/signup/components/AdditionalInfoStep.jsx
import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronDown,
  Check,
  X,
  RefreshCw,
  Camera,
} from "lucide-react";
import slugify from "slugify";

// Icon mapping for dynamic fields
const iconMap = {
  Mail: () => null,
  Lock: () => null,
  User: () => null,
  Phone: () => null,
  MapPin: () => null,
  Calendar: () => null,
  Building: () => null,
  Shield: () => null,
  Camera: () => null,
  Link: () => null,
};

const AdditionalInfoStep = ({
  formData,
  onInputChange,
  additionalFields,
  additionalInfoOptional,
  onFinalRegistration,
  onPrevStep,
  isSubmitting,
  router,
  selectedRole,
  slugAvailable,
  checkingSlug,
}) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const createSlug = (text) => {
    return slugify(text || "", {
      lower: true,
      strict: true,
      trim: true,
    });
  };

  const handleLogoChange = (file) => {
    if (file) {
      onInputChange("organizationLogo", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrganizationNameChange = (value) => {
    onInputChange("organizationName", value);

    if (!slugManuallyEdited) {
      const autoSlug = createSlug(value);
      onInputChange("organizationSlug", autoSlug);
    }
  };

  const handleSlugChange = (value) => {
    setSlugManuallyEdited(true);
    onInputChange("organizationSlug", createSlug(value));
  };

  const regenerateSlug = () => {
    if (formData.organizationName) {
      const newSlug = createSlug(formData.organizationName);
      setSlugManuallyEdited(false);
      onInputChange("organizationSlug", newSlug);
    }
  };

  const renderSlugStatus = () => {
    if (checkingSlug) {
      return (
        <span className="label-text-alt flex items-center gap-1 text-warning">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking availability...
        </span>
      );
    }

    if (slugAvailable === null) {
      return null;
    }

    if (slugAvailable) {
      return (
        <span className="label-text-alt flex items-center gap-1 text-success">
          <Check className="w-4 h-4" />
          Available
        </span>
      );
    } else {
      return (
        <span className="label-text-alt flex items-center gap-1 text-error">
          <X className="w-4 h-4" />
          Not available
        </span>
      );
    }
  };

  const renderDynamicFields = () => {
    return additionalFields.map((field) => {
      const IconComponent = field.icon ? iconMap[field.icon] : null;

      switch (field.type) {
        case "select":
          return (
            <div key={field.name} className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-primary" />
                  )}
                  {field.label}
                  {field.required && <span className="text-error">*</span>}
                </span>
              </label>
              <div className="relative">
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  className="select select-bordered w-full rounded-xl pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200 appearance-none"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          );

        case "checkbox":
          return (
            <div key={field.name} className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => onInputChange(field.name, e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-semibold text-base-content">
                  {field.label}
                </span>
                {field.required && <span className="text-error">*</span>}
              </label>
            </div>
          );

        case "textarea":
          return (
            <div key={field.name} className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-primary" />
                  )}
                  {field.label}
                  {field.required && <span className="text-error">*</span>}
                </span>
              </label>
              <textarea
                value={formData[field.name] || ""}
                onChange={(e) => onInputChange(field.name, e.target.value)}
                className="textarea textarea-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                placeholder={field.placeholder}
                rows={3}
                required={field.required}
              />
            </div>
          );

        case "url":
          return (
            <div key={field.name} className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-primary" />
                  )}
                  {field.label}
                  {field.required && <span className="text-error">*</span>}
                </span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData[field.name] || ""}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                />
                {IconComponent && (
                  <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                )}
              </div>
              {field.validation?.message && (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    {field.validation.message}
                  </span>
                </label>
              )}
            </div>
          );

        case "file":
          if (field.name === "organizationLogo") {
            return (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    {field.label}
                    {field.required && <span className="text-error">*</span>}
                  </span>
                </label>

                <div className="flex flex-col items-center gap-4">
                  {logoPreview && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-base-300">
                      <img
                        src={logoPreview}
                        alt="Organization logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e.target.files[0])}
                    className="file-input file-input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                  />
                </div>
              </div>
            );
          }
          return null;

        case "text":
          if (field.name === "organizationName") {
            return (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-primary" />
                    )}
                    {field.label}
                    {field.required && <span className="text-error">*</span>}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleOrganizationNameChange(e.target.value)
                    }
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                  />
                  <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                </div>
              </div>
            );
          }

          if (field.name === "organizationSlug") {
            return (
              <div key={field.name} className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-primary" />
                    )}
                    {field.label}
                    {field.required && <span className="text-error">*</span>}
                  </span>
                  {renderSlugStatus()}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      handleSlugChange(e.target.value);
                    }}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    className="input input-bordered w-full rounded-xl pl-10 pr-20 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                  />
                  <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                  <button
                    type="button"
                    onClick={regenerateSlug}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors"
                    title="Regenerate from organization name"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {field.validation?.message && (
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      {field.validation.message}
                    </span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    This will be your organization's URL identifier
                  </span>
                </label>
              </div>
            );
          }

        default:
          return (
            <div key={field.name} className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-primary" />
                  )}
                  {field.label}
                  {field.required && <span className="text-error">*</span>}
                </span>
              </label>
              <div className="relative">
                <input
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                />
                {IconComponent && (
                  <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                )}
              </div>
              {field.validation?.message && (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    {field.validation.message}
                  </span>
                </label>
              )}
            </div>
          );
      }
    });
  };

  const getSubmitButtonText = () => {
    if (selectedRole === "org_superadmin") {
      return isSubmitting ? "Creating Organization..." : "Create Organization";
    }
    return isSubmitting
      ? "Completing Registration..."
      : "Complete Registration";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-base-content">
          {selectedRole === "org_superadmin"
            ? "Organization Information"
            : "Additional Information"}
        </h3>
        <p className="text-base-content/70 mt-2">
          {selectedRole === "org_superadmin"
            ? "Set up your organization profile"
            : "Please provide the following details to complete your registration"}
        </p>
      </div>

      {renderDynamicFields()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={isSubmitting}
          className="btn btn-outline rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-3">
          {/* Skip button (ONLY if optional and not organization) */}
          {additionalInfoOptional && selectedRole !== "org_superadmin" && (
            <button
              type="button"
              onClick={() => handleFinalRegistration(true)} // Pass true to skip additional info
              disabled={isSubmitting}
              className="btn btn-warning rounded-xl flex items-center gap-2"
            >
              Skip <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onFinalRegistration(false)} // Pass false to include additional info
            disabled={
              isSubmitting ||
              (selectedRole === "org_superadmin" &&
                (checkingSlug || slugAvailable === false))
            }
            className="btn btn-success rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {getSubmitButtonText()}
          </button>
        </div>
      </div>

      {/* Already have account */}
      <div className="text-center pt-6 border-t border-base-300/30">
        <p className="text-base-content/70">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
