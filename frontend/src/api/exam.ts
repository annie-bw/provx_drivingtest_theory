import { apiRequest } from "./client";
import type {
  ExamHistoryPage,
  ExamResponse,
  ExamAnswerResponse,
  DashboardResponse,
} from "../types";

export interface AnswerRequest {
  questionId: string;
  selectedOptionId: string | null;
}

export async function startExam(token: string): Promise<ExamResponse> {
  return apiRequest<ExamResponse>(
    "/exams/start",
    {
      method: "POST",
    },
    token,
  );
}

export async function getExam(
  examId: string,
  token: string,
): Promise<ExamResponse> {
  return apiRequest<ExamResponse>(
    `/exams/${examId}`,
    {
      method: "GET",
    },
    token,
  );
}

export async function getCurrentExam(token: string): Promise<ExamResponse | null> {
  const response = await apiRequest<{ data: ExamResponse | null }>(
    "/exams/current",
    {
      method: "GET",
    },
    token,
  );
  return response.data;
}

export async function saveExamAnswer(
  examId: string,
  request: AnswerRequest,
  token: string,
): Promise<ExamAnswerResponse> {
  return apiRequest<ExamAnswerResponse>(
    `/exams/${examId}/answer`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    token,
  );
}

export async function submitExam(
  examId: string,
  token: string,
): Promise<ExamResponse> {
  return apiRequest<ExamResponse>(
    `/exams/${examId}/submit`,
    {
      method: "POST",
    },
    token,
  );
}

export async function reviewExam(
  examId: string,
  token: string,
): Promise<ExamResponse> {
  return apiRequest<ExamResponse>(
    `/exams/${examId}/review`,
    {
      method: "GET",
    },
    token,
  );
}

export async function getExamHistory(
  token: string,
  page = 0,
  size = 20,
): Promise<ExamHistoryPage> {
  return apiRequest<ExamHistoryPage>(
    `/exams/history?page=${page}&size=${size}`,
    {
      method: "GET",
    },
    token,
  );
}

export async function getLatestCompletedExam(
  token: string,
): Promise<ExamResponse> {
  return apiRequest<ExamResponse>(
    "/exams/history/latest",
    {
      method: "GET",
    },
    token,
  );
}

export async function getDashboard(token: string): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(
    "/exams/dashboard",
    {
      method: "GET",
    },
    token,
  );
}
