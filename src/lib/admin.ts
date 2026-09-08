function adminEmails() {
  return new Set(
    [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS?.split(",")]
      .flat()
      .map((value) => value?.trim().toLowerCase())
      .filter((value): value is string => Boolean(value)),
  );
}

export function isAdminEmail(email: string) {
  return adminEmails().has(email.trim().toLowerCase());
}
