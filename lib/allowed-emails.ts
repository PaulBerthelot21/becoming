export function getAllowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const allowed = getAllowedEmails();
  if (allowed.length === 0) {
    return false;
  }

  return allowed.includes(email.trim().toLowerCase());
}
