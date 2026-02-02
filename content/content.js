// Content Script - Page capture and CSS application
// Note: StateTracker is embedded below

// State Tracker for managing page modifications
const StateTracker = {
  appliedCSS: new Map(),
  domBackups: new WeakMap(),
  modifiedElements: new Set(),

  generateCSSId() {
    return `brush-css-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  applyCSS(cssString) {
    const cssId = this.generateCSSId();
    const styleEl = document.createElement('style');
    styleEl.id = cssId;
    styleEl.textContent = cssString;
    document.head.appendChild(styleEl);
    
    this.appliedCSS.set(cssId, {
      element: styleEl,
      css: cssString,
      timestamp: Date.now()
    });
    
    return cssId;
  },

  applyStructuredStyles(selectors) {
    let cssString = '';
    
    for (const selector of selectors) {
      const selectorStr = selector.selector;
      const styles = selector.styles;
      
      let cssRule = `${selectorStr} {\n`;
      for (const [property, value] of Object.entries(styles)) {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssRule += `  ${cssProperty}: ${value};\n`;
      }
      cssRule += '}\n';
      
      cssString += cssRule;
    }
    
    return this.applyCSS(cssString);
  },

  getLastCSSId() {
    if (this.appliedCSS.size === 0) return null;
    
    let lastId = null;
    let lastTimestamp = 0;
    
    for (const [id, data] of this.appliedCSS) {
      if (data.timestamp > lastTimestamp) {
        lastTimestamp = data.timestamp;
        lastId = id;
      }
    }
    
    return lastId;
  },

  undoLast() {
    const lastId = this.getLastCSSId();
    
    if (!lastId) {
      return { success: false, error: 'No changes to undo' };
    }
    
    const cssData = this.appliedCSS.get(lastId);
    if (cssData && cssData.element) {
      cssData.element.remove();
      this.appliedCSS.delete(lastId);
      return { success: true, message: 'Last change reverted' };
    }
    
    return { success: false, error: 'Could not find CSS to remove' };
  },

  hasChanges() {
    return this.appliedCSS.size > 0;
  }
};

// Capture page state for LLM analysis
function capturePageState() {
  const state = {
    url: window.location.href,
    title: document.title,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    structure: captureStructure(),
    styles: captureComputedStyles(),
    text: captureTextContent()
  };
  
  return state;
}

// Capture semantic HTML structure
function captureStructure() {
  const structure = [];
  const importantTags = ['body', 'header', 'nav', 'main', 'article', 'section', 'aside', 'footer', 
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'input', 'img', 'div'];
  
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  for (const tag of importantTags) {
    const elements = document.querySelectorAll(tag);
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      if (rect.top >= -100 && rect.top <= viewportHeight + 100 &&
          rect.left >= -100 && rect.left <= viewportWidth + 100) {
        
        structure.push({
          tag: tag,
          id: el.id || null,
          classes: Array.from(el.classList).slice(0, 5),
          text: el.textContent ? el.textContent.slice(0, 100) : null,
          visible: el.offsetParent !== null,
          position: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        });
      }
    });
  }
  
  return structure.slice(0, 50);
}

// Capture computed styles for key elements
function captureComputedStyles() {
  const styles = {};
  const importantSelectors = ['body', 'h1', 'h2', 'h3', 'p', 'a', 'button'];
  
  for (const selector of importantSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const computed = window.getComputedStyle(el);
      styles[selector] = {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        margin: computed.margin,
        padding: computed.padding
      };
    }
  }
  
  return styles;
}

// Capture text content
function captureTextContent() {
  const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
  let text = '';
  
  for (const el of textElements) {
    if (el.offsetParent !== null) {
      text += el.textContent + ' ';
      if (text.length > 10000) break;
    }
  }
  
  return text.trim();
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'capture':
          const state = capturePageState();
          sendResponse({ success: true, state });
          break;
          
        case 'applyCSS':
          if (request.selectors) {
            const cssId = StateTracker.applyStructuredStyles(request.selectors);
            sendResponse({ success: true, cssId });
          } else {
            sendResponse({ success: false, error: 'No selectors provided' });
          }
          break;
          
        case 'undo':
          const result = StateTracker.undoLast();
          sendResponse(result);
          break;
          
        case 'checkChanges':
          sendResponse({ hasChanges: StateTracker.hasChanges() });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true;
});

console.log('Brush content script loaded');
