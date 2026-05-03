import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  startPractice,
  getPracticeSession,
  submitPracticeAnswer,
} from "../api/practice";
import { preloadQuestionImages } from "../utils/imagePreloader";
import { getImageUrl } from "../api/client";
import type {
  ApiOption,
  PracticeAnswerResponse,
  PracticeSessionResponse,
} from "../types";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Header from "../components/Header";

const SESSION_ID_KEY = "provx-current-practice-id";
const SESSION_INDEX_KEY = "provx-current-practice-index";
const SESSION_SCORE_KEY = "provx-current-practice-score";

export default function PracticePage() {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<PracticeSessionResponse | null>(null);
  const [current, setCurrent] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PracticeAnswerResponse | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLang = (i18n.language === "rw" ? "rw" : "en") as "en" | "rw";
  const localize = (text: { en: string; rw: string }) =>
    text[currentLang] || text.en;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const restoreSession = async () => {
      setLoading(true);
      setError(null);

      try {
        const savedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
        const savedIndex = Number(
          sessionStorage.getItem(SESSION_INDEX_KEY) ?? 0,
        );
        const savedScore = Number(
          sessionStorage.getItem(SESSION_SCORE_KEY) ?? 0,
        );
        let practiceSession: PracticeSessionResponse;

        if (savedSessionId) {
          try {
            practiceSession = await getPracticeSession(savedSessionId, token);
          } catch (err) {
            // If session doesn't exist, remove the stale ID and start a new one
            console.info(
              "Saved practice session not found, clearing stale session and starting new session",
            );
            sessionStorage.removeItem(SESSION_ID_KEY);
            practiceSession = await startPractice(token);
            sessionStorage.setItem(
              SESSION_ID_KEY,
              practiceSession.id.toString(),
            );
          }
        } else {
          practiceSession = await startPractice(token);
          sessionStorage.setItem(SESSION_ID_KEY, practiceSession.id.toString());
        }

        setSession(practiceSession);
        setCurrent(
          savedIndex >= 0 && savedIndex < practiceSession.questions.length
            ? savedIndex
            : 0,
        );
        setScore(savedScore);
        setCompleted(practiceSession.status !== "IN_PROGRESS");

        // Preload question images in the background without blocking page render
        preloadQuestionImages(practiceSession.questions).catch(() => {
          // ignore preload failures; session can still be used
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load practice session",
        );
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token, navigate]);

  useEffect(() => {
    if (completed) {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_INDEX_KEY);
      sessionStorage.removeItem(SESSION_SCORE_KEY);
    }
  }, [completed]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_INDEX_KEY, current.toString());
  }, [current]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_SCORE_KEY, score.toString());
  }, [score]);

  useEffect(() => {
    if (!feedback?.isCorrect || completed) return;
    const timer = window.setTimeout(() => {
      handleNext();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [feedback, completed]);

  const question = session?.questions[current];
  const total = session?.totalQuestions ?? 0;

  const handleSelect = async (optionId: string) => {
    if (!session || selectedOptionId !== null || completed || !token) return;
    setSelectedOptionId(optionId);

    try {
      const answer = await submitPracticeAnswer(
        session.id as unknown as string,
        {
          questionId: question!.id,
          selectedOptionId: optionId,
        },
        token,
      );

      setFeedback(answer);
      if (answer.isCorrect) {
        setScore((prev) => prev + 1);
      }

      if (current === total - 1) {
        setCompleted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit answer");
    }
  };

  const handleNext = () => {
    if (!session) return;

    setSelectedOptionId(null);
    setFeedback(null);

    if (current === total - 1) {
      setCompleted(true);
      return;
    }

    setCurrent((value) => value + 1);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {t("practice.title")}
              </h1>
              <p className="text-slate-600 mt-1">{t("practice.subtitle")}</p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                {t("practice.backToHome")}
              </Button>
            </Link>
          </div>

          {!completed && question ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {t("practice.questionCount", {
                      current: current + 1,
                      total,
                    })}
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    {t("practice.scoreLabel")}: {score}/{total}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-lg font-medium text-slate-900">
                      {localize({
                        en: question.textRw,
                        rw: question.textRw,
                      })}
                    </p>
                  </div>
                  {question.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[24rem] flex items-center justify-center">
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
                    const isSelected = selectedOptionId === option.id;
                    const isCorrectOption =
                      feedback?.correctOptionId === option.id;
                    const isWrongSelected =
                      isSelected && feedback?.isCorrect === false;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        disabled={selectedOptionId !== null}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected && isCorrectOption
                            ? "border-green-500 bg-green-50 text-green-900"
                            : isWrongSelected
                              ? "border-red-500 bg-red-50 text-red-900"
                              : selectedOptionId !== null && isCorrectOption
                                ? "border-green-500 bg-green-50 text-green-900"
                                : "border-slate-200 bg-white hover:border-primary hover:bg-primary/5 text-slate-700"
                        }`}
                      >
                        {localize({ en: option.textRw, rw: option.textRw })}
                      </button>
                    );
                  })}
                </div>

                {feedback && (
                  <div
                    className={`p-4 rounded-xl ${feedback.isCorrect ? "bg-green-50 border border-green-200 text-green-900" : "bg-red-50 border border-red-200 text-red-900"}`}
                  >
                    <p className="font-medium">
                      {feedback.isCorrect
                        ? t("practice.correct")
                        : t("practice.incorrect")}
                    </p>
                    {!feedback.isCorrect && (
                      <p className="mt-2 text-sm">
                        {t("practice.correctAnswer")}{" "}
                        {feedback.correctOptionText}
                      </p>
                    )}
                    {feedback.isCorrect && (
                      <p className="mt-2 text-sm text-green-700">
                        {t("practice.greatJob")}
                      </p>
                    )}
                  </div>
                )}

                {selectedOptionId !== null && !feedback?.isCorrect && (
                  <div className="flex justify-end">
                    <Button onClick={handleNext}>
                      {t("practice.nextQuestion")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {t("practice.completeTitle")}
                </h2>
                <p className="text-xl text-slate-600 mb-8">
                  {t("practice.completeMessage", { score, total })}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate("/dashboard")}>
                    {t("practice.viewDashboard")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    {t("practice.practiceAgain")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
