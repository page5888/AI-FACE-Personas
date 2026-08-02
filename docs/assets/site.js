const root = document.documentElement;
const languageButtons = Array.from(
  document.querySelectorAll("[data-language-button]"),
);

const titles = {
  en: "AI FACE — Give AI a presence",
  zh: "AI FACE — 讓 AI 對話擁有存在感",
};

function readSavedLanguage() {
  try {
    const saved = window.localStorage.getItem("aiFace.siteLanguage");
    return saved === "en" || saved === "zh" ? saved : null;
  } catch {
    return null;
  }
}

function saveLanguage(language) {
  try {
    window.localStorage.setItem("aiFace.siteLanguage", language);
  } catch {
    // The language switch still works when browser storage is unavailable.
  }
}

function setLanguage(language, persist = true) {
  const nextLanguage = language === "zh" ? "zh" : "en";
  root.dataset.language = nextLanguage;
  root.lang = nextLanguage === "zh" ? "zh-Hant" : "en";
  document.title = titles[nextLanguage];

  for (const button of languageButtons) {
    const isActive = button.dataset.languageButton === nextLanguage;
    button.setAttribute("aria-pressed", String(isActive));
  }

  if (persist) {
    saveLanguage(nextLanguage);
  }
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageButton);
  });
}

const savedLanguage = readSavedLanguage();
const browserLanguage = navigator.language.toLowerCase().startsWith("zh")
  ? "zh"
  : "en";

setLanguage(savedLanguage ?? browserLanguage, false);
