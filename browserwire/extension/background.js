let socket = null;

function connectToCLI() {
  socket = new WebSocket('ws://localhost:8787');

  socket.onopen = () => {
    console.log('Connected to BrowserWire CLI');
    chrome.runtime.sendMessage({ type: 'WS_CONNECTED' });
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      chrome.runtime.sendMessage({ type: 'FROM_CLI', payload: message }).catch(() => {
        // Suppress "Receiving end does not exist" errors if sidepanel is closed
      });
    } catch (e) {
      console.error('Failed to parse CLI message', e);
    }
  };

  socket.onerror = (error) => {
    console.warn('WebSocket error (Server might not be running):', error);
  };

  socket.onclose = () => {
    console.log('Disconnected from BrowserWire CLI');
    chrome.runtime.sendMessage({ type: 'WS_DISCONNECTED' }).catch(() => {});
    // Reconnect after 5 seconds instead of 3 to be less aggressive
    setTimeout(connectToCLI, 5000);
  };
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'CONNECT_CLI') {
    connectToCLI();
  } else if (message.type === 'SEND_TO_CLI') {
    if (message.payload.type === 'PAGE_CAPTURE') {
      // Capture screenshot before sending to CLI
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        const payload = {
          ...message.payload,
          screenshot: dataUrl.split(',')[1] // base64 only
        };
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(payload));
        }
      });
    } else {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message.payload));
      }
    }
  }
});

// Auto-connect on startup
connectToCLI();
