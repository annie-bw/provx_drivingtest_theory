import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const loginStudent = () => {
    navigate("/login");
  };

  const loginAdmin = () => {
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-10 md:px-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-[32px] bg-white p-10 shadow-soft">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              {t("auth.title")}
            </p>
            <h1 className="text-4xl font-semibold text-slate-950">
              {t("auth.subtitle")}
            </h1>
            <p className="text-slate-600 leading-7">{t("auth.description")}</p>
          </div>
          <div className="grid gap-4">
            <button
              onClick={loginStudent}
              className="rounded-3xl bg-primary px-6 py-4 text-white shadow-soft transition hover:bg-indigo-600"
            >
              {t("auth.studentButton")}
            </button>
            <button
              onClick={loginAdmin}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              {t("auth.adminButton")}
            </button>
          </div>
        </div>
        <div className="rounded-3xl bg-surface p-6 text-slate-700">
          <p className="font-semibold">{t("auth.benefits.title")}</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>⭐ {t("auth.benefits.student")}</li>
            <li>⭐ {t("auth.benefits.admin")}</li>
          </ul>
        </div>
        <p className="text-sm text-slate-500">
          Utari witeguye?{" "}
          <Link to="/" className="font-semibold text-primary">
            Subira ku rubuga rwa mbere
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
