// Configuration management
export const Config = {
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
  },

  async validate(config) {
    if (!config.endpoint || !config.apiKey) {
      return { valid: false, error: 'Endpoint and API key are required' };
    }
    
    try {
      const response = await fetch(`${config.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: `Connection failed: ${response.status}` };
      }
    } catch (error) {
      return { valid: false, error: `Connection error: ${error.message}` };
    }
  }
};
