// Initial blur value
let blurValue = 10; // Default blur value

// Retrieve the current blur value from storage
chrome.storage.sync.get(['blurValue'], function(result) {
  if (result.blurValue !== undefined) {
    blurValue = result.blurValue;
  }
  applyBlur();
});

// Apply blur effect to images
function applyBlur() {
  const style = document.createElement('style');
  style.innerHTML = `
    img, image {
      filter: blur(${blurValue}px);
      transition: filter 0.3s;
    }
    img:hover, image:hover {
      filter: blur(0px);
    }
  `;
  document.head.appendChild(style);
}

// Listen for changes in blur value from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlur") {
    blurValue = request.value;
    applyBlur();
  } else if (request.action === "updateWhitelist") {
    isWhitelisted((whitelisted) => {
      if (whitelisted) {
        removeBlur();
      } else {
        applyBlur();
      }
    });
  } else if (request.action === "checkWhitelist") {
    isWhitelisted((whitelisted) => {
      sendResponse({ whitelisted });
    });
    return true; // Will respond asynchronously
  }
});

// Function to check if the current site is whitelisted
function isWhitelisted(callback) {
  chrome.storage.sync.get(['whitelist'], function(result) {
    const whitelist = result.whitelist || [];
    const hostname = window.location.hostname;
    callback(whitelist.includes(hostname));
  });
}

// Apply or remove blur based on whitelist status
isWhitelisted((whitelisted) => {
  if (whitelisted) {
    removeBlur();
  } else {
    applyBlur();
  }
});

function removeBlur() {
  const style = document.createElement('style');
  style.innerHTML = `
    img, image {
      filter: none;
    }
  `;
  document.head.appendChild(style);
}
