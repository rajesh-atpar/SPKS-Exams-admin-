import type { StaffRole, UserRole } from "@/lib/types";

export type WriteResource =
  | "catalog"
  | "content"
  | "videos"
  | "currentAffairs"
  | "tests"
  | "faqs"
  | "notifications"
  | "users"
  | "users.status"
  | "plans"
  | "legal"
  | "support";

export function isStaffRole(role?: UserRole | null): role is StaffRole {
  return role === "admin" || role === "editor" || role === "support";
}

export function canSeeNav(role: UserRole | undefined | null, href: string) {
  if (href === "/legal") return role === "admin";
  return Boolean(role);
}

export function canWrite(role: UserRole | undefined | null, resource: WriteResource) {
  if (role === "admin") return true;
  if (role === "editor") {
    return (
      resource === "catalog" ||
      resource === "content" ||
      resource === "videos" ||
      resource === "currentAffairs" ||
      resource === "tests" ||
      resource === "faqs" ||
      resource === "notifications"
    );
  }
  if (role === "support") {
    return resource === "support";
  }
  return false;
}
