import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-slate-900">DrivePrep</span>
          </Link>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600">
                  {t("common.welcome")}, {user.name}
                </span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  {t("common.logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  {t("common.login")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  {t("common.register")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
