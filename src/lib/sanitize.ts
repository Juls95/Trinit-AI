import DOMPurify from "isomorphic-dompurify";

const MAX_CHAT_LENGTH = 2000;

export function sanitizeInput(input: string): string {
  if (input.length > MAX_CHAT_LENGTH) {
    input = input.slice(0, MAX_CHAT_LENGTH);
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeEmail(email: string): string {
  const cleaned = DOMPurify.sanitize(email, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error("Invalid email format");
  }
  return cleaned.toLowerCase().trim();
}
