const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/**
 * pg v8 treats prefer/require/verify-ca like verify-full and emits a deprecation warning.
 * Explicit sslmode=verify-full keeps the same behavior without the warning.
 */
export function normalizePgConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (!sslmode || LEGACY_SSL_MODES.has(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    if (/sslmode=(prefer|require|verify-ca)\b/.test(connectionString)) {
      return connectionString.replace(
        /sslmode=(prefer|require|verify-ca)\b/,
        "sslmode=verify-full"
      );
    }
    if (!connectionString.includes("sslmode=")) {
      return `${connectionString}${connectionString.includes("?") ? "&" : "?"}sslmode=verify-full`;
    }
    return connectionString;
  }
}

export function getPgConnectionString(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  return normalizePgConnectionString(raw);
}
