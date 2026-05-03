export type UserRole = "student" | "admin";
export type BackendRole = "STUDENT" | "ADMIN";

export interface QuestionOption {
  id: string;
  text: { en: string; rw: string };
}

export interface Question {
  id: string;
  bank: string;
  text: { en: string; rw: string };
  image?: string;
  options: QuestionOption[];
  correctId: string;
  note?: { en: string; rw: string };
}

export interface ExamRecord {
  id: string;
  date: string;
  score: number;
  total: number;
  passed: boolean;
  correctIds: string[];
  selectedAnswers: Record<string, string>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  practiceCompleted: number;
  examHistory: ExamRecord[];
}

export interface ApiOption {
  id: string;
  optionLetter: string;
  textRw: string;
  isCorrect?: boolean | null;
}

export interface ApiQuestion {
  id: string;
  questionNumber: number;
  textRw: string;
  isImageBased: boolean;
  imageUrl?: string;
  options: ApiOption[];
  position: number;
}

export interface ExamAnswerResponse {
  questionId: string;
  position: number;
  selectedOptionId: string | null;
  isCorrect?: boolean | null;
  correctOptionId?: string;
  correctOptionText?: string;
  questionTextRw?: string;
  imageUrl?: string;
  options?: ApiOption[];
}

export interface ExamResponse {
  id: string;
  status: string;
  totalQuestions: number;
  correctCount?: number;
  scorePercent?: number;
  passed?: boolean;
  passThreshold?: number;
  durationSeconds?: number;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  questions: ApiQuestion[];
  answers: ExamAnswerResponse[];
  review?: ExamAnswerResponse[];
}

export interface PracticeSessionResponse {
  id: number;
  status: string;
  totalQuestions: number;
  correctCount?: number;
  scorePercent?: number;
  startedAt: string;
  completedAt?: string;
  questions: ApiQuestion[];
}

export interface PracticeAnswerResponse {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  correctOptionId: string;
  correctOptionText: string;
}

export interface AdminExam {
  id: string;
  status: string;
  totalQuestions: number;
  correctCount?: number;
  scorePercent?: number;
  passed?: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface AdminDashboard {
  totalStudents: number;
  totalActiveStudents: number;
  totalQuestions: number;
  totalImageQuestions: number;
  totalExamsInSystem: number;
  totalPassedExamsInSystem: number;
  overallPassRate: number;
  recentExams?: AdminExam[];
  recentUsers?: AdminUser[];
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminQuestionOption {
  optionLetter: string;
  textRw: string;
  isCorrect: boolean;
}

export interface AdminQuestion {
  id: number;
  questionNumber: number;
  textRw: string;
  isImageBased: boolean;
  imageUrl?: string;
  position: number;
  options: AdminQuestionOption[];
}

export interface AdminQuestionFormValues {
  questionNumber: number;
  textRw: string;
  isImageBased: boolean;
  imageFilename?: string;
  options: AdminQuestionOption[];
}

export interface DashboardResponse {
  totalPracticeSessions: number;
  totalExamsTaken: number;
  totalExamsPassed: number;
  bestExamScore: number;
  averageExamScore: number;
  bestPracticeScore: number;
  recentExams: ExamResponse[];
}
