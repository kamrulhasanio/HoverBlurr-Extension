browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({ blurValue: 10, whitelist: [] })
    .then(() => {
      console.log("HoverBlurr extension installed with default settings.");
    });
});
