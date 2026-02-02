// Background Service Worker - Fireworks AI integration and orchestration
import { Config } from '../shared/config.js';
import { Validators } from '../shared/validators.js';
import { Prompts } from '../shared/prompts.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Brush extension installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'applyDesign':
          const result = await applyDesign(request.userRequest);
          sendResponse(result);
          break;
          
        case 'validateConfig':
          const validation = await validateConfiguration(request.config);
          sendResponse(validation);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep channel open for async
});

// Main function to apply design changes
async function applyDesign(userRequest) {
  try {
    // 1. Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      return { success: false, error: 'No active tab found' };
    }
    
    // 2. Capture page state from content script
    const [{ result: captureResult }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'capture' }, resolve);
        });
      }
    });
    
    if (!captureResult || !captureResult.success) {
      return { success: false, error: captureResult?.error || 'Failed to capture page' };
    }
    
    // 3. Load configuration
    const config = await Config.load();
    if (!config.apiKey) {
      return { success: false, error: 'API key not configured. Please set it in settings.' };
    }
    
    // 4. Call Fireworks AI
    const llmResponse = await callFireworksAI(config, captureResult.state, userRequest);
    
    if (!llmResponse.success) {
      return { success: false, error: llmResponse.error };
    }
    
    // 5. Validate LLM response
    const validation = Validators.validateLLMResponse(llmResponse.data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 6. Apply CSS changes via content script
    const [{ result: applyResult }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectors) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'applyCSS', selectors }, resolve);
        });
      },
      args: [validation.data.selectors]
    });
    
    if (!applyResult || !applyResult.success) {
      return { success: false, error: applyResult?.error || 'Failed to apply CSS' };
    }
    
    // 7. Store change info for undo
    await chrome.storage.session.set({
      [`lastChange_${tab.id}`]: {
        cssId: applyResult.cssId,
        timestamp: Date.now()
      }
    });
    
    return { 
      success: true, 
      message: 'Design applied successfully',
      selectors: validation.data.selectors.length
    };
    
  } catch (error) {
    console.error('Apply design error:', error);
    return { success: false, error: error.message };
  }
}

// Call Fireworks AI API
async function callFireworksAI(config, pageState, userRequest) {
  try {
    const response = await fetch(`${config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: Prompts.SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: Prompts.buildUserPrompt(pageState, userRequest)
          }
        ],
        response_format: {
          type: 'json_object'
        },
        temperature: 0.3,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `API error ${response.status}: ${errorText}` 
      };
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return { success: false, error: 'Invalid API response format' };
    }
    
    // Parse the JSON content from the LLM
    const content = data.choices[0].message.content;
    let parsedContent;
    
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      return { 
        success: false, 
        error: `Failed to parse LLM response: ${parseError.message}` 
      };
    }
    
    return { success: true, data: parsedContent };
    
  } catch (error) {
    console.error('Fireworks API error:', error);
    return { success: false, error: `API call failed: ${error.message}` };
  }
}

// Validate configuration by testing connection
async function validateConfiguration(config) {
  try {
    if (!config.endpoint || !config.apiKey) {
      return { valid: false, error: 'Endpoint and API key are required' };
    }
    
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
