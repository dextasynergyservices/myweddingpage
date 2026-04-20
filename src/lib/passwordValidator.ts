/**
 * Password Strength Validator
 * Provides comprehensive password validation and strength checking
 */

export interface PasswordValidationResult {
  isValid: boolean;
  strength: "weak" | "fair" | "good" | "strong" | "very-strong";
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

/**
 * Common passwords list (top 100 most common)
 * In production, consider using a more comprehensive list or API like have-i-been-pwned
 */
const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "baseball",
  "abc123",
  "football",
  "monkey",
  "letmein",
  "shadow",
  "master",
  "666666",
  "qwertyuiop",
  "123321",
  "mustang",
  "1234567890",
  "michael",
  "654321",
  "superman",
  "1qaz2wsx",
  "7777777",
  "121212",
  "000000",
  "qazwsx",
  "123qwe",
  "killer",
  "trustno1",
  "jordan",
  "jennifer",
  "zxcvbnm",
  "asdfgh",
  "hunter",
  "buster",
  "soccer",
  "harley",
  "batman",
  "andrew",
  "tigger",
  "sunshine",
  "iloveyou",
  "2000",
  "charlie",
  "robert",
  "thomas",
  "hockey",
  "ranger",
  "daniel",
  "starwars",
  "klaster",
  "112233",
  "george",
  "computer",
  "michelle",
  "jessica",
  "pepper",
  "1111",
  "zxcvbn",
  "555555",
  "11111111",
  "131313",
  "freedom",
  "777777",
  "pass",
  "maggie",
  "159753",
  "aaaaaa",
  "ginger",
  "princess",
  "joshua",
  "cheese",
  "amanda",
  "summer",
  "love",
  "ashley",
  "nicole",
  "chelsea",
  "biteme",
  "matthew",
  "access",
  "yankees",
  "987654321",
  "dallas",
  "austin",
  "thunder",
  "taylor",
  "matrix",
  "mobilemail",
  "mom",
  "monitor",
  "monitoring",
  "montana",
  "moon",
  "moscow",
]);

/**
 * Validate password against security requirements
 *
 * @param password - The password to validate
 * @returns Validation result with strength score and feedback
 *
 * @example
 * validatePassword("weak") // Returns: { isValid: false, strength: "weak", ... }
 * validatePassword("MyP@ssw0rd123") // Returns: { isValid: true, strength: "strong", ... }
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Basic validation
  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      strength: "weak",
      score: 0,
      errors: ["Password is required"],
      suggestions: ["Please enter a password"],
    };
  }

  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
    suggestions.push("Use at least 8 characters");
  } else if (password.length >= 8 && password.length < 12) {
    score += 10;
    suggestions.push("Consider using 12+ characters for better security");
  } else if (password.length >= 12 && password.length < 16) {
    score += 20;
  } else if (password.length >= 16) {
    score += 30;
  }

  // Maximum length check (prevent DoS)
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
    return {
      isValid: false,
      strength: "weak",
      score: 0,
      errors,
      suggestions: ["Use a shorter password"],
    };
  }

  // Character type checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()\-_+=\[\]{}|;:',.<>\/~`]/.test(password);

  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter");
    suggestions.push("Add lowercase letters (a-z)");
  } else {
    score += 10;
  }

  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
    suggestions.push("Add uppercase letters (A-Z)");
  } else {
    score += 10;
  }

  if (!hasNumber) {
    errors.push("Password must contain at least one number");
    suggestions.push("Add numbers (0-9)");
  } else {
    score += 10;
  }

  if (!hasSpecial) {
    errors.push("Password must contain at least one special character");
    suggestions.push("Add special characters (@, $, !, %, *, ?, &, #, etc.)");
  } else {
    score += 10;
  }

  // Bonus points for variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars > 10) {
    score += 10;
  }
  if (uniqueChars > 15) {
    score += 10;
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("This password is too common and easily guessable");
    suggestions.push("Avoid common passwords");
    score = Math.max(0, score - 30);
  }

  // Check for sequential characters
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password
    )
  ) {
    suggestions.push("Avoid sequential characters (abc, 123, etc.)");
    score = Math.max(0, score - 10);
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push("Avoid repeating characters (aaa, 111, etc.)");
    score = Math.max(0, score - 10);
  }

  // Check for keyboard patterns
  if (/(qwerty|asdfgh|zxcvbn|qazwsx)/i.test(password)) {
    suggestions.push("Avoid keyboard patterns (qwerty, asdfgh, etc.)");
    score = Math.max(0, score - 15);
  }

  // Determine strength based on score
  let strength: PasswordValidationResult["strength"];
  if (score < 20) {
    strength = "weak";
  } else if (score < 40) {
    strength = "fair";
  } else if (score < 60) {
    strength = "good";
  } else if (score < 80) {
    strength = "strong";
  } else {
    strength = "very-strong";
  }

  // Add positive suggestions for strong passwords
  if (strength === "very-strong" && suggestions.length === 0) {
    suggestions.push("Excellent password! This is very secure.");
  } else if (strength === "strong" && suggestions.length === 0) {
    suggestions.push("Great password! Consider making it even longer.");
  }

  return {
    isValid: errors.length === 0,
    strength,
    score,
    errors,
    suggestions,
  };
}

/**
 * Quick password validation (for basic requirements only)
 * Returns true if password meets minimum requirements
 *
 * @param password - The password to validate
 * @returns Boolean indicating if password is valid
 *
 * @example
 * isPasswordValid("weak") // Returns: false
 * isPasswordValid("MyP@ssw0rd123") // Returns: true
 */
export function isPasswordValid(password: string): boolean {
  if (!password || password.length < 8 || password.length > 128) {
    return false;
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()\-_+=\[\]{}|;:',.<>\/~`]/.test(password);

  return hasLowercase && hasUppercase && hasNumber && hasSpecial;
}

/**
 * Get password strength label with color
 * Useful for UI feedback
 *
 * @param strength - The strength level
 * @returns Object with label and color
 *
 * @example
 * getStrengthLabel("weak") // Returns: { label: "Weak", color: "red" }
 */
export function getStrengthLabel(strength: PasswordValidationResult["strength"]): {
  label: string;
  color: string;
  bgColor: string;
} {
  const labels = {
    weak: { label: "Weak", color: "text-red-600", bgColor: "bg-red-100" },
    fair: { label: "Fair", color: "text-orange-600", bgColor: "bg-orange-100" },
    good: { label: "Good", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    strong: {
      label: "Strong",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    "very-strong": {
      label: "Very Strong",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  };

  return labels[strength];
}

/**
 * Generate a strong random password
 * Useful for password reset suggestions
 *
 * @param length - Desired password length (default: 16)
 * @returns Randomly generated strong password
 *
 * @example
 * generateStrongPassword() // Returns: "aB3$xY9!mN2@pQ5&"
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "@$!%*?&";
  const all = lowercase + uppercase + numbers + special;

  let password = "";

  // Ensure at least one of each required type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Check if password is compromised (basic check against common passwords)
 * In production, integrate with Have I Been Pwned API
 *
 * @param password - The password to check
 * @returns Boolean indicating if password is compromised
 */
export function isPasswordCompromised(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Compare two passwords for equality
 * Constant-time comparison to prevent timing attacks
 *
 * @param password1 - First password
 * @param password2 - Second password
 * @returns Boolean indicating if passwords match
 */
export function comparePasswords(password1: string, password2: string): boolean {
  if (!password1 || !password2 || password1.length !== password2.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < password1.length; i++) {
    result |= password1.charCodeAt(i) ^ password2.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Default export with all password utilities
 */
const passwordValidatorUtils = {
  validatePassword,
  isPasswordValid,
  getStrengthLabel,
  generateStrongPassword,
  isPasswordCompromised,
  comparePasswords,
};

export default passwordValidatorUtils;
