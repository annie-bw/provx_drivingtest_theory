import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getExamHistory, reviewExam } from "../api/exam";
import type { ExamAnswerResponse, ExamResponse } from "../types";

export default function ReviewPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [reviewExamData, setReviewExamData] = useState<ExamResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    getExamHistory(token)
      .then((history) => {
        const latest = history
          .filter((exam) => exam.submittedAt)
          .sort(
            (a, b) =>
              new Date(b.submittedAt ?? b.startedAt).getTime() -
              new Date(a.submittedAt ?? a.startedAt).getTime(),
          )[0];

        if (!latest) {
          setReviewExamData(null);
          return;
        }

        return reviewExam(latest.id, token).then(setReviewExamData);
      })
      .catch((err) => {
        console.error("Failed to load review data", err);
        setError(
          err instanceof Error ? err.message : "Failed to load review data",
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const reviewItems: ExamAnswerResponse[] = reviewExamData?.review ?? [];

  return (
    <main className="min-h-screen bg-surface px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] bg-white p-10 shadow-soft">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-primary">
                {t("review.title")}
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">
                {t("review.subtitle")}
              </h1>
            </div>
            <Link
              to="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 transition hover:border-slate-300"
            >
              Subira Dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
              Loading review data...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          ) : reviewItems.length > 0 ? (
            <div className="space-y-6">
              {reviewItems.map((item, index) => {
                const selectedOption = item.options?.find(
                  (option) => option.id === item.selectedOptionId,
                );
                const correctOption = item.options?.find(
                  (option) => option.id === item.correctOptionId,
                );

                return (
                  <div
                    key={`${item.questionId}-${item.position}`}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {item.questionTextRw}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Question {item.position}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {item.options?.map((option) => {
                        const isSelected = option.id === item.selectedOptionId;
                        const isCorrect = option.id === item.correctOptionId;
                        return (
                          <div
                            key={option.id}
                            className={`rounded-3xl border px-4 py-3 text-sm ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : isSelected
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {option.textRw}
                            {isCorrect && (
                              <span className="ml-3 font-semibold">
                                {t("review.correctOption")}
                              </span>
                            )}
                            {isSelected && !isCorrect && (
                              <span className="ml-3 font-semibold">
                                {t("review.selectedOption")}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedOption &&
                      correctOption &&
                      selectedOption.id !== correctOption.id && (
                        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                          {t("review.correctAnswer")}: {correctOption.textRw}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
              {t("review.noExams")}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
