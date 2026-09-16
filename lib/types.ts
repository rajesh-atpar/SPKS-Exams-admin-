export type StaffRole = "admin" | "editor" | "support";
export type UserRole = "user" | StaffRole;
export type UserStatus = "active" | "inactive" | "blocked" | "deleted";

export type StaffUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  state?: string | null;
  role: UserRole;
  status?: UserStatus;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthPayload = {
  user: StaffUser;
  accessToken: string;
  refreshToken: string;
};

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
  errors?: Array<{ field?: string; message: string }>;
  code?: string;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
};
