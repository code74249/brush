// Basic tests for Brush extension
// These are simple unit tests that can be run in a Node.js environment

import assert from 'assert';
import { Config } from '../shared/config.js';
import { Validators } from '../shared/validators.js';
import { Prompts } from '../shared/prompts.js';

// Mock chrome API for testing
global.chrome = {
  storage: {
    sync: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve()
    },
    session: {
      set: () => Promise.resolve(),
      get: () => Promise.resolve({})
    }
  },
  runtime: {
    sendMessage: () => Promise.resolve({}),
    onMessage: {
      addListener: () => {}
    }
  },
  tabs: {
    query: () => Promise.resolve([{ id: 1 }]),
    sendMessage: () => Promise.resolve({})
  },
  scripting: {
    executeScript: () => Promise.resolve([{ result: { success: true } }])
  }
};

// Test suite
function runTests() {
  console.log('Running Brush Extension Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test Config defaults
  try {
    assert.strictEqual(Config.defaults.endpoint, 'https://api.fireworks.ai/inference/v1');
    assert.strictEqual(Config.defaults.model, 'accounts/fireworks/models/kimi-k2-5');
    console.log('✓ Config defaults test passed');
    passed++;
  } catch (e) {
    console.error('✗ Config defaults test failed:', e.message);
    failed++;
  }
  
  // Test Validators.safe properties
  try {
    assert(Validators.SAFE_PROPERTIES.includes('color'));
    assert(Validators.SAFE_PROPERTIES.includes('fontSize'));
    assert(Validators.SAFE_PROPERTIES.includes('backgroundColor'));
    console.log('✓ Validators safe properties test passed');
    passed++;
  } catch (e) {
    console.error('✗ Validators safe properties test failed:', e.message);
    failed++;
  }
  
  // Test validateStyleObject
  try {
    const styles = {
      color: 'blue',
      fontSize: '16px',
      evilProperty: 'bad',
      backgroundImage: "url(javascript:alert('xss'))"
    };
    const validated = Validators.validateStyleObject(styles);
    assert.strictEqual(validated.color, 'blue');
    assert.strictEqual(validated.fontSize, '16px');
    assert.strictEqual(validated.evilProperty, undefined);
    assert.strictEqual(validated.backgroundImage, undefined);
    console.log('✓ Style validation test passed');
    passed++;
  } catch (e) {
    console.error('✗ Style validation test failed:', e.message);
    failed++;
  }
  
  // Test validateLLMResponse
  try {
    const validResponse = {
      selectors: [
        {
          selector: '.header',
          styles: { color: 'white', backgroundColor: 'blue' }
        }
      ]
    };
    const result = Validators.validateLLMResponse(validResponse);
    assert.strictEqual(result.valid, true);
    console.log('✓ LLM response validation test passed');
    passed++;
  } catch (e) {
    console.error('✓ LLM response validation test failed:', e.message);
    failed++;
  }
  
  // Test validateLLMResponse with invalid data
  try {
    const invalidResponse = { invalid: 'data' };
    const result = Validators.validateLLMResponse(invalidResponse);
    assert.strictEqual(result.valid, false);
    console.log('✓ Invalid LLM response test passed');
    passed++;
  } catch (e) {
    console.error('✗ Invalid LLM response test failed:', e.message);
    failed++;
  }
  
  // Test Prompts.buildUserPrompt
  try {
    const pageState = {
      url: 'https://example.com',
      title: 'Example Page',
      viewport: { width: 1920, height: 1080 },
      structure: [],
      styles: {},
      text: 'Sample text'
    };
    const userRequest = 'Make it dark mode';
    const prompt = Prompts.buildUserPrompt(pageState, userRequest);
    assert(prompt.includes('https://example.com'));
    assert(prompt.includes('Make it dark mode'));
    assert(prompt.includes('CURRENT PAGE STATE'));
    console.log('✓ Prompt builder test passed');
    passed++;
  } catch (e) {
    console.error('✗ Prompt builder test failed:', e.message);
    failed++;
  }
  
  // Test sanitizeCSSString
  try {
    const maliciousCSS = "color: red; behavior: url(evil); <script>alert('xss')</script>";
    const sanitized = Validators.sanitizeCSSString(maliciousCSS);
    assert(!sanitized.includes('behavior'));
    assert(!sanitized.includes('<script'));
    assert(sanitized.includes('color: red'));
    console.log('✓ CSS sanitization test passed');
    passed++;
  } catch (e) {
    console.error('✗ CSS sanitization test failed:', e.message);
    failed++;
  }
  
  // Summary
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests();
