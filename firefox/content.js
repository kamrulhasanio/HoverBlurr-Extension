let blurValue = 10;
let styleElement = null;

async function getBlurValue() {
  const result = await browser.storage.local.get('blurValue');
  if (result.blurValue !== undefined) {
    blurValue = result.blurValue;
  }
  applyBlur();
}

function applyBlur() {
  if (styleElement) {
    styleElement.remove();
  }
  
  styleElement = document.createElement('style');
  styleElement.innerHTML = `
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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlur") {
    blurValue = request.value;
    applyBlur();
  } else if (request.action === "updateWhitelist") {
    checkWhitelist((whitelisted) => {
      if (whitelisted) {
        removeBlur();
      } else {
        applyBlur();
      }
    });
  }
});

async function checkWhitelist(callback) {
  const result = await browser.storage.local.get('whitelist');
  const whitelist = result.whitelist || [];
  const hostname = window.location.hostname;
  callback(whitelist.includes(hostname));
}

checkWhitelist((whitelisted) => {
  if (whitelisted) {
    removeBlur();
  } else {
    applyBlur();
  }
});

function removeBlur() {
  if (styleElement) {
    styleElement.remove();
  }
}

getBlurValue();
