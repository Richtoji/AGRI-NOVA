import {
  validateEmail,
  validatePhone,
  validatePasswords,
  validateFullName,
  validateRoleMetadata,
  validateCropInputs,
  validateExpenseAmount,
  validateCowTag,
  validateRentalDays,
  validatePrescription,
} from "../src/lib/validation";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const tests: { name: string; fn: () => void }[] = [];

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// 1. Email validation tests
test("Email validation pattern", () => {
  assert(validateEmail("farmer@agri-nova.com"), "Should accept standard email");
  assert(validateEmail("  farmer@agri-nova.com  "), "Should trim email and accept it");
  assert(!validateEmail("farmeragri-nova.com"), "Should reject missing @");
  assert(!validateEmail("farmer@agri-nova"), "Should reject missing domain extension");
  assert(!validateEmail("farmer@agri-nova."), "Should reject missing letters after domain dot");
  assert(!validateEmail("farmer @agri-nova.com"), "Should reject space in email");
  assert(!validateEmail("farmer@@agri-nova.com"), "Should reject duplicate @");
  assert(!validateEmail(""), "Should reject empty email");
});

// 2. Phone validation tests
test("Phone number formats", () => {
  assert(validatePhone("+919876543210"), "Should accept standard Indian format");
  assert(validatePhone("9876543210"), "Should accept 10-digit number");
  assert(validatePhone("+91 98765 43210"), "Should accept number with spaces");
  assert(!validatePhone("1234567890"), "Should reject invalid Indian mobile starting digit (1 is invalid)");
  assert(!validatePhone("0000000000"), "Should reject starting with 0");
  assert(!validatePhone("123"), "Should reject too short number");
  assert(!validatePhone("1234567890123"), "Should reject too long number");
  assert(!validatePhone("abc1234567"), "Should reject letters in phone");
  assert(!validatePhone("98765abc10"), "Should reject letters inside");
});

// 3. Password matching and criteria
test("Password and Confirm Password checks", () => {
  assert(validatePasswords("Strong@123", "Strong@123").isValid, "Should accept strong password matching confirm password");
  assert(!validatePasswords("pass123", "pass123").isValid, "Should reject short passwords (< 8 chars)");
  assert(!validatePasswords("strong@123", "strong@123").isValid, "Should reject password missing uppercase");
  assert(!validatePasswords("STRONG@123", "STRONG@123").isValid, "Should reject password missing lowercase");
  assert(!validatePasswords("Strong@abc", "Strong@abc").isValid, "Should reject password missing number");
  assert(!validatePasswords("Strong123", "Strong123").isValid, "Should reject password missing special character");
  assert(!validatePasswords("password123", "password123").isValid, "Should reject common password word");
  assert(!validatePasswords("Rich123", "Rich123").isValid, "Should reject forbidden name variation");
  
  const mismatch = validatePasswords("Strong@123", "Strong@1234");
  assert(!mismatch.isValid && !!mismatch.error?.includes("do not match"), "Should reject password mismatch");
});

// 4. Full Name validation tests
test("Full Name checks", () => {
  assert(validateFullName("Rich").isValid, "Should accept standard short name");
  assert(validateFullName("Jose Mathew").isValid, "Should accept multi-word name with single space");
  assert(validateFullName("Rich Toji").isValid, "Should accept full name");
  assert(!validateFullName("R").isValid, "Should reject too short name (< 2 chars)");
  assert(!validateFullName("Rich123").isValid, "Should reject name with numbers");
  assert(!validateFullName("Rich@Toji").isValid, "Should reject special characters");
  assert(!validateFullName("Rich  Toji").isValid, "Should reject consecutive spaces");
  assert(!validateFullName("").isValid, "Should reject empty name");
  assert(!validateFullName("   ").isValid, "Should reject spaces-only name");
  assert(!validateFullName("Richhhhh").isValid, "Should reject excessive repeated characters");
});

// 5. Role Metadata validation tests
test("Role specific metadata validation", () => {
  // Farmer location
  assert(validateRoleMetadata("FARMER", "Ludhiana, Punjab").isValid, "Should accept valid farmer location");
  assert(!validateRoleMetadata("FARMER", "Ludh").isValid, "Should reject too short location");
  assert(!validateRoleMetadata("FARMER", "12345").isValid, "Should reject numeric-only location");
  assert(!validateRoleMetadata("FARMER", "<script>alert(1)</script>").isValid, "Should reject scripts in location");

  // Buyer GSTIN
  assert(validateRoleMetadata("BUYER", "07AAAAA0000A1Z5").isValid, "Should accept valid GSTIN format");
  assert(!validateRoleMetadata("BUYER", "07AAAAA0000A1Z").isValid, "Should reject too short GSTIN");
  assert(!validateRoleMetadata("BUYER", "INVALIDGSTIN1234").isValid, "Should reject invalid GSTIN characters");

  // Veterinary Experts
  assert(validateRoleMetadata("VETERINARY_EXPERT", "VET-REG-9402").isValid, "Should accept valid Vet registration");
  assert(!validateRoleMetadata("VETERINARY_EXPERT", "VET").isValid, "Should reject too short Vet registration");
  assert(!validateRoleMetadata("VETERINARY_EXPERT", "<b>bold</b>").isValid, "Should reject HTML tags");
});

// 6. Crop Recommender boundary checks
test("Crop Recommender inputs boundaries", () => {
  assert(validateCropInputs(70, 40, 45, 6.8, 110).isValid, "Should accept valid crop inputs");
  
  const negativeN = validateCropInputs(-10, 40, 45, 6.8, 110);
  assert(!negativeN.isValid && !!negativeN.errors.n, "Should reject negative Nitrogen");

  const outOfBoundsPh = validateCropInputs(70, 40, 45, 15.0, 110);
  assert(!outOfBoundsPh.isValid && !!outOfBoundsPh.errors.ph, "Should reject pH > 14.0");

  const negativePh = validateCropInputs(70, 40, 45, -1.0, 110);
  assert(!negativePh.isValid && !!negativePh.errors.ph, "Should reject pH < 0.0");

  const negativeRain = validateCropInputs(70, 40, 45, 6.8, -50);
  assert(!negativeRain.isValid && !!negativeRain.errors.rainfall, "Should reject negative rainfall");
});

// 7. Expense ledger checks
test("Ledger expense validation", () => {
  assert(validateExpenseAmount(1500).isValid, "Should accept positive expense");
  assert(!validateExpenseAmount(-500).isValid, "Should reject negative expense");
  assert(!validateExpenseAmount(0).isValid, "Should reject zero expense");
  assert(!validateExpenseAmount("abc").isValid, "Should reject non-numeric expense");
});

// 8. Cow tag duplicate check
test("Cattle tag unique validation", () => {
  const existing = ["TAG-901", "TAG-902"];
  assert(validateCowTag("TAG-903", existing).isValid, "Should accept unique tag");
  
  const duplicate = validateCowTag("TAG-901", existing);
  assert(!duplicate.isValid && !!duplicate.error?.includes("already exists"), "Should reject duplicate tag");

  const caseDuplicate = validateCowTag("tag-902", existing);
  assert(!caseDuplicate.isValid, "Should reject duplicate tag case-insensitively");

  const invalidFormat = validateCowTag("A", existing);
  assert(!invalidFormat.isValid && !!invalidFormat.error?.includes("alphanumeric"), "Should reject too short tag");
});

// 9. Equipment rental duration
test("Rental days validation", () => {
  assert(validateRentalDays(5).isValid, "Should accept days between 1 and 30");
  assert(!validateRentalDays(0).isValid, "Should reject 0 days");
  assert(!validateRentalDays(35).isValid, "Should reject > 30 days");
  assert(!validateRentalDays(5.5).isValid, "Should reject decimal days");
});

// 10. Veterinary digital prescription
test("Prescription non-empty and length requirement", () => {
  assert(validatePrescription("Give Oxytetracycline 10ml daily for 3 days"), "Should accept valid prescription text");
  assert(!validatePrescription("Short"), "Should reject too short prescription (< 10 chars)");
  assert(!validatePrescription("          "), "Should reject empty/whitespace prescription");
});

export function runTests(): boolean {
  let allPassed = true;
  console.log("=== Running AGRI-NOVA Validation Test Suite ===");
  
  for (const t of tests) {
    try {
      t.fn();
      console.log(`[PASS] ${t.name}`);
    } catch (e: any) {
      console.error(`[FAIL] ${t.name}: ${e.message}`);
      allPassed = false;
    }
  }

  console.log("===============================================");
  return allPassed;
}
