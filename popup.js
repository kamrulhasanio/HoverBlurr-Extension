document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('blurRange');
  const blurValueLabel = document.getElementById('blurValue');
  const whitelistButton = document.getElementById('whitelistButton');
  const whitelist = document.getElementById('whitelist');

  // Load initial blur value
  chrome.storage.sync.get(['blurValue'], function(result) {
    if (result.blurValue !== undefined) {
      slider.value = result.blurValue;
      blurValueLabel.textContent = result.blurValue;
    }
  });

  // Load whitelisted sites
  chrome.storage.sync.get(['whitelist'], function(result) {
    const sites = result.whitelist || [];
    updateWhitelistDisplay(sites);
  });

  // Update blur value when slider changes
  slider.addEventListener('input', function() {
    const value = slider.value;
    blurValueLabel.textContent = value;
    chrome.storage.sync.set({ blurValue: value });
    sendMessageToActiveTab({ action: "updateBlur", value: value });
  });

  // Toggle whitelist status
  whitelistButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0 && tabs[0].url) {
        try {
          const hostname = new URL(tabs[0].url).hostname;
          chrome.storage.sync.get(['whitelist'], function(result) {
            let whitelist = result.whitelist || [];
            const index = whitelist.indexOf(hostname);
            if (index === -1) {
              whitelist.push(hostname);
              whitelistButton.textContent = 'Remove Whitelist';
            } else {
              whitelist.splice(index, 1);
              whitelistButton.textContent = 'Whitelist Site';
            }
            chrome.storage.sync.set({ whitelist: whitelist });
            sendMessageToActiveTab({ action: "updateWhitelist" });
            updateWhitelistDisplay(whitelist);
          });
        } catch (e) {
          console.error('Invalid URL:', tabs[0].url, e);
        }
      }
    });
  });

  // Update whitelist display
  function updateWhitelistDisplay(sites) {
    whitelist.innerHTML = '';
    sites.forEach(site => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.textContent = site;
      const removeButton = document.createElement('button');
      removeButton.innerHTML = '<i class="fas fa-trash"></i>';
      removeButton.addEventListener('click', function() {
        chrome.storage.sync.get(['whitelist'], function(result) {
          let whitelist = result.whitelist || [];
          const index = whitelist.indexOf(site);
          if (index !== -1) {
            whitelist.splice(index, 1);
            chrome.storage.sync.set({ whitelist: whitelist });
            sendMessageToActiveTab({ action: "updateWhitelist" });
            updateWhitelistDisplay(whitelist);
          }
        });
      });
      li.appendChild(removeButton);
      whitelist.appendChild(li);
    });
  }

  // Check if the current site is whitelisted
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0 && tabs[0].url) {
      try {
        const hostname = new URL(tabs[0].url).hostname;
        chrome.storage.sync.get(['whitelist'], function(result) {
          const whitelist = result.whitelist || [];
          if (whitelist.includes(hostname)) {
            whitelistButton.textContent = 'Remove Whitelist';
          } else {
            whitelistButton.textContent = 'Whitelist Site';
          }
        });
      } catch (e) {
        console.error('Invalid URL:', tabs[0].url, e);
      }
    }
  });

  // Function to send message to active tab
  function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => { /* This function is empty and just ensures the content script is loaded */ }
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Could not inject script:', chrome.runtime.lastError);
          } else {
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
              if (chrome.runtime.lastError) {
                console.error('Could not send message to content script:', chrome.runtime.lastError);
              } else {
                console.log('Message sent to content script:', message);
              }
            });
          }
        });
      }
    });
  }
});
