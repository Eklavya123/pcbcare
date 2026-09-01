export const TAB_ROUTES = {
  errors: "/error-codes",
  remote: "/find-remote",
  sensors: "/sensor-values",
  parts: "/part-finder",
  requests: "/requests",
  invoices: "/invoices",
};

export const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([k, v]) => [v, k])
);

export const RESERVED_PATH_PREFIXES = ["/shop", "/wiring", "/blog", ...Object.values(TAB_ROUTES)];
