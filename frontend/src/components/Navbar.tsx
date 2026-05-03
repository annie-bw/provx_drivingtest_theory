import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const languages = [
    { code: "en", label: "EN" },
    { code: "rw", label: "RW" },
    { code: "fr", label: "FR" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white px-7 py-0">
      <div className="flex h-14 items-center justify-between">
        <a
          href="/dashboard"
          className="flex items-center gap-2 font-black text-base text-blue-600 no-underline"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-black text-white">
            🚗
          </div>
          ProvX
        </a>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex gap-0.5 rounded bg-slate-100 p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                  i18n.language === lang.code
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-none text-slate-400 hover:text-slate-600"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Admin
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
