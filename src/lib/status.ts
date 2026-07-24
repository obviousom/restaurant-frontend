import type { CSSProperties } from "react";

import type { OrderStatus } from "@/types/order";

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  PLACED: { bg: "#F1E5CE", color: "#8A6A2A" },
  IN_KITCHEN: { bg: "#FBEED9", color: "#B9791F" },
  READY: { bg: "#E4EEF3", color: "#2E6B7A" },
  SERVED: { bg: "#E7F0E3", color: "#4C7A4E" },
  PAID: { bg: "#E7F0E3", color: "#4C7A4E" },
  CANCELLED: { bg: "#F6E3E1", color: "#9C3B3B" },
};

export function statusBadgeStyle(status: OrderStatus): CSSProperties {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.PLACED;
  return { backgroundColor: c.bg, color: c.color };
}

export function formatElapsed(isoDate: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr${hours === 1 ? "" : "s"} ago`;
}
