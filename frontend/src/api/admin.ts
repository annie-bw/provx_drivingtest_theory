import { apiRequest } from "./client";
import type {
  AdminDashboard,
  AdminQuestion,
  AdminQuestionPage,
  AdminUser,
  AdminUserPage,
} from "../types";

export async function getAdminDashboard(
  token: string,
): Promise<AdminDashboard> {
  return apiRequest<AdminDashboard>(
    "/admin/dashboard",
    {
      method: "GET",
    },
    token,
  );
}

export async function getAdminUsers(
  token: string,
  page = 0,
  size = 20,
): Promise<AdminUserPage> {
  return apiRequest<AdminUserPage>(
    `/admin/users?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    token,
  );
}

export async function getAdminQuestions(
  token: string,
  page = 0,
  size = 20,
): Promise<AdminQuestionPage> {
  return apiRequest<AdminQuestionPage>(
    `/admin/questions?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    token,
  );
}

export async function createAdminQuestion(
  token: string,
  request: {
    questionNumber: number;
    textRw: string;
    isImageBased: boolean;
    imageFilename?: string;
    options: {
      optionLetter: string;
      textRw: string;
      isCorrect: boolean;
    }[];
  },
): Promise<AdminQuestion> {
  return apiRequest<AdminQuestion>(
    "/admin/questions",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    token,
  );
}

export async function updateAdminQuestion(
  token: string,
  questionId: number,
  request: {
    questionNumber: number;
    textRw: string;
    isImageBased: boolean;
    imageFilename?: string;
    options: {
      optionLetter: string;
      textRw: string;
      isCorrect: boolean;
    }[];
  },
): Promise<AdminQuestion> {
  return apiRequest<AdminQuestion>(
    `/admin/questions/${questionId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    token,
  );
}

export async function deleteAdminQuestion(
  token: string,
  questionId: number,
): Promise<void> {
  return apiRequest<void>(
    `/admin/questions/${questionId}`,
    {
      method: "DELETE",
    },
    token,
  );
}

export async function toggleUserActive(
  token: string,
  userId: number,
): Promise<AdminUser> {
  return apiRequest<AdminUser>(
    `/admin/users/${userId}/toggle-active`,
    {
      method: "PATCH",
    },
    token,
  );
}
