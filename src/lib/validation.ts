/**
 * Validation utilities for AGRI-NOVA forms
 */

// Email validation with detailed errors
export function validateEmailWithDetails(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email is required." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed) || trimmed.includes("..")) {
    return { isValid: false, error: "Please enter a valid email address." };
  }
  return { isValid: true };
}

// Keep backward compatibility for existing boolean check
export function validateEmail(email: string): boolean {
  return validateEmailWithDetails(email).isValid;
}

// Phone number validation with detailed errors (supporting Indian formats)
export function validatePhoneWithDetails(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: "Phone number is required." };
  }
  if (/[a-zA-Z]/.test(phone)) {
    return { isValid: false, error: "Phone number cannot contain letters." };
  }
  if (!/^\d{10}$/.test(phone)) {
    return { isValid: false, error: "Phone number must contain exactly 10 digits." };
  }
  return { isValid: true };
}

// Keep backward compatibility for existing boolean check
export function validatePhone(phone: string): boolean {
  return validatePhoneWithDetails(phone).isValid;
}

// Strict password and confirm password check
export function validatePasswords(password: string, confirmPassword: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must contain at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number." };
  }
  const specialCharRegex = /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\\|`~]/;
  if (!specialCharRegex.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character." };
  }
  
  if (!confirmPassword) {
    return { isValid: false, error: "Confirm password is required." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true };
}

// Strict Full Name validation
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }
  if (/\d/.test(trimmed)) {
    return { isValid: false, error: "Full name must contain letters only. Numbers are not allowed." };
  }
  if (!/^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(trimmed)) {
    return { isValid: false, error: "Full name must contain letters and single spaces only." };
  }
  return { isValid: true };
}

// Public role gatekeeping validation
export function validateRole(role: string): { isValid: boolean; error?: string } {
  const allowedRoles = ["FARMER", "BUYER", "EQUIPMENT_OWNER", "VETERINARY_EXPERT", "DELIVERY_PARTNER"];
  if (!role) {
    return { isValid: false, error: "Role is required." };
  }
  if (!allowedRoles.includes(role)) {
    return { isValid: false, error: "Access denied. Selected role is not allowed for public registration." };
  }
  return { isValid: true };
}

// Dynamic role-specific metadata validation
export function validateRoleMetadata(role: string, metadata?: string): { isValid: boolean; error?: string } {
  if (!metadata) {
    return { isValid: true };
  }
  const trimmed = metadata.trim();
  if (role === "FARMER") {
    if (trimmed.length < 5) {
      return { isValid: false, error: "Location must be at least 5 characters." };
    }
    if (trimmed.length > 250) {
      return { isValid: false, error: "Location cannot exceed 250 characters." };
    }
    if (/^\d+$/.test(trimmed)) {
      return { isValid: false, error: "Location cannot contain only numbers." };
    }
    if (/<script|html/i.test(trimmed) || /<[^>]*>/g.test(trimmed)) {
      return { isValid: false, error: "HTML or script injections are not allowed." };
    }
  } else if (role === "BUYER") {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    if (!gstinRegex.test(trimmed)) {
      return { isValid: false, error: "Please enter a valid 15-character GSTIN format (e.g. 07AAAAA0000A1Z5)." };
    }
  } else if (role === "VETERINARY_EXPERT") {
    if (trimmed.length < 5) {
      return { isValid: false, error: "Registration number must be at least 5 characters." };
    }
    if (trimmed.length > 100) {
      return { isValid: false, error: "Registration number cannot exceed 100 characters." };
    }
    if (/<script|html/i.test(trimmed) || /<[^>]*>/g.test(trimmed)) {
      return { isValid: false, error: "HTML or script injections are not allowed." };
    }
  }
  return { isValid: true };
}

// Crop Recommender input boundaries validation
export interface CropValidationResult {
  isValid: boolean;
  errors: {
    n?: string;
    p?: string;
    k?: string;
    ph?: string;
    rainfall?: string;
  };
}

export function validateCropInputs(
  n: number | string,
  p: number | string,
  k: number | string,
  ph: number | string,
  rainfall: number | string
): CropValidationResult {
  const result: CropValidationResult = { isValid: true, errors: {} };

  const numN = Number(n);
  const numP = Number(p);
  const numK = Number(k);
  const numPh = Number(ph);
  const numRain = Number(rainfall);

  if (isNaN(numN) || numN < 0 || numN > 500) {
    result.isValid = false;
    result.errors.n = "Nitrogen must be a number between 0 and 500.";
  }
  if (isNaN(numP) || numP < 0 || numP > 500) {
    result.isValid = false;
    result.errors.p = "Phosphorus must be a number between 0 and 500.";
  }
  if (isNaN(numK) || numK < 0 || numK > 500) {
    result.isValid = false;
    result.errors.k = "Potassium must be a number between 0 and 500.";
  }
  if (isNaN(numPh) || numPh < 0.0 || numPh > 14.0) {
    result.isValid = false;
    result.errors.ph = "Soil pH must be a number between 0.0 and 14.0.";
  }
  if (isNaN(numRain) || numRain < 0 || numRain > 3000) {
    result.isValid = false;
    result.errors.rainfall = "Rainfall must be a non-negative number up to 3000 mm.";
  }

  return result;
}

// Expense Ledger validation
export function validateExpenseAmount(amount: number | string): { isValid: boolean; error?: string } {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: "Expense amount must be a positive number greater than zero." };
  }
  if (num > 10000000) {
    return { isValid: false, error: "Expense amount cannot exceed ₹10,000,000." };
  }
  return { isValid: true };
}

// Cow Tag duplicate validation
export function validateCowTag(tag: string, existingTags: string[]): { isValid: boolean; error?: string } {
  const trimmed = tag.trim();
  if (!trimmed) {
    return { isValid: false, error: "Cow tag cannot be empty." };
  }
  if (!/^[A-Z0-9-]{3,15}$/i.test(trimmed)) {
    return { isValid: false, error: "Tag must be 3-15 alphanumeric characters/hyphens." };
  }
  const isDuplicate = existingTags.some(
    (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    return { isValid: false, error: `Cattle tag "${trimmed}" already exists in the registry.` };
  }
  return { isValid: true };
}

// Equipment Rental Duration validation
export function validateRentalDays(days: number | string): { isValid: boolean; error?: string } {
  const num = Number(days);
  if (!Number.isInteger(num) || num < 1 || num > 30) {
    return { isValid: false, error: "Rental duration must be a whole number of days between 1 and 30." };
  }
  return { isValid: true };
}

// Prescription Text validation
export function validatePrescription(text: string): boolean {
  return text.trim().length >= 10;
}
