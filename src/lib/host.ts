export function isAdminHost(hostname?: string | null) {
  if (!hostname) return false;
  const host = hostname.toLowerCase().split(":")[0];
  return host.startsWith("aditvault.") || host.includes("aditvault.website.com");
}

export function isCustomerHost(hostname?: string | null) {
  if (!hostname) return false;
  const host = hostname.toLowerCase().split(":")[0];
  return (
    host.startsWith("app.") ||
    host.includes("app.website.com") ||
    host.includes("app.aditkumarsingh.dev")
  );
}
