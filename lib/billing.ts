import type { StaffUser } from "@/lib/types";

export type BillingPlan = {
  id?: string;
  name?: string;
  price?: number;
  amount?: number;
  currency?: string;
  duration?: number;
  interval?: "1_month" | "6_months" | "1_year" | "none" | string;
  startDate?: string | null;
  endDate?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};

export type BillingUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
};

export type BillingSubscription = {
  id: string;
  userId?: string;
  planId?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  cancelledAt?: string;
  daysRemaining?: number;
  user?: BillingUser | null;
  plan?: BillingPlan | null;
};

export type BillingPayment = {
  id: string;
  userId?: string;
  planId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  provider?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  createdAt?: string;
  user?: BillingUser | null;
  plan?: BillingPlan | null;
};

export type StudentUser = StaffUser & {
  hasActiveSubscription?: boolean;
  subscription?: BillingSubscription | null;
};

export type UserBilling = {
  user?: BillingUser | null;
  hasActiveSubscription?: boolean;
  subscription?: BillingSubscription | null;
  subscriptions?: BillingSubscription[];
  payments?: BillingPayment[];
};

export function formatInr(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN");
}

export function userDisplayName(user?: BillingUser | StaffUser | null) {
  if (!user) return "—";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "—";
}

export function planIntervalLabel(plan?: BillingPlan | null) {
  if (!plan) return "—";
  if (plan.interval === "1_month") return "Monthly";
  if (plan.interval === "6_months") return "6 Months";
  if (plan.interval === "1_year") return "Yearly";
  const days = Number(plan.duration || 0);
  if (days >= 360) return "Yearly";
  if (days >= 150) return "6 Months";
  if (days > 0) return "Monthly";
  return plan.name || "—";
}

export function planAmount(plan?: BillingPlan | null) {
  if (!plan) return 0;
  const value = plan.amount ?? plan.price;
  return Number(value || 0);
}

export function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function planSummary(sub?: BillingSubscription | null) {
  if (!sub) return "No active plan";
  const plan =
    planIntervalLabel(sub.plan) !== "—" ? planIntervalLabel(sub.plan) : sub.plan?.name || "Plan";
  const days =
    sub.status === "active" && typeof sub.daysRemaining === "number"
      ? ` · ${sub.daysRemaining} day${sub.daysRemaining === 1 ? "" : "s"} left`
      : "";
  return `${plan} · ${sub.status || "—"}${sub.endsAt ? ` · ends ${formatDate(sub.endsAt)}` : ""}${days}`;
}
