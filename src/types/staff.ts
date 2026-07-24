import type { Role } from "@/types/auth";

export interface StaffUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

export interface StaffProfile {
  id: number;
  user: StaffUser;
  employee_id: string;
  position: string;
  hire_date: string | null;
  salary: string;
}

export interface CreateStaffProfileInput {
  user_id: number;
  employee_id: string;
  position: string;
  hire_date: string | null;
  salary: string;
}

export type UpdateStaffProfileInput = Partial<Omit<CreateStaffProfileInput, "user_id">> & { id: number };
