// Popup JavaScript - UI interactions
// Config functions embedded for popup use
const Config = {
  defaults: {
    endpoint: 'https://api.fireworks.ai/inference/v1',
    model: 'accounts/fireworks/models/kimi-k2-5',
    apiKey: ''
  },

  async load() {
    const result = await chrome.storage.sync.get({
      endpoint: this.defaults.endpoint,
      model: this.defaults.model,
      apiKey: this.defaults.apiKey
    });
    return result;
  },

  async save(config) {
    await chrome.storage.sync.set({
      endpoint: config.endpoint,
      model: config.model,
      apiKey: config.apiKey
    });
  }
};

let currentConfig = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
  await checkUndoStatus();
});

async function loadConfig() {
  currentConfig = await Config.load();
  
  document.getElementById('endpoint').value = currentConfig.endpoint;
  document.getElementById('api-key').value = currentConfig.apiKey;
  document.getElementById('model').value = currentConfig.model;
}

function setupEventListeners() {
  document.getElementById('settings-btn').addEventListener('click', toggleSettings);
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('apply-btn').addEventListener('click', applyDesign);
  document.getElementById('undo-btn').addEventListener('click', undoLastChange);
}

function toggleSettings() {
  const mainPanel = document.getElementById('main-panel');
  const settingsPanel = document.getElementById('settings-panel');
  
  if (settingsPanel.classList.contains('hidden')) {
    mainPanel.classList.add('hidden');
    settingsPanel.classList.remove('hidden');
  } else {
    settingsPanel.classList.add('hidden');
    mainPanel.classList.remove('hidden');
  }
}

async function saveSettings() {
  const endpoint = document.getElementById('endpoint').value.trim();
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('model').value.trim();
  
  if (!endpoint || !apiKey) {
    showSettingsStatus('Endpoint and API key are required', 'error');
    return;
  }
  
  const config = { endpoint, apiKey, model };
  
  try {
    await Config.save(config);
    currentConfig = config;
    showSettingsStatus('Settings saved successfully', 'success');
    
    setTimeout(() => {
      toggleSettings();
    }, 1500);
  } catch (error) {
    showSettingsStatus(`Error saving settings: ${error.message}`, 'error');
  }
}

async function testConnection() {
  const endpoint = document.getElementById('endpoint').value.trim();
  const apiKey = document.getElementById('api-key').value.trim();
  
  if (!endpoint || !apiKey) {
    showSettingsStatus('Endpoint and API key are required', 'error');
    return;
  }
  
  showSettingsStatus('Testing connection...', 'loading');
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'validateConfig',
      config: { endpoint, apiKey }
    });
    
    if (result.valid) {
      showSettingsStatus('Connection successful!', 'success');
    } else {
      showSettingsStatus(result.error, 'error');
    }
  } catch (error) {
    showSettingsStatus(`Connection failed: ${error.message}`, 'error');
  }
}

async function applyDesign() {
  const request = document.getElementById('design-request').value.trim();
  
  if (!request) {
    showStatus('Please describe how you want the page to look', 'error');
    return;
  }
  
  if (!currentConfig || !currentConfig.apiKey) {
    showStatus('Please configure your API key in settings', 'error');
    return;
  }
  
  setLoading(true);
  showStatus('Capturing page and processing...', 'loading');
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'applyDesign',
      userRequest: request
    });
    
    if (result.success) {
      showStatus(`Design applied! Modified ${result.selectors} element(s)`, 'success');
      document.getElementById('design-request').value = '';
      await checkUndoStatus();
    } else {
      showStatus(`Error: ${result.error}`, 'error');
    }
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

async function undoLastChange() {
  setLoading(true);
  showStatus('Reverting last change...', 'loading');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'undo' });
    
    if (result.success) {
      showStatus('Last change reverted', 'success');
    } else {
      showStatus(`Error: ${result.error}`, 'error');
    }
    
    await checkUndoStatus();
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

async function checkUndoStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'checkChanges' });
    
    const undoBtn = document.getElementById('undo-btn');
    undoBtn.disabled = !result.hasChanges;
  } catch (error) {
    console.error('Error checking undo status:', error);
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 5000);
  }
}

function showSettingsStatus(message, type) {
  const statusEl = document.getElementById('settings-panel').querySelector('.status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function setLoading(loading) {
  const applyBtn = document.getElementById('apply-btn');
  const undoBtn = document.getElementById('undo-btn');
  
  applyBtn.disabled = loading;
  undoBtn.disabled = loading || undoBtn.disabled;
  
  if (loading) {
    applyBtn.textContent = 'Processing...';
  } else {
    applyBtn.textContent = 'Apply Design';
  }
}