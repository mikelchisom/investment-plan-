// One quiet, honest line kept in a single unobtrusive spot (account footer /
// settings) — not plastered across every screen — so this stays truthful
// without reading as a scary warning banner.
export const PLATFORM_DISCLOSURE =
  "Personal practice account. Not connected to a real bank or brokerage.";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_USER = "USER";

// Starting balance a new account opens with.
export const STARTING_BALANCE = 10000;

export const PLATFORM_SETTING_KEYS = {
  SITE_NAME: "site_name",
  DEPOSIT_INSTRUCTIONS: "deposit_instructions",
  DEPOSIT_REFERENCE_PREFIX: "deposit_reference_prefix",
  SUPPORT_EMAIL: "support_email",
} as const;
