// State Tracker for managing page modifications and undo functionality
const StateTracker = {
  // Store applied CSS blocks with IDs for easy removal
  appliedCSS: new Map(),
  
  // Store DOM modifications for structural changes
  domBackups: new WeakMap(),
  modifiedElements: new Set(),

  // Generate unique ID for CSS blocks
  generateCSSId() {
    return `brush-css-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Apply CSS and track it
  applyCSS(cssString) {
    const cssId = this.generateCSSId();
    const styleEl = document.createElement('style');
    styleEl.id = cssId;
    styleEl.textContent = cssString;
    document.head.appendChild(styleEl);
    
    // Store for potential undo
    this.appliedCSS.set(cssId, {
      element: styleEl,
      css: cssString,
      timestamp: Date.now()
    });
    
    return cssId;
  },

  // Apply styles from structured LLM response
  applyStructuredStyles(selectors) {
    let cssString = '';
    
    for (const selector of selectors) {
      const selectorStr = selector.selector;
      const styles = selector.styles;
      
      // Build CSS rule
      let cssRule = `${selectorStr} {\n`;
      for (const [property, value] of Object.entries(styles)) {
        // Convert camelCase to kebab-case
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssRule += `  ${cssProperty}: ${value};\n`;
      }
      cssRule += '}\n';
      
      cssString += cssRule;
    }
    
    return this.applyCSS(cssString);
  },

  // Apply inline styles to specific elements
  applyInlineStyles(selector, styles) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      // Backup original styles if not already backed up
      if (!this.domBackups.has(el)) {
        this.domBackups.set(el, {
          cssText: el.style.cssText,
          timestamp: Date.now()
        });
      }
      
      // Track as modified
      this.modifiedElements.add(el);
      
      // Apply new styles
      Object.assign(el.style, styles);
    });
    
    return elements.length;
  },

  // Get the most recent CSS ID for undo
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

  // Undo the most recent change
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

  // Clear all tracked data
  clear() {
    // Remove all applied CSS
    for (const [id, data] of this.appliedCSS) {
      if (data.element) {
        data.element.remove();
      }
    }
    this.appliedCSS.clear();
    
    // Revert all DOM modifications
    this.modifiedElements.forEach(el => {
      const backup = this.domBackups.get(el);
      if (backup) {
        el.style.cssText = backup.cssText;
      }
    });
    this.modifiedElements.clear();
  },

  // Check if there are changes to undo
  hasChanges() {
    return this.appliedCSS.size > 0;
  }
};
