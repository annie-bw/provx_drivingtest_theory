import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Header from "../components/Header";
import type { ExamResponse } from "../types";

function mapExamResponse(exam: ExamResponse) {
  return {
    id: String(exam.id),
    date: exam.submittedAt ? new Date(exam.submittedAt).toLocaleString() : "",
    score: exam.correctCount ?? 0,
    total: exam.totalQuestions,
    passed: exam.passed ?? false,
  };
}

export default function ResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { exam?: ExamResponse } | null;
  const { user } = useAuth();
  const latestExam = state?.exam
    ? mapExamResponse(state.exam)
    : user?.examHistory?.[0];
  const passed = latestExam?.passed;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{t("results.title")}</CardTitle>
              <p className="text-slate-600 mt-2">{t("results.subtitle")}</p>
            </CardHeader>
            <CardContent>
              {latestExam ? (
                <div className="space-y-8">
                  {/* Score Overview */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-4 p-6 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm text-slate-500">
                          {t("results.score")}
                        </p>
                        <p className="text-4xl font-bold text-slate-900">
                          {latestExam.score} / {latestExam.total}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {passed ? t("results.passed") : t("results.failed")}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-slate-500">
                          {t("results.questionsAnswered")}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                          {latestExam.total}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-slate-500">
                          {t("results.correctAnswers")}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                          {latestExam.score}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-slate-500">
                          {t("results.percentage")}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                          {Math.round(
                            (latestExam.score / latestExam.total) * 100,
                          )}
                          %
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feedback */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {t("results.feedback")}
                      </h3>
                      <p className="text-slate-600">
                        {passed
                          ? t("results.feedbackPassed")
                          : t("results.feedbackFailed")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Recent History */}
                  {user?.examHistory && user.examHistory.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {t("results.recentHistory")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                          {user.examHistory.slice(1, 5).map((exam) => (
                            <div
                              key={exam.id}
                              className="p-4 bg-slate-50 rounded-lg"
                            >
                              <p className="text-xs text-slate-500">
                                {exam.date}
                              </p>
                              <p className="text-lg font-semibold text-slate-900 mt-1">
                                {exam.score}/{exam.total}
                              </p>
                              <p className="text-sm text-slate-600">
                                {exam.passed
                                  ? t("results.passed")
                                  : t("results.failed")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={() => navigate("/exam")}
                      className="flex-1"
                    >
                      {t("results.takeAnotherExam")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/review")}
                      className="flex-1"
                    >
                      {t("results.reviewAnswers")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      {t("common.backToDashboard")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-6">{t("results.noExams")}</p>
                  <Button onClick={() => navigate("/dashboard")}>
                    {t("results.startFirstExam")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
