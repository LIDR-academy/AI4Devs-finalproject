import hotToast from "react-hot-toast";

const DURATIONS = {
  success: 3000,
  warning: 5000,
  info: 3000,
} as const;

export const toast = {
  success: (message: string) => hotToast.success(message, { duration: DURATIONS.success }),
  error: (message: string) => hotToast.error(message, { duration: Infinity }),
  warning: (message: string) =>
    hotToast(message, {
      duration: DURATIONS.warning,
      icon: "⚠",
      style: {
        border: "1px solid #f59e0b",
        background: "#fffbeb",
        color: "#78350f",
      },
    }),
  info: (message: string) =>
    hotToast(message, {
      duration: DURATIONS.info,
      icon: "ℹ",
      style: {
        border: "1px solid #3b82f6",
        background: "#eff6ff",
        color: "#1e3a8a",
      },
    }),
};
