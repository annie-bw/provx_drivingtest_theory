import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "../components/Button";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-2xl font-black text-white">
              🚗
            </div>
            <h1 className="text-3xl font-black text-slate-900">ProvX</h1>
            <p className="mt-2 text-sm text-slate-600">{t("auth.title")}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                {t("common.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                {t("common.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? t("common.loading") : t("common.login")}
            </Button>

            {error && (
              <p className="text-center text-sm text-red-600 mt-2">{error}</p>
            )}

            <p className="text-center text-sm text-slate-600">
              {t("auth.noAccount")}{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {t("common.register")}
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden flex-1 bg-slate-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-center">
        <h2 className="text-4xl font-black mb-8">{t("landing.title")}</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="text-3xl">✏️</div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                {t("landing.features.quickPractice.title")}
              </h3>
              <p className="text-blue-100 text-sm">
                {t("landing.features.quickPractice.description")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                {t("landing.features.certifiedExam.title")}
              </h3>
              <p className="text-blue-100 text-sm">
                {t("landing.features.certifiedExam.description")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="font-bold text-lg mb-1">{t("results.title")}</h3>
              <p className="text-blue-100 text-sm">{t("results.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
