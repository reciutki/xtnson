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

// Default settings
const DEFAULT_SETTINGS = {
  fragranticaLanguageUrl: "https://www.fragrantica.com",
  useParfumoSearch: false,
  usePerfumeHubSearch: false,
  focusNewTab: true,
  groupColor: "green",
  groupCollapsed: false
};

// Initialize context menu
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get(["useParfumoSearch", "usePerfumeHubSearch"])
      .then(({ useParfumoSearch, usePerfumeHubSearch }) => {
        let title = "Search on Fragrantica";
        if (useParfumoSearch && usePerfumeHubSearch) {
          title = "Search on Fragrantica + Parfumo + PerfumeHub";
        } else if (useParfumoSearch) {
          title = "Search on Fragrantica + Parfumo";
        } else if (usePerfumeHubSearch) {
          title = "Search on Fragrantica + PerfumeHub";
        }

        chrome.contextMenus.create({
          id: "searchFragrantica",
          title,
          contexts: ["selection"],
        });
      })
      .catch(console.error);
  });
}

// Create tab group with customizable options
async function createTabGroup(tabIds, groupName, groupColor, groupCollapsed) {
  try {
    if (typeof chrome.tabs.group !== 'function') return;

    const groupId = await chrome.tabs.group({ tabIds });
    
    if (chrome.tabGroups?.update) {
      await chrome.tabGroups.update(groupId, {
        title: groupName.slice(0, 15) + (groupName.length > 15 ? "..." : ""),
        color: groupColor || "blue",
        collapsed: groupCollapsed || false
      });
    }
    
    return groupId;
  } catch (error) {
    console.error("Group creation failed:", error);
  }
}

// Main search function with all config options
async function performFragranceSearch(fragranceName) {
  const encodedName = encodeURIComponent(fragranceName.trim());
  
  try {
    const settings = await chrome.storage.sync.get({
      ...DEFAULT_SETTINGS,
      ...(["fragranticaLanguageUrl", "useParfumoSearch", "usePerfumeHubSearch", 
          "focusNewTab", "groupColor", "groupCollapsed"])
    });

    const tabIds = [];
    const currentWindow = await chrome.windows.getCurrent();
    
    // Create Fragrantica tab
    const domain = settings.fragranticaLanguageUrl || "https://www.fragrantica.com";
    const searchPath = searchPaths[domain] || "search";
    const fragranticaTab = await chrome.tabs.create({
      url: `${domain}/${searchPath}/?query=${encodedName}`,
      active: settings.focusNewTab, // Respect focus preference
      windowId: currentWindow.id
    });
    tabIds.push(fragranticaTab.id);

    // Create other tabs if enabled
    if (settings.useParfumoSearch) {
      const parfumoTab = await chrome.tabs.create({
        url: `https://www.parfumo.com/s_perfumes_x.php?in=1&filter=${encodedName}`,
        active: false,
        windowId: currentWindow.id
      });
      tabIds.push(parfumoTab.id);
    }

    if (settings.usePerfumeHubSearch) {
      const perfumeHubTab = await chrome.tabs.create({
        url: `https://perfumehub.pl/search?q=${encodedName}`,
        active: false,
        windowId: currentWindow.id
      });
      tabIds.push(perfumeHubTab.id);
    }

    // Group tabs if we have multiple
    if (tabIds.length > 1) {
      await createTabGroup(
        tabIds, 
        fragranceName, 
        settings.groupColor, 
        settings.groupCollapsed
      );
    }

    // Focus on first tab if configured
    if (settings.focusNewTab && tabIds[0]) {
      await chrome.tabs.update(tabIds[0], { active: true });
    }

  } catch (error) {
    console.error("Search failed:", error);
    // Fallback to simple tab creation
    const domain = settings?.fragranticaLanguageUrl || "https://www.fragrantica.com";
    const searchPath = searchPaths[domain] || "search";
    chrome.tabs.create({ 
      url: `${domain}/${searchPath}/?query=${encodedName}`,
      active: settings?.focusNewTab !== false
    });
    
    if (settings?.useParfumoSearch) {
      chrome.tabs.create({ 
        url: `https://www.parfumo.com/s_perfumes_x.php?in=1&filter=${encodedName}`,
        active: false
      });
    }
    if (settings?.usePerfumeHubSearch) {
      chrome.tabs.create({ 
        url: `https://perfumehub.pl/search?q=${encodedName}`,
        active: false
      });
    }
  }
}

// Event listeners
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "searchFragrantica" && info.selectionText) {
    performFragranceSearch(info.selectionText);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (Object.keys(changes).some(key => 
    key === "useParfumoSearch" || 
    key === "fragranticaLanguageUrl" || 
    key === "usePerfumeHubSearch"
  )) {
    updateContextMenu();
  }
});

// Initial setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS))
    .then(storedSettings => {
      const settings = { ...DEFAULT_SETTINGS, ...storedSettings };
      return chrome.storage.sync.set(settings);
    })
    .then(updateContextMenu)
    .catch(console.error);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "search-fragrance") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          return window.getSelection().toString();
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          performFragranceSearch(results[0].result);
        }
      });
    });
  }
});