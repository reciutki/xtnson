//SUPER DYNAMIC
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on installation
  chrome.storage.sync.set({
    fragranticaLanguageUrl: "https://www.fragrantica.com",
    useParfumoSearch: false,
  });

  // Initialize the context menu
  updateContextMenu();
});

// Function to update the context menu dynamically
function updateContextMenu() {
  // Clear existing context menus
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get("useParfumoSearch", ({ useParfumoSearch }) => {
      chrome.storage.sync.get("fragranticaLanguageUrl", ({ fragranticaLanguageUrl }) => {
        const domain = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
        const title = getTitleByLanguage(domain, useParfumoSearch);

        // Create the context menu
        chrome.contextMenus.create({
          id: "searchFragrantica",
          title,
          contexts: ["selection"],
        });
      });
    });
  });
}

// Get the context menu title based on language selection
function getTitleByLanguage(domain, useParfumoSearch) {
  const languageTitles = {
    "https://www.fragrantica.com": "Search on Fragrantica",
    "https://www.fragrantica.de": "Auf Fragrantica suchen",
    "https://www.fragrantica.es": "Buscar en Fragrantica",
    "https://www.fragrantica.fr": "Chercher sur Fragrantica",
    "https://www.fragrantica.cz": "Hledat na Fragrantica",
    "https://www.fragrantica.it": "Cerca su Fragrantica",
    "https://www.fragrantica.ru": "Поиск на Fragrantica",
    "https://www.fragrantica.pl": "Szukaj na Fragrantica",
    "https://www.fragrantica.com.br": "Buscar no Fragrantica",
    "https://www.fragrantica.nl": "Zoeken op Fragrantica",
    "https://www.punmiris.com": "Pretraga na Punmiris",
    "https://www.fragrantica.ro": "Căutare pe Fragrantica",
    "https://www.fragrantica.gr": "Αναζήτηση στο Fragrantica",
    "https://www.fragrantica.asia": "搜索Fragrantica",
    "https://www.fragrantica.ua": "Пошук на Fragrantica",
    "https://www.fragrantica.mn": "Fragrantica дээр хайлт хийх",
    "https://www.fragrantica.co.il": "חיפוש ב-Fragrantica",
    "https://www.fragranticarabia.com": "البحث في فراغنتيكا",
  };

  const defaultTitle = languageTitles["https://www.fragrantica.com"];
  const translatedTitle = languageTitles[domain] || defaultTitle;
  return useParfumoSearch ? `${translatedTitle} + Parfumo` : translatedTitle;
}

// Listen for changes to the useParfumoSearch setting and update the context menu
chrome.storage.onChanged.addListener((changes) => {
  if (changes.useParfumoSearch || changes.fragranticaLanguageUrl) {
    updateContextMenu();
  }
});

// Map domains to their specific search paths
const searchPaths = {
  "https://www.fragrantica.com": "search",
  "https://www.fragrantica.de": "Suche",
  "https://www.fragrantica.es": "buscar",
  "https://www.fragrantica.pl": "szukaj",
  "https://www.fragrantica.com.br": "busca",
  "https://www.fragrantica.nl": "zoeken",
  "https://www.punmiris.com": "parfemi",
  "https://www.fragrantica.ro": "cautare",
};

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "searchFragrantica" && info.selectionText) {
    const fragranceName = encodeURIComponent(info.selectionText.trim());

    // Perform Fragrantica search
    chrome.storage.sync.get("fragranticaLanguageUrl", ({ fragranticaLanguageUrl }) => {
      const domain = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
      const searchPath = searchPaths[domain] || "search"; // Default search path
      const url = `${domain}/${searchPath}/?query=${fragranceName}`;
      chrome.tabs.create({ url });
    });

    // Perform Parfumo search if enabled
    chrome.storage.sync.get("useParfumoSearch", ({ useParfumoSearch }) => {
      if (useParfumoSearch) {
        const parfumoUrl = `https://www.parfumo.com/s_perfumes_x.php?in=1&filter=${fragranceName}`;
        chrome.tabs.create({ url: parfumoUrl });
      }
    });
  }
});