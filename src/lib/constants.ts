// Central copy for the demo/simulation disclosure. Every screen that shows a
// balance, price, return, or transaction must surface one of these — never
// hardcode the wording elsewhere so it stays consistent and easy to audit.

export const DEMO_MODE = true;

export const DEMO_BADGE_TEXT = "DEMO";
export const DEMO_BANNER_TEXT =
  "Simulation platform — all balances, prices, returns, and transactions shown are simulated and do not represent real money or real market data.";
export const DEMO_SHORT_DISCLAIMER =
  "Simulated data. Not real money. Not financial advice.";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_USER = "USER";

// Every new signup starts with this much DEMO cash so the dashboard/portfolio
// aren't empty. Not a real balance, not a bonus, not redeemable.
export const STARTING_DEMO_BALANCE = 10000;

export const PLATFORM_SETTING_KEYS = {
  SITE_NAME: "site_name",
  DEPOSIT_INSTRUCTIONS: "deposit_instructions",
  DEPOSIT_REFERENCE_PREFIX: "deposit_reference_prefix",
  SUPPORT_EMAIL: "support_email",
} as const;
