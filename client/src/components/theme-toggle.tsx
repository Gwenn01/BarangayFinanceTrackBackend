import { Moon, Sun } from "lucide-react";
import { useTheme } from "../components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between w-full px-1 py-1">
      <span className="text-sm text-muted-foreground">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        data-testid="button-theme-toggle"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          width: "52px",
          height: "28px",
          borderRadius: "9999px",
          border: "none",
          cursor: "pointer",
          padding: "3px",
          transition: "background 0.35s ease",
          background: isDark ? "#808080" : "#e5e7eb",
          outline: "none",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transform: isDark ? "translateX(24px)" : "translateX(0px)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
          }}
        >
          {isDark ? (
            <Moon size={12} style={{ color: "#000000", strokeWidth: 2.5 }} />
          ) : (
            <Sun size={13} style={{ color: "#f59e0b", strokeWidth: 2.5 }} />
          )}
        </span>
      </button>
    </div>
  );
}