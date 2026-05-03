import { apiRequest } from "./client";
import type { ExamResponse, ExamAnswerResponse, DashboardResponse } from "../types";

export interface AnswerRequest {
  questionId: number;
  selectedOptionId: number | null;
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
  examId: number,
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

export async function saveExamAnswer(
  examId: number,
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
  examId: number,
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
  examId: number,
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

export async function getExamHistory(token: string): Promise<ExamResponse[]> {
  return apiRequest<ExamResponse[]>(
    "/exams/history",
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
