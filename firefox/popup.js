document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('blurRange');
  const blurValueLabel = document.getElementById('blurValue');
  const whitelistButton = document.getElementById('whitelistButton');
  const whitelist = document.getElementById('whitelist');

  browser.storage.local.get('blurValue').then(result => {
    if (result.blurValue !== undefined) {
      slider.value = result.blurValue;
      blurValueLabel.textContent = result.blurValue;
    }
  });

  browser.storage.local.get('whitelist').then(result => {
    const sites = result.whitelist || [];
    updateWhitelistDisplay(sites);
    checkIfWhitelisted(sites);
  });

  function checkIfWhitelisted(sites) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const hostname = new URL(tabs[0].url).hostname;
        if (sites.includes(hostname)) {
          whitelistButton.textContent = 'Remove Whitelist';
        } else {
          whitelistButton.textContent = 'Whitelist Site';
        }
      }
    });
  }

  slider.addEventListener('input', () => {
    const value = slider.value;
    blurValueLabel.textContent = value;
    browser.storage.local.set({ blurValue: value });
    sendMessageToActiveTab({ action: "updateBlur", value });
  });

  whitelistButton.addEventListener('click', () => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const hostname = new URL(tabs[0].url).hostname;
        browser.storage.local.get('whitelist').then(result => {
          let whitelist = result.whitelist || [];
          const index = whitelist.indexOf(hostname);
          if (index === -1) {
            whitelist.push(hostname);
            whitelistButton.textContent = 'Remove Whitelist';
          } else {
            whitelist.splice(index, 1);
            whitelistButton.textContent = 'Whitelist Site';
          }
          browser.storage.local.set({ whitelist });
          sendMessageToActiveTab({ action: "updateWhitelist" });
          updateWhitelistDisplay(whitelist);
        });
      }
    });
  });

  function updateWhitelistDisplay(sites) {
    whitelist.innerHTML = '';
    sites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      const removeButton = document.createElement('button');
      removeButton.innerHTML = '<i class="fas fa-trash"></i>';
      removeButton.style.marginLeft = '10px';
      removeButton.addEventListener('click', () => {
        browser.storage.local.get('whitelist').then(result => {
          let whitelist = result.whitelist || [];
          const index = whitelist.indexOf(site);
          if (index !== -1) {
            whitelist.splice(index, 1);
            browser.storage.local.set({ whitelist });
            sendMessageToActiveTab({ action: "updateWhitelist" });
            updateWhitelistDisplay(whitelist);
          }
        });
      });
      li.appendChild(removeButton);
      whitelist.appendChild(li);
    });
  }

  function sendMessageToActiveTab(message) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0) {
        browser.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }
});
