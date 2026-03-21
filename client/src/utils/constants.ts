export const COLORS = {
  primary: "#3b82f6",
  primaryLight: "#60a5fa",
  primaryDark: "#2563eb",
  success: "#10b981",
  successLight: "#34d399",
  successDark: "#059669",
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  warningDark: "#d97706",
  danger: "#ef4444",
  dangerLight: "#f87171",
  dangerDark: "#dc2626",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  purpleDark: "#7c3aed",
} as const;

export const PIE_CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.danger,
];

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";