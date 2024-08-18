// background.js

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({ blurValue: 10, whitelist: [] })
    .then(() => {
      console.log("HoverBlurr extension installed with default settings.");
    });
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlur") {
    browser.storage.local.set({ blurValue: request.value });
  } else if (request.action === "updateWhitelist") {
    browser.storage.local.get('whitelist').then(result => {
      const whitelist = result.whitelist || [];
      const hostname = new URL(sender.tab.url).hostname;
      const index = whitelist.indexOf(hostname);
      if (index === -1) {
        whitelist.push(hostname);
      } else {
        whitelist.splice(index, 1);
      }
      browser.storage.local.set({ whitelist });
    });
  }
});
