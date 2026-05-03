import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/Button";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { getDashboard } from "../api/exam";
import { getPracticeHistory } from "../api/practice";
import type {
  DashboardResponse,
  ExamResponse,
  PracticeSessionResponse,
} from "../types";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [practiceSessions, setPracticeSessions] = useState<
    PracticeSessionResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    const fetchDashboardData = async () => {
      if (!user?.token) return;

      try {
        setIsLoading(true);
        const [dashboard, practiceHistory] = await Promise.all([
          getDashboard(user.token),
          getPracticeHistory(user.token),
        ]);
        setDashboardData(dashboard);
        setPracticeSessions(practiceHistory);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, user?.role, user?.token]);

  // Calculate progress level based on average score
  const calculateProgress = () => {
    if (!dashboardData || dashboardData.totalExamsTaken === 0) {
      return { level: 0, message: t("dashboard.beginner"), percentage: 0 };
    }

    const avgScore = dashboardData.averageExamScore || 0; // Use average exam score
    let level = 0;
    let message = "";

    if (avgScore >= 90) {
      level = 5;
      message = t("dashboard.expert");
    } else if (avgScore >= 75) {
      level = 4;
      message = t("dashboard.advanced");
    } else if (avgScore >= 60) {
      level = 3;
      message = t("dashboard.intermediate");
    } else if (avgScore >= 40) {
      level = 2;
      message = t("dashboard.beginner");
    } else {
      level = 1;
      message = t("dashboard.novice");
    }

    return { level, message, percentage: avgScore };
  };

  const progress = calculateProgress();
  const completedPracticeCount = practiceSessions.filter(
    (session) => session.status === "COMPLETED",
  ).length;
  const showExamNotification =
    completedPracticeCount >= 5 &&
    (!dashboardData || dashboardData.totalExamsTaken === 0);

  const stats = [
    {
      icon: "✏️",
      label: t("dashboard.stats.practiceSessions"),
      value: practiceSessions.length.toString(),
      sub: "sessions",
    },
    {
      icon: "🏆",
      label: t("dashboard.stats.bestScore"),
      value: dashboardData
        ? `${dashboardData.bestExamScore.toFixed(1)}%`
        : "0%",
      sub: "best score",
    },
    {
      icon: "🎯",
      label: t("dashboard.stats.exams"),
      value: dashboardData?.totalExamsTaken.toString() || "0",
      sub: "taken",
    },
    {
      icon: "📊",
      label: "Average Grade",
      value: dashboardData
        ? `${dashboardData.averageExamScore.toFixed(1)}%`
        : "0%",
      sub: "average",
    },
  ];

  const examHistory = dashboardData?.recentExams || [];

  const formatDuration = (
    durationSeconds?: number,
    startedAt?: string,
    submittedAt?: string,
  ) => {
    if (durationSeconds == null || durationSeconds <= 0) {
      if (startedAt && submittedAt) {
        const started = new Date(startedAt).getTime();
        const submitted = new Date(submittedAt).getTime();
        if (submitted > started) {
          const totalSeconds = Math.floor((submitted - started) / 1000);
          durationSeconds = totalSeconds;
        }
      }
    }

    if (durationSeconds == null || durationSeconds <= 0) {
      return "N/A";
    }

    if (durationSeconds < 60) {
      return `${durationSeconds} sec`;
    }
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="px-7 py-7">
          <div className="mx-auto max-w-6xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">{t("common.loading")}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="px-7 py-7">
          <div className="mx-auto max-w-6xl">
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-7 py-7">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  {t("dashboard.greeting").replace(
                    "{name}",
                    user?.name || "User",
                  )}{" "}
                  👋
                </h2>
                <p className="mt-1 text-sm text-slate-100">
                  {t("dashboard.description")}
                </p>
              </div>
              <div className="rounded-lg bg-white px-5 py-3 text-right shadow-md">
                <div className="text-sm font-bold">30 Apr 2026</div>
                <div className="text-xs text-slate-400">Kigali, Rwanda</div>
              </div>
            </div>
          </div>

          {user?.role === "admin" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-900">
                  ⚙️ Admin panel available
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Manage users, questions, and exam settings from the admin
                  dashboard.
                </div>
              </div>
              <Button onClick={() => navigate("/admin")} size="sm">
                Go to Admin
              </Button>
            </div>
          )}

          {/* Suggestion Banner */}
          {showExamNotification ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-green-900">
                  🎯 {t("dashboard.examReady")}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {t("dashboard.examReadyText")}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button onClick={() => navigate("/exam")} size="sm">
                  {t("dashboard.takeExam")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-900">
                  🎯 {t("dashboard.suggestion")}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {t("dashboard.suggestionText")}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button onClick={() => navigate("/exam")} size="sm">
                  {t("dashboard.goToExam")}
                </Button>
                <Button
                  onClick={() => navigate("/practice")}
                  variant="outline"
                  size="sm"
                >
                  {t("dashboard.continuePractice")}
                </Button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="text-2xl mb-3">{stat.icon}</div>
                <div className="text-xs text-slate-600 font-semibold uppercase mb-2">
                  {stat.label}
                </div>
                <div className="text-3xl font-black text-blue-600">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 mt-2">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/practice")}
              className="rounded-2xl border border-slate-200 bg-white p-7 text-left hover:border-blue-600 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">✏️</div>
              <h3 className="font-black text-lg mb-2">
                {t("dashboard.practiceCard.title")}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {t("dashboard.practiceCard.description")}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  20 {t("common.questions")}
                </span>
                <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {t("common.unlimited")} {t("common.time")}
                </span>
                <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {t("common.immediate")} {t("common.feedback")}
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate("/exam")}
              className="rounded-2xl border-2 border-blue-600 bg-blue-600 p-7 text-left text-white hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-black text-lg mb-2">
                {t("dashboard.examCard.title")}
              </h3>
              <p className="text-sm text-slate-100 leading-relaxed mb-4">
                {t("dashboard.examCard.description")}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-block bg-white text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  20 {t("common.questions")}
                </span>
                <span className="inline-block bg-white text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  20 min
                </span>
                <span className="inline-block bg-white text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  12+ {t("common.toPass")}
                </span>
              </div>
            </button>
          </div>

          {/* History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">
                  {t("dashboard.progress")}
                </h3>
                <span className="text-sm text-slate-600">
                  {t("dashboard.level")} {progress.level} - {progress.message}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {progress.percentage.toFixed(1)}% {t("dashboard.averageScore")}
              </div>
            </div>

            <h3 className="font-bold text-slate-900 mb-5">
              {t("dashboard.recentExams")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      {t("common.date")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      {t("common.score")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      {t("common.time")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-600">
                      {t("common.result")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examHistory.map((exam, idx) => (
                    <tr
                      key={exam.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        EX-{exam.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(exam.startedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {exam.scorePercent
                          ? `${exam.scorePercent.toFixed(1)}%`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDuration(
                          exam.durationSeconds,
                          exam.startedAt,
                          exam.submittedAt,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            exam.passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {exam.passed ? "✓ " : "✗ "}
                          {t(`common.${exam.passed ? "pass" : "fail"}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {examHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-600"
                      >
                        {t("dashboard.noExams")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
