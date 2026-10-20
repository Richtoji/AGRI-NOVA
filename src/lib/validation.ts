/**
 * Validation utilities for AGRI-NOVA forms
 */

// Email validation with detailed errors
export function validateEmailWithDetails(email: string): { isValid: boolean; error?: string } {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Email is required." };
  }
  // Strict RFC-compliant email regex with domain validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed) || trimmed.includes("..") || trimmed.length > 254) {
    return { isValid: false, error: "Please enter a valid email address (e.g., user@domain.com)." };
  }
  const parts = trimmed.split("@");
  if (parts.length !== 2 || !parts[1].includes(".")) {
    return { isValid: false, error: "Email domain must contain a valid extension (e.g., .com, .in)." };
  }
  const tld = parts[1].split(".").pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Please enter a complete and valid domain extension." };
  }
  return { isValid: true };
}

// Keep backward compatibility for existing boolean check
export function validateEmail(email: string): boolean {
  return validateEmailWithDetails(email).isValid;
}

// Phone number validation with detailed errors (supporting Indian formats)
export function validatePhoneWithDetails(phone: string): { isValid: boolean; error?: string; cleanPhone?: string } {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: "Phone number cannot contain letters." };
  }
  // Strip whitespace, hyphens, parentheses, and dots
  let digits = trimmed.replace(/[\s\-\(\)\.]/g, "");
  if (digits.startsWith("+91")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("+")) {
    return { isValid: false, error: "Only Indian mobile numbers (+91) are currently supported." };
  }

  if (!/^\d{10}$/.test(digits)) {
    return { isValid: false, error: "Phone number must contain exactly 10 digits." };
  }
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { isValid: false, error: "Valid Indian mobile numbers must start with 6, 7, 8, or 9." };
  }
  return { isValid: true, cleanPhone: digits };
}

// Keep backward compatibility for existing boolean check
export function validatePhone(phone: string): boolean {
  return validatePhoneWithDetails(phone).isValid;
}

// DOB Validation
export function validateDob(dob: string): { isValid: boolean; error?: string } {
  if (!dob) {
    return { isValid: false, error: "Date of Birth is required." };
  }
  
  const parsedDate = new Date(dob);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: "Invalid date format." };
  }

  const today = new Date();
  if (parsedDate > today) {
    return { isValid: false, error: "Date of Birth cannot be in the future." };
  }

  // Age calculation (must be at least 13 years old for platform registration)
  const ageDiff = today.getFullYear() - parsedDate.getFullYear();
  if (ageDiff < 13) {
    return { isValid: false, error: "You must be at least 13 years old to use AGRI-NOVA." };
  }

  return { isValid: true };
}

// Detailed Password Strength Evaluator
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 to 4
  strengthLabel: "Weak" | "Fair" | "Good" | "Strong";
  errors: string[];
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noSpaces: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const pwd = password || "";
  const rules = {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\\|`~]/.test(pwd),
    noSpaces: !/\s/.test(pwd) && pwd.length > 0,
  };

  const errors: string[] = [];
  if (!rules.minLength) errors.push("Password must be at least 8 characters long.");
  if (!rules.hasUppercase) errors.push("Include at least one uppercase letter (A-Z).");
  if (!rules.hasLowercase) errors.push("Include at least one lowercase letter (a-z).");
  if (!rules.hasNumber) errors.push("Include at least one number (0-9).");
  if (!rules.hasSpecial) errors.push("Include at least one special symbol (!@#$%^&*).");
  if (!rules.noSpaces) errors.push("Password cannot contain spaces.");

  let score = 0;
  if (rules.minLength) score++;
  if (rules.hasUppercase && rules.hasLowercase) score++;
  if (rules.hasNumber) score++;
  if (rules.hasSpecial) score++;

  let strengthLabel: "Weak" | "Fair" | "Good" | "Strong" = "Weak";
  if (score === 2) strengthLabel = "Fair";
  else if (score === 3) strengthLabel = "Good";
  else if (score === 4) strengthLabel = "Strong";

  const isValid = errors.length === 0;

  return { isValid, score, strengthLabel, errors, rules };
}

// Strict password and confirm password check
export function validatePasswords(password: string, confirmPassword: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required." };
  }
  const strength = evaluatePasswordStrength(password);
  if (!strength.isValid) {
    return { isValid: false, error: strength.errors[0] || "Password does not meet security requirements." };
  }

  if (!confirmPassword) {
    return { isValid: false, error: "Confirm password is required." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true };
}

// Strict Change Password validation
export function validateChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (!currentPassword) {
    return { isValid: false, error: "Current password is required." };
  }
  if (!newPassword) {
    return { isValid: false, error: "New password is required." };
  }
  if (currentPassword === newPassword) {
    return { isValid: false, error: "New password cannot be the same as your current password." };
  }
  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return { isValid: false, error: strength.errors[0] || "New password does not meet security requirements." };
  }
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your new password." };
  }
  if (newPassword !== confirmPassword) {
    return { isValid: false, error: "New password and confirm password do not match." };
  }
  return { isValid: true };
}

// Strict Full Name validation
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters." };
  }
  if (trimmed.length > 70) {
    return { isValid: false, error: "Full name cannot exceed 70 characters." };
  }
  if (/\d/.test(trimmed)) {
    return { isValid: false, error: "Full name must contain letters only. Numbers are not allowed." };
  }
  if (!/^[a-zA-Z]+(?:[.' -][a-zA-Z]+)*$/.test(trimmed)) {
    return { isValid: false, error: "Full name must contain letters, spaces, hyphens, or dots only." };
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
