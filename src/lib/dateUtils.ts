/**
 * Date Utilities for Wedding Pages
 * Handles timezone-agnostic date formatting to ensure dates display correctly
 * regardless of server timezone or user location
 */

/**
 * Format a date string in a timezone-agnostic way
 *
 * This function treats the date as a local date (no timezone conversion)
 * to ensure "October 11" stays "October 11" everywhere in the world
 *
 * @param dateString - Date string in YYYY-MM-DD format (e.g., "2025-10-11")
 * @param format - Format style: "long" (October 11, 2025) or "short" (10/11/2025)
 * @returns Formatted date string
 *
 * @example
 * formatWeddingDate("2025-10-11") // "October 11, 2025"
 * formatWeddingDate("2025-10-11", "short") // "10/11/2025"
 */
export function formatWeddingDate(
  dateString: string | undefined | null,
  format: "long" | "short" = "long"
): string {
  if (!dateString) {
    return format === "long" ? "Date to be announced" : "TBA";
  }

  // Check if already formatted (contains month name)
  const isAlreadyFormatted =
    /january|february|march|april|may|june|july|august|september|october|november|december/i.test(
      dateString
    );

  if (isAlreadyFormatted) {
    return dateString;
  }

  try {
    // Parse date components manually to avoid timezone issues
    // Input format should be YYYY-MM-DD
    const parts = dateString.split("T")[0].split("-"); // Handle both "2025-10-11" and "2025-10-11T00:00:00"

    if (parts.length !== 3) {
      console.warn(`Invalid date format: ${dateString}`);
      return dateString;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[2], 10);

    // Create date object with local time (no timezone conversion)
    const date = new Date(year, month, day);

    // Verify the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return dateString;
    }

    if (format === "short") {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }

    // Long format: "October 11, 2025"
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Get a human-readable date with day of week
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date with day of week (e.g., "Saturday, October 11, 2025")
 *
 * @example
 * formatWeddingDateWithDay("2025-10-11") // "Saturday, October 11, 2025"
 */
export function formatWeddingDateWithDay(
  dateString: string | undefined | null
): string {
  if (!dateString) {
    return "Date to be announced";
  }

  try {
    // Parse date components manually to avoid timezone issues
    const parts = dateString.split("T")[0].split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date with day:", error);
    return dateString;
  }
}

/**
 * Check if a date string is valid
 *
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDate(dateString: string | undefined | null): boolean {
  if (!dateString) return false;

  try {
    const parts = dateString.split("T")[0].split("-");
    if (parts.length !== 3) return false;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
