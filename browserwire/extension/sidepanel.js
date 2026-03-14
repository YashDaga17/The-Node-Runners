const toggleBtn = document.getElementById('toggleDiscovery');
const statusBadge = document.getElementById('status');
const discoveryInfo = document.getElementById('discoveryInfo');
const manifestCard = document.getElementById('siteManifest');
const manifestContent = document.getElementById('manifestContent');

let isExploring = false;

toggleBtn.addEventListener('click', async () => {
  isExploring = !isExploring;
  
  if (isExploring) {
    toggleBtn.innerText = 'Stop Exploring';
    toggleBtn.classList.remove('btn-primary');
    toggleBtn.classList.add('btn-secondary');
    discoveryInfo.classList.remove('hidden');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.runtime.sendMessage({
      type: 'SEND_TO_CLI',
      payload: {
        type: 'DISCOVERY_START',
        url: tab.url,
        title: tab.title
      }
    });

    // Request capture from content script
    chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_PAGE' });
  } else {
    toggleBtn.innerText = 'Start Exploring';
    toggleBtn.classList.add('btn-primary');
    toggleBtn.classList.remove('btn-secondary');
    discoveryInfo.classList.add('hidden');
    
    chrome.runtime.sendMessage({
      type: 'SEND_TO_CLI',
      payload: { type: 'DISCOVERY_STOP' }
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'WS_CONNECTED') {
    statusBadge.innerText = 'Connected';
    statusBadge.classList.remove('disconnected');
    statusBadge.classList.add('connected');
  } else if (message.type === 'WS_DISCONNECTED') {
    statusBadge.innerText = 'Disconnected';
    statusBadge.classList.add('disconnected');
    statusBadge.classList.remove('connected');
  } else if (message.type === 'FROM_CLI') {
    if (message.payload.type === 'MANIFEST_READY') {
      manifestCard.classList.remove('hidden');
      manifestContent.innerText = JSON.stringify(message.payload.manifest, null, 2);
    }
  }
});

// Initial check
chrome.runtime.sendMessage({ type: 'CONNECT_CLI' }).catch(() => {
  console.log('Background script not yet ready');
});
