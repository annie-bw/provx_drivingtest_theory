import { apiRequest } from "./client";

export type BackendRole = "STUDENT" | "ADMIN";

export interface AuthData {
  token: string;
  tokenType: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: BackendRole;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthData> {
  return apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<AuthData> {
  return apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}
