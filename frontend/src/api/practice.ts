import { apiRequest } from "./client";
import type { PracticeSessionResponse, PracticeAnswerResponse } from "../types";

export interface AnswerRequest {
  questionId: string;
  selectedOptionId: string | null;
}

export async function startPractice(
  token: string,
): Promise<PracticeSessionResponse> {
  return apiRequest<PracticeSessionResponse>(
    "/practice/start",
    {
      method: "POST",
    },
    token,
  );
}

export async function getPracticeSession(
  sessionId: string,
  token: string,
): Promise<PracticeSessionResponse> {
  return apiRequest<PracticeSessionResponse>(
    `/practice/${sessionId}`,
    {
      method: "GET",
    },
    token,
  );
}

export async function submitPracticeAnswer(
  sessionId: string,
  request: AnswerRequest,
  token: string,
): Promise<PracticeAnswerResponse> {
  return apiRequest<PracticeAnswerResponse>(
    `/practice/${sessionId}/answer`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    token,
  );
}

export async function getPracticeHistory(
  token: string,
): Promise<PracticeSessionResponse[]> {
  return apiRequest<PracticeSessionResponse[]>(
    "/practice/history",
    {
      method: "GET",
    },
    token,
  );
}
