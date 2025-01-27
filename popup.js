document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("save");
  const parfumoSearchCheckbox = document.getElementById("parfumoSearch");
  const status = document.getElementById("status");
  const settingsTitle = document.getElementById("settings-title");
  const languageLabel = document.getElementById("language-label");
  const parfumoLabel = document.getElementById("parfumo-label");

  // Translation object for all languages
  const translations = {
    en: {
      settings: "Settings",
      language: "Select your language:",
      parfumo: "Enable Parfumo Search:",
      save: "Save"
    },
    de: {
      settings: "Einstellungen",
      language: "Wählen Sie Ihre Sprache:",
      parfumo: "Parfumo-Suche aktivieren:",
      save: "Speichern"
    },
    es: {
      settings: "Ajustes",
      language: "Seleccione su idioma:",
      parfumo: "Habilitar búsqueda Parfumo:",
      save: "Guardar"
    },
    fr: {
      settings: "Paramètres",
      language: "Sélectionnez votre langue:",
      parfumo: "Activer la recherche Parfumo:",
      save: "Sauvegarder"
    },
    cs: {
      settings: "Nastavení",
      language: "Vyberte svůj jazyk:",
      parfumo: "Povolit vyhledávání Parfumo:",
      save: "Uložit"
    },
    it: {
      settings: "Impostazioni",
      language: "Seleziona la tua lingua:",
      parfumo: "Abilita la ricerca Parfumo:",
      save: "Salva"
    },
    ru: {
      settings: "Настройки",
      language: "Выберите ваш язык:",
      parfumo: "Включить поиск Parfumo:",
      save: "Сохранить"
    },
    pl: {
      settings: "Ustawienia",
      language: "Wybierz swój język:",
      parfumo: "Włącz wyszukiwanie Parfumo:",
      save: "Zapisz"
    },
    pt: {
      settings: "Configurações",
      language: "Selecione o seu idioma:",
      parfumo: "Ativar pesquisa Parfumo:",
      save: "Salvar"
    },
    el: {
      settings: "Ρυθμίσεις",
      language: "Επιλέξτε τη γλώσσα σας:",
      parfumo: "Ενεργοποιήστε την αναζήτηση Parfumo:",
      save: "Αποθήκευση"
    },
    zh: {
      settings: "设置",
      language: "选择您的语言:",
      parfumo: "启用Parfumo搜索:",
      save: "保存"
    },
    nl: {
      settings: "Instellingen",
      language: "Kies je taal:",
      parfumo: "Parfumo-zoekfunctie inschakelen:",
      save: "Opslaan"
    },
    sr: {
      settings: "Podešavanja",
      language: "Izaberite jezik:",
      parfumo: "Omogući Parfumo pretragu:",
      save: "Spremiti"
    },
    ro: {
      settings: "Setări",
      language: "Selectați limba:",
      parfumo: "Activați căutarea Parfumo:",
      save: "Salvați"
    },
    ar: {
      settings: "الإعدادات",
      language: "اختر لغتك:",
      parfumo: "تمكين بحث Parfumo:",
      save: "حفظ"
    },
    uk: {
      settings: "Налаштування",
      language: "Виберіть вашу мову:",
      parfumo: "Увімкнути пошук Parfumo:",
      save: "Зберегти"
    },
    mn: {
      settings: "Тохиргоо",
      language: "Хэлээ сонгоно уу:",
      parfumo: "Parfumo хайлт идэвхжүүлэх:",
      save: "Хадгалах"
    },
    he: {
      settings: "הגדרות",
      language: "בחר את השפה שלך:",
      parfumo: "אפשר חיפוש Parfumo:",
      save: "שמור"
    },
  };

  // Function to update the UI based on language selection
  function updateUI(languageCode) {
    const currentLang = translations[languageCode] || translations.en;
    settingsTitle.textContent = currentLang.settings;
    languageLabel.textContent = currentLang.language;
    parfumoLabel.textContent = currentLang.parfumo;
    saveButton.textContent = currentLang.save;
  }

  // Function to extract language code from the URL
  function getLanguageCode(url) {
    const match = url.match(/https:\/\/www\.fragrantica\.([a-z]{2})/);
    if (match) {
      return match[1];
    }
    return "en"; // Default to English
  }

  // Load saved language URL and Parfumo search preference
  chrome.storage.sync.get(["fragranticaLanguageUrl", "useParfumoSearch"], ({ fragranticaLanguageUrl, useParfumoSearch }) => {
    const savedLangUrl = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
    languageSelect.value = savedLangUrl;

    // Extract language code from URL
    const savedLangCode = getLanguageCode(savedLangUrl);
    updateUI(savedLangCode); // Update UI with saved language

    parfumoSearchCheckbox.checked = useParfumoSearch || false; // Default to false
  });

  // Save settings when save button is clicked
  saveButton.addEventListener("click", () => {
    const selectedUrl = languageSelect.value;
    const parfumoEnabled = parfumoSearchCheckbox.checked;

    // Save selected URL and Parfumo search setting
    chrome.storage.sync.set(
      { fragranticaLanguageUrl: selectedUrl, useParfumoSearch: parfumoEnabled },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
  });

  // Update UI when language selection changes
  languageSelect.addEventListener("change", () => {
    const selectedLangUrl = languageSelect.value;
    const langCode = getLanguageCode(selectedLangUrl);
    updateUI(langCode);
  });
});
