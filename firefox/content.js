let blurValue = 10;
let styleElement = null;

async function getBlurValue() {
  const result = await browser.storage.local.get('blurValue');
  if (result.blurValue !== undefined) {
    blurValue = result.blurValue;
  }
  checkWhitelistAndApplyBlur();
}

async function checkWhitelistAndApplyBlur() {
  const result = await browser.storage.local.get('whitelist');
  const whitelist = result.whitelist || [];
  const hostname = window.location.hostname;
  
  if (whitelist.includes(hostname)) {
    removeBlur();
  } else {
    applyBlur();
  }
}

function applyBlur() {
  if (styleElement) {
    styleElement.remove();
  }
  
  styleElement = document.createElement('style');
  styleElement.textContent = `
    img, image {
      filter: blur(${blurValue}px);
      transition: filter 0.3s;
    }
    img:hover, image:hover {
      filter: blur(0px);
    }
  `;
  document.head.appendChild(styleElement);
}

function removeBlur() {
  if (styleElement) {
    styleElement.remove();
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlur") {
    blurValue = request.value;
    applyBlur();
  } else if (request.action === "updateWhitelist") {
    checkWhitelistAndApplyBlur();
  }
});

// Initialize the blur value and check whitelist on load
getBlurValue();

