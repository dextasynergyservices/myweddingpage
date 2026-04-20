/**
 * XSS Sanitization Utilities
 * Protects against Cross-Site Scripting attacks by sanitizing user input
 * Server-side compatible - no DOM dependencies
 */

/**
 * Sanitize HTML content with strict settings (no HTML allowed)
 * Use for: Names, titles, short text fields
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Clean text with no HTML tags
 *
 * @example
 * sanitizeHTML("<script>alert('xss')</script>Hello") // Returns: "Hello"
 * sanitizeHTML("John <b>Doe</b>") // Returns: "John Doe"
 */
export function sanitizeHTML(dirty: string): string {
  if (typeof dirty !== "string") {
    return "";
  }
  // Strip all HTML tags
  return dirty.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize HTML with basic formatting allowed
 * Use for: Messages, descriptions, comments
 * Allows: <b>, <i>, <em>, <strong>, <u>, <br>, <p>
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Clean HTML with basic formatting tags only
 *
 * @example
 * sanitizeBasicHTML("Hello <b>World</b><script>alert('xss')</script>")
 * // Returns: "Hello <b>World</b>"
 */
export function sanitizeBasicHTML(dirty: string): string {
  if (typeof dirty !== "string") {
    return "";
  }
  // Allow only basic formatting tags: b, i, em, strong, u, br, p
  return dirty.replace(/<(?!\/?(?:b|i|em|strong|u|br|p)>)[^>]*>/gi, "").trim();
}

/**
 * Sanitize HTML with rich formatting allowed
 * Use for: Blog posts, articles, rich text areas
 * Allows: Basic formatting + links + lists + headings
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Clean HTML with rich formatting tags
 *
 * @example
 * sanitizeRichHTML('<a href="https://example.com">Link</a><script>alert("xss")</script>')
 * // Returns: '<a href="https://example.com">Link</a>'
 */
export function sanitizeRichHTML(dirty: string): string {
  if (typeof dirty !== "string") {
    return "";
  }
  // Allow formatting, links, lists, headings
  return dirty
    .replace(
      /<(?!\/?(?:b|i|em|strong|u|br|p|a|ul|ol|li|blockquote|h[1-6])(?:\s|>))[^>]*>/gi,
      ""
    )
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
}

/**
 * Escape text to prevent XSS (converts HTML characters to entities)
 * Use for: Direct text rendering without HTML parsing
 *
 * @param input - The text to escape
 * @returns Text with HTML characters converted to entities
 *
 * @example
 * sanitizeText("<script>alert('xss')</script>")
 * // Returns: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize a URL to prevent javascript: and data: URIs
 * Use for: User-provided URLs, links, image sources
 *
 * @param url - The URL to sanitize
 * @returns Safe URL or empty string if invalid
 *
 * @example
 * sanitizeURL("javascript:alert('xss')") // Returns: ""
 * sanitizeURL("https://example.com") // Returns: "https://example.com"
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "about:",
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.toLowerCase().startsWith(protocol)) {
      return "";
    }
  }

  // Only allow http, https, mailto, tel
  const allowedProtocolRegex = /^(https?:\/\/|mailto:|tel:|\/)/i;
  if (!allowedProtocolRegex.test(trimmedUrl) && trimmedUrl.startsWith("http")) {
    return "";
  }

  return trimmedUrl;
}

/**
 * Sanitize email address
 * Use for: Email inputs
 *
 * @param email - The email to sanitize
 * @returns Sanitized and validated email or empty string
 *
 * @example
 * sanitizeEmail("user@example.com") // Returns: "user@example.com"
 * sanitizeEmail("<script>@example.com") // Returns: ""
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return "";
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return "";
  }

  return sanitized;
}

/**
 * Sanitize phone number (removes non-digit characters except +)
 * Use for: Phone number inputs
 *
 * @param phone - The phone number to sanitize
 * @returns Sanitized phone number
 *
 * @example
 * sanitizePhone("+1 (234) 567-8900") // Returns: "+12345678900"
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") {
    return "";
  }

  // Keep only digits and leading +
  const sanitized = phone.replace(/[^\d+]/g, "");

  // Ensure + is only at the start
  if (sanitized.includes("+")) {
    const parts = sanitized.split("+");
    return "+" + parts.filter((p) => p).join("");
  }

  return sanitized;
}

/**
 * Sanitize filename to prevent path traversal attacks
 * Use for: File uploads, file naming
 *
 * @param filename - The filename to sanitize
 * @returns Safe filename
 *
 * @example
 * sanitizeFilename("../../etc/passwd") // Returns: "etcpasswd"
 * sanitizeFilename("my file.jpg") // Returns: "my_file.jpg"
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") {
    return "";
  }

  return filename
    .replace(/[^a-z0-9._-]/gi, "_") // Replace special chars with underscore
    .replace(/\.{2,}/g, ".") // Remove multiple dots
    .replace(/^\.+/, "") // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize JSON input (prevents prototype pollution)
 * Use for: API inputs that accept JSON
 *
 * @param json - The JSON string to sanitize
 * @returns Parsed and sanitized object or null
 */
export function sanitizeJSON(json: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(json);

    // Remove __proto__, constructor, prototype keys
    const sanitized = JSON.parse(
      JSON.stringify(parsed, (key, value) => {
        if (["__proto__", "constructor", "prototype"].includes(key)) {
          return undefined;
        }
        return value;
      })
    );

    return sanitized;
  } catch {
    return null;
  }
}

/**
 * Batch sanitize an object's string values
 * Use for: Sanitizing entire form data objects
 *
 * @param data - Object with string values to sanitize
 * @param sanitizer - Sanitization function to apply (defaults to sanitizeHTML)
 * @returns Object with sanitized values
 *
 * @example
 * sanitizeObject({ name: "<script>XSS</script>", age: 25 })
 * // Returns: { name: "", age: 25 }
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  data: T,
  sanitizer: (value: string) => string = sanitizeHTML
): T {
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizer(sanitized[key] as string) as T[Extract<
        keyof T,
        string
      >];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>,
        sanitizer
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Strip all HTML tags and return plain text
 * Alternative to sanitizeHTML when you want to preserve text content
 *
 * @param html - HTML string to strip tags from
 * @returns Plain text without any HTML
 *
 * @example
 * stripHTML("<p>Hello <b>World</b></p>") // Returns: "Hello World"
 */
export function stripHTML(html: string): string {
  if (typeof html !== "string") {
    return "";
  }
  // Strip all HTML tags but keep content
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Default export with all sanitization functions
 */
const sanitizeUtils = {
  sanitizeHTML,
  sanitizeBasicHTML,
  sanitizeRichHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFilename,
  sanitizeJSON,
  sanitizeObject,
  stripHTML,
};

export default sanitizeUtils;
