import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  startExam,
  getExam,
  saveExamAnswer,
  submitExam as submitExamApi,
} from "../api/exam";
import { getImageUrl } from "../api/client";
import { preloadQuestionImages } from "../utils/imagePreloader";
import type { ApiOption, ApiQuestion, ExamResponse } from "../types";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Header from "../components/Header";

const SESSION_ID_KEY = "provx-current-exam-id";
const SESSION_INDEX_KEY = "provx-current-exam-index";
const SESSION_ANSWERS_KEY = "provx-current-exam-answers";

export default function ExamPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();
  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [showSubmit, setShowSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const restoreSession = async () => {
      setLoading(true);
      setError(null);

      try {
        const savedExamId = sessionStorage.getItem(SESSION_ID_KEY);
        const savedIndex = Number(
          sessionStorage.getItem(SESSION_INDEX_KEY) ?? 0,
        );
        const savedAnswers = JSON.parse(
          sessionStorage.getItem(SESSION_ANSWERS_KEY) ?? "{}",
        ) as Record<string, string>;

        let currentExam: ExamResponse | null = null;

        if (savedExamId) {
          currentExam = await getExam(savedExamId, token);
        } else if (!isStarting) {
          setIsStarting(true);
          currentExam = await startExam(token);
          setIsStarting(false);
        }

        if (currentExam) {
          if (!savedExamId) {
            sessionStorage.setItem(SESSION_ID_KEY, currentExam.id.toString());
          }

          if (currentExam.status !== "IN_PROGRESS") {
            sessionStorage.removeItem(SESSION_ID_KEY);
            sessionStorage.removeItem(SESSION_INDEX_KEY);
            sessionStorage.removeItem(SESSION_ANSWERS_KEY);
            navigate("/results", { state: { exam: currentExam } });
            return;
          }

          const expiresAt = currentExam.expiresAt
            ? new Date(currentExam.expiresAt).getTime()
            : 0;
          const remainingSeconds =
            expiresAt > 0
              ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
              : 0;

          if (remainingSeconds <= 5) {
            // Avoid restoring an exam that is already ending immediately
            sessionStorage.removeItem(SESSION_ID_KEY);
            sessionStorage.removeItem(SESSION_INDEX_KEY);
            sessionStorage.removeItem(SESSION_ANSWERS_KEY);
            currentExam = await startExam(token);
            sessionStorage.setItem(SESSION_ID_KEY, currentExam.id.toString());
          }

          // Preload all images before showing the exam
          await preloadQuestionImages(currentExam.questions);

          setExam(currentExam);
          setCurrentIndex(
            savedIndex >= 0 && savedIndex < currentExam.questions.length
              ? savedIndex
              : 0,
          );
          setAnswers(savedAnswers);

          if (currentExam.expiresAt) {
            const expiresAt = new Date(currentExam.expiresAt).getTime();
            const remainingSeconds = Math.max(
              0,
              Math.floor((expiresAt - Date.now()) / 1000),
            );
            setTimeLeft(remainingSeconds);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load exam");
      } finally {
        setLoading(false);
        setIsStarting(false);
      }
    };

    restoreSession();
  }, [navigate, token]);

  useEffect(() => {
    if (!exam || exam.status !== "IN_PROGRESS") return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exam]);

  useEffect(() => {
    if (timeLeft === 0 && exam?.status === "IN_PROGRESS") {
      handleSubmit();
    }
  }, [timeLeft, exam]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_INDEX_KEY, currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (exam?.status !== "IN_PROGRESS") {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_INDEX_KEY);
      sessionStorage.removeItem(SESSION_ANSWERS_KEY);
    }
  }, [exam]);

  const question = exam?.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam?.questions.length ?? 0;
  const allAnswered = exam ? answeredCount === totalQuestions : false;

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleSelect = async (optionId: string) => {
    if (!exam || !question || !token) return;
    const examToken = token;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));

    try {
      await saveExamAnswer(
        exam.id,
        {
          questionId: question.id,
          selectedOptionId: optionId,
        },
        examToken,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save answer");
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  };

  const handleSubmit = async () => {
    if (!exam || !token || submitting) return;
    const examToken = token;
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitExamApi(exam.id, examToken);
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_INDEX_KEY);
      sessionStorage.removeItem(SESSION_ANSWERS_KEY);
      navigate("/results", { state: { exam: result } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="px-6 py-8 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-lg font-semibold text-slate-900">
                {t("common.loading")}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="px-6 py-8 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-200 text-center">
              <p className="text-lg font-semibold text-red-600">{error}</p>
              <Button className="mt-6" onClick={() => window.location.reload()}>
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!exam || !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="px-6 py-8 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-200 text-center">
              <p className="text-lg font-semibold text-slate-900">
                {t("exam.noExam")}
              </p>
              <Button className="mt-6" onClick={() => navigate("/dashboard")}>
                {t("common.backToDashboard")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-8 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {t("exam.title")}
                  </div>
                  <div className="text-3xl font-mono font-bold text-slate-900">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {t("exam.timeRemaining")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("exam.progress")}</span>
                    <span>
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(answeredCount / totalQuestions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {timeLeft <= 60 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    ⚠️ {t("exam.lastMinute")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-600 mb-3">
                  {t("exam.navigator")}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((questionItem, index) => {
                    const answered = answers[questionItem.id] != null;
                    const isCurrent = currentIndex === index;
                    return (
                      <button
                        key={questionItem.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                          isCurrent
                            ? "border-primary bg-primary text-white"
                            : answered
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-primary"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => setShowSubmit(true)}
                disabled={!allAnswered || submitting}
                className="w-full"
                size="lg"
              >
                {submitting
                  ? t("common.loading")
                  : allAnswered
                    ? t("exam.submitButton")
                    : t("exam.continueButton", {
                        count: totalQuestions - answeredCount,
                      })}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                {t("exam.exitExam")}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {t("exam.questionCount", {
                    current: currentIndex + 1,
                    total: totalQuestions,
                  })}
                </CardTitle>
                <div className="text-sm text-slate-500">
                  {answeredCount} {t("exam.answered")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-xl">
                  <p className="text-xl font-medium text-slate-900">
                    {question.textRw}
                  </p>
                </div>
                {question.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[24rem] max-w-3xl mx-auto flex items-center justify-center">
                    <img
                      src={getImageUrl(question.imageUrl)}
                      alt="Traffic sign"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {question.options.map((option: ApiOption) => {
                  const selected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-slate-200 bg-white hover:border-primary hover:bg-primary/5 text-slate-700"
                      }`}
                    >
                      {option.textRw}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentIndex === 0}
                >
                  {t("exam.previous")}
                </Button>
                <Button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(prev + 1, exam.questions.length - 1),
                    )
                  }
                  disabled={currentIndex === exam.questions.length - 1}
                >
                  {t("exam.next")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showSubmit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>{t("exam.submitTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  {t("exam.answeredSummary", {
                    count: answeredCount,
                    total: totalQuestions,
                  })}
                  {allAnswered
                    ? ` ${t("exam.submitReady")}`
                    : ` ${t("exam.submitIncomplete")}`}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmit(false)}
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSubmit(false);
                      handleSubmit();
                    }}
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? t("common.loading") : t("exam.submit")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
