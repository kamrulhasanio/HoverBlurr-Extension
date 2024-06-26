chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blurValue: 10, whitelist: [] });
});
