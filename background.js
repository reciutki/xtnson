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

// 1. Initialize Context Menu
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

        // Wait a tiny bit to ensure `removeAll` is completed
        setTimeout(() => {
          chrome.contextMenus.create({
            id: "searchFragrantica",
            title,
            contexts: ["selection"]
          });
        }, 100);
      })
      .catch(console.error);
  });
}


// 2. Tab Group Creator with 100% Reliability
async function createTabGroup(tabIds, groupName) {
  try {
    // Double-check API availability
    if (typeof chrome.tabs.group !== 'function') {
      console.warn("Tab Groups API not available");
      return;
    }

    const groupId = await chrome.tabs.group({ tabIds });
    
    // Verify tabGroups API exists before using it
    if (chrome.tabGroups && typeof chrome.tabGroups.update === 'function') {
      await chrome.tabGroups.update(groupId, {
        title: groupName.slice(0, 15) + (groupName.length > 15 ? "..." : ""),
        color: "green",
        collapsed: false
      });
    }
    
    return groupId;
  } catch (error) {
    console.error("Group creation failed:", error);
  }
}

// 3. Core Search Function (Bulletproof Version)
async function performFragranceSearch(fragranceName) {
  const encodedName = encodeURIComponent(fragranceName.trim());

  try {
    const settings = await chrome.storage.sync.get([
      "fragranticaLanguageUrl",
      "useParfumoSearch",
      "usePerfumeHubSearch"
    ]);

    const currentWindow = await chrome.windows.getCurrent();
    const tabIds = [];

    // Create and validate tabs
    const domain = settings.fragranticaLanguageUrl || "https://www.fragrantica.com";
    const searchPath = searchPaths[domain] || "search";

    const fragranticaTab = await chrome.tabs.create({
      url: `${domain}/${searchPath}/?query=${encodedName}`,
      active: false,
      windowId: currentWindow.id
    });

    if (fragranticaTab?.id != null) tabIds.push(fragranticaTab.id);

    if (settings.useParfumoSearch) {
      const parfumoTab = await chrome.tabs.create({
        url: `https://www.parfumo.com/s_perfumes_x.php?in=1&filter=${encodedName}`,
        active: false,
        windowId: currentWindow.id
      });
      if (parfumoTab?.id != null) tabIds.push(parfumoTab.id);
    }

    if (settings.usePerfumeHubSearch) {
      const perfumeHubTab = await chrome.tabs.create({
        url: `https://perfumehub.pl/search?q=${encodedName}`,
        active: false,
        windowId: currentWindow.id
      });
      if (perfumeHubTab?.id != null) tabIds.push(perfumeHubTab.id);
    }

    if (tabIds.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await createTabGroup(tabIds, fragranceName);
    }

    // Focus the first tab
    if (tabIds[0]) {
      await chrome.tabs.update(tabIds[0], { active: true });
    }

  } catch (error) {
    console.error("Error performing searches:", error);
  }
}



// 4. Event Listeners (Simplified and Robust)
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "searchFragrantica" && info.selectionText) {
    performFragranceSearch(info.selectionText);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.useParfumoSearch || changes.fragranticaLanguageUrl || changes.usePerfumeHubSearch) {
    updateContextMenu();
  }
});

// 5. Installation Setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    fragranticaLanguageUrl: "https://www.fragrantica.com",
    useParfumoSearch: false,
    usePerfumeHubSearch: false,
  }).then(updateContextMenu).catch(console.error);
});