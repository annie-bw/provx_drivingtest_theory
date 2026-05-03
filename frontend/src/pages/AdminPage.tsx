import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminDashboard,
  getAdminQuestions,
  getAdminUsers,
  toggleUserActive,
  updateAdminQuestion,
} from "../api/admin";
import type {
  AdminDashboard,
  AdminQuestion,
  AdminQuestionFormValues,
  AdminUser,
} from "../types";

type Tab = "dashboard" | "questions" | "users";

export default function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(
    null,
  );
  const [questionForm, setQuestionForm] = useState<AdminQuestionFormValues>({
    questionNumber: 1,
    textRw: "",
    isImageBased: false,
    imageFilename: "",
    options: [
      { optionLetter: "a", textRw: "", isCorrect: true },
      { optionLetter: "b", textRw: "", isCorrect: false },
      { optionLetter: "c", textRw: "", isCorrect: false },
      { optionLetter: "d", textRw: "", isCorrect: false },
    ],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);

  const handleBulkFileChange = (file: File | null) => {
    setBulkFile(file);
    setBulkUploadError(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkUploadError(
        "Please select a .docx or .txt file before uploading.",
      );
      return;
    }

    const extension = bulkFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !["docx", "txt"].includes(extension)) {
      setBulkUploadError("Only .docx and .txt files are accepted.");
      return;
    }

    setBulkUploadLoading(true);
    setBulkUploadError(null);
    setError(null);

    try {
      setBulkUploadError(
        "Bulk upload is not available yet. Please use the question editor for now.",
      );
    } finally {
      setBulkUploadLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getAdminDashboard(user.token),
      getAdminUsers(user.token),
      getAdminQuestions(user.token),
    ])
      .then(([dashboardData, usersData, questionsData]) => {
        setDashboard(dashboardData);
        setAdminUsers(usersData);
        setAdminQuestions(questionsData);
      })
      .catch((err) => {
        console.error("Failed to load admin data", err);
        setError(
          err instanceof Error ? err.message : "Failed to load admin data",
        );
      })
      .finally(() => setIsLoading(false));
  }, [user?.token]);

  const handleDeleteQuestion = async (questionId: number) => {
    if (!user?.token) return;

    setActionLoading(true);
    setError(null);

    try {
      await deleteAdminQuestion(user.token, questionId);
      setAdminQuestions((prev) =>
        prev.filter((question) => question.id !== questionId),
      );
    } catch (err) {
      console.error("Failed to delete question", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete question",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: number) => {
    if (!user?.token) return;

    setActionLoading(true);
    setError(null);

    try {
      const updatedUser = await toggleUserActive(user.token, userId);
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    } catch (err) {
      console.error("Failed to toggle user status", err);
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openQuestionModal = (question?: AdminQuestion) => {
    if (question) {
      const filename = question.imageUrl
        ? (question.imageUrl.split("/").pop() ?? "")
        : "";

      setEditingQuestion(question);
      setQuestionForm({
        questionNumber: question.questionNumber,
        textRw: question.textRw,
        isImageBased: question.isImageBased,
        imageFilename: filename,
        options: question.options.map((option) => ({
          optionLetter: option.optionLetter,
          textRw: option.textRw,
          isCorrect: option.isCorrect,
        })),
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        questionNumber: 1,
        textRw: "",
        isImageBased: false,
        imageFilename: "",
        options: [
          { optionLetter: "a", textRw: "", isCorrect: true },
          { optionLetter: "b", textRw: "", isCorrect: false },
          { optionLetter: "c", textRw: "", isCorrect: false },
          { optionLetter: "d", textRw: "", isCorrect: false },
        ],
      });
    }

    setFormError(null);
    setQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    setEditingQuestion(null);
    setFormError(null);
  };

  const updateQuestionOption = (
    index: number,
    value: Partial<AdminQuestionFormValues["options"][number]>,
  ) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, idx) =>
        idx === index ? { ...option, ...value } : option,
      ),
    }));
  };

  const handleQuestionFormSubmit = async () => {
    const correctCount = questionForm.options.filter(
      (option) => option.isCorrect,
    ).length;
    if (correctCount !== 1) {
      setFormError("Please select exactly one correct answer.");
      return;
    }

    if (!user?.token) return;

    setActionLoading(true);
    setError(null);
    setFormError(null);

    try {
      const savedQuestion = editingQuestion
        ? await updateAdminQuestion(
            user.token,
            editingQuestion.id,
            questionForm,
          )
        : await createAdminQuestion(user.token, questionForm);

      setAdminQuestions((prev) => {
        if (editingQuestion) {
          return prev.map((q) =>
            q.id === savedQuestion.id ? savedQuestion : q,
          );
        }
        return [savedQuestion, ...prev];
      });

      closeQuestionModal();
    } catch (err) {
      console.error("Failed to save question", err);
      setError(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setActionLoading(false);
    }
  };

  const totalUsers = dashboard?.totalStudents ?? 0;
  const activeStudents = dashboard?.totalActiveStudents ?? 0;
  const totalQuestions = dashboard?.totalQuestions ?? 0;
  const passRate = dashboard?.overallPassRate
    ? Math.round(dashboard.overallPassRate)
    : 0;
  const recentAttempts = dashboard?.recentExams ?? [];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-blue-200">
                <svg
                  className="mr-2 h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Admin Dashboard
              </div>
              <h1 className="mt-3 text-3xl font-bold">
                Welcome back, {user?.name}
              </h1>
              <p className="mt-2 text-slate-300 leading-relaxed">
                Monitor system performance, manage questions, and oversee user
                progress
              </p>
            </div>
            <div className="mt-6 sm:mt-0">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Administrator
                  </p>
                  <p className="text-xs text-slate-300">Full Access</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                <p className="text-blue-200 text-xs mt-1">
                  Registered learners
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-green-600 p-6 text-white shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Students
                </p>
                <p className="text-3xl font-bold mt-2">{activeStudents}</p>
                <p className="text-green-200 text-xs mt-1">Currently active</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-purple-600 p-6 text-white shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Total Questions
                </p>
                <p className="text-3xl font-bold mt-2">{totalQuestions}</p>
                <p className="text-purple-200 text-xs mt-1">
                  Active question bank
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-yellow-600 p-6 text-white shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">
                  Overall Pass Rate
                </p>
                <p className="text-3xl font-bold mt-2">{passRate}%</p>
                <p className="text-yellow-200 text-xs mt-1">
                  System-wide success
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200/60">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Exam Attempts
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Latest student activity and performance
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Exam
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Score
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Date
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAttempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      Exam #{attempt.id}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {attempt.correctCount != null
                        ? `${attempt.correctCount}/${attempt.totalQuestions}`
                        : `${attempt.totalQuestions} Qs`}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {new Date(
                      attempt.submittedAt ?? attempt.startedAt,
                    ).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        attempt.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span className="mr-1">{attempt.passed ? "✓" : "✕"}</span>
                      {attempt.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {attempt.submittedAt ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200/60">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Question Management
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Review, create, edit, and remove questions from the backend bank.
          </p>
        </div>
        <button
          onClick={() => openQuestionModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white font-medium transition-all shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={actionLoading}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Question
        </button>
      </div>

      {/* Bulk Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Bulk Upload Questions
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Upload a Word document (.docx) or text file with questions to add them
          in bulk.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".docx,.txt"
            onChange={(e) => handleBulkFileChange(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
          />
          <button
            onClick={handleBulkUpload}
            disabled={bulkUploadLoading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Upload & Process
          </button>
        </div>
        {bulkFile ? (
          <p className="text-sm text-slate-700 mt-3">
            Selected file: {bulkFile.name}
          </p>
        ) : null}
        {bulkUploadError ? (
          <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {bulkUploadError}
          </p>
        ) : null}
        <p className="text-xs text-slate-500 mt-2">
          Note: Questions will be validated and added to the database
          automatically.
        </p>
      </div>

      {adminQuestions.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          {isLoading
            ? "Loading questions..."
            : "No questions available from the backend."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  #
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Question
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Type
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Position
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminQuestions.map((question) => (
                <tr
                  key={question.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 text-sm font-medium text-slate-900">
                    {question.questionNumber}
                  </td>
                  <td className="py-4 text-sm text-slate-900">
                    {question.textRw}
                  </td>
                  <td className="py-4 text-sm text-slate-600">Text</td>
                  <td className="py-4 text-sm text-slate-600">
                    {question.position ?? "—"}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openQuestionModal(question)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200/60">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          User Management
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Monitor and manage student accounts
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                User
              </th>
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                Email
              </th>
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                Role
              </th>
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                Registered
              </th>
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="pb-4 text-left text-sm font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adminUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                      {u.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{`${u.firstName} ${u.lastName}`}</p>
                      <p className="text-xs text-slate-500">ID: {u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-slate-900">{u.email}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {u.role.toLowerCase()}
                  </span>
                </td>
                <td className="py-4 text-sm text-slate-600">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleUserActive(u.id)}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={actionLoading}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuestionModal = () =>
    questionModalOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
        <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-primary">
                {editingQuestion ? "Edit Question" : "Create Question"}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingQuestion
                  ? "Update question details"
                  : "Add a new question"}
              </h2>
            </div>
            <button
              className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
              onClick={closeQuestionModal}
            >
              ✕
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Question Number
                <input
                  type="number"
                  value={questionForm.questionNumber}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      questionNumber: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Is Image Based
                <select
                  value={questionForm.isImageBased ? "yes" : "no"}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      isImageBased: e.target.value === "yes",
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
            </div>

            {questionForm.isImageBased && (
              <label className="space-y-2 text-sm text-slate-700">
                Question Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // For now, just set the filename, but in a real app you'd upload the file
                      setQuestionForm((prev) => ({
                        ...prev,
                        imageFilename: file.name,
                      }));
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </label>
            )}

            <label className="space-y-2 text-sm text-slate-700">
              Question Text (Kinyarwanda)
              <textarea
                value={questionForm.textRw}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    textRw: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              {questionForm.options.map((option, index) => (
                <label
                  key={option.optionLetter}
                  className="space-y-2 text-sm text-slate-700"
                >
                  Option {option.optionLetter.toUpperCase()}
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.isCorrect}
                      onChange={() =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          options: prev.options.map((item, itemIndex) => ({
                            ...item,
                            isCorrect: itemIndex === index,
                          })),
                        }))
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <input
                      type="text"
                      value={option.textRw}
                      onChange={(e) =>
                        updateQuestionOption(index, { textRw: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                      placeholder="Option text"
                    />
                  </div>
                </label>
              ))}
            </div>

            {formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeQuestionModal}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuestionFormSubmit}
                disabled={actionLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingQuestion ? "Update question" : "Create question"}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "questions":
        return renderQuestions();
      case "users":
        return renderUsers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-72 shrink-0">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-xl border border-slate-200/60">
              <div className="mb-8">
                <h1 className="text-xl font-bold text-slate-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  DrivePrep Management
                </p>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                      />
                    </svg>
                    Dashboard
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeTab === "questions"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Ibibazo (Questions)
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeTab === "users"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    Abantu (Users)
                  </div>
                </button>
              </nav>
            </div>
          </aside>
          <div className="flex-1">
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {renderContent()}
            {renderQuestionModal()}
          </div>
        </div>
      </div>
    </div>
  );
}
