import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === "en"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("rw")}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === "rw"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Kinyarwanda
      </button>
    </div>
  );
}
