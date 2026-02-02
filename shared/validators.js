// CSS Safety Validation
export const Validators = {
  // Safe CSS properties whitelist
  SAFE_PROPERTIES: [
    // Colors & Background
    'color', 'backgroundColor', 'backgroundImage', 'backgroundSize',
    'backgroundPosition', 'backgroundRepeat', 'opacity',
    
    // Typography
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration',
    'textTransform', 'textShadow',
    
    // Spacing
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    
    // Borders & Effects
    'border', 'borderColor', 'borderWidth', 'borderStyle', 'borderRadius',
    'boxShadow', 'filter', 'backdropFilter',
    
    // Sizing
    'maxWidth', 'minWidth', 'maxHeight', 'minHeight'
  ],

  DANGEROUS_PATTERNS: [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /behavior\s*:/gi,
    /<script/gi,
    /eval\s*\(/gi
  ],

  validateStyleObject(styles) {
    const validated = {};
    
    for (const [property, value] of Object.entries(styles)) {
      // Check if property is in whitelist
      if (!this.SAFE_PROPERTIES.includes(property)) {
        console.warn(`Rejected unsafe CSS property: ${property}`);
        continue;
      }
      
      // Check value for dangerous patterns
      if (typeof value === 'string') {
        let isDangerous = false;
        for (const pattern of this.DANGEROUS_PATTERNS) {
          if (pattern.test(value)) {
            isDangerous = true;
            console.warn(`Rejected dangerous CSS value: ${value}`);
            break;
          }
        }
        
        if (isDangerous) continue;
      }
      
      validated[property] = value;
    }
    
    return validated;
  },

  sanitizeCSSString(css) {
    let sanitized = css;
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '/* removed */');
    }
    return sanitized;
  },

  validateLLMResponse(response) {
    try {
      if (!response || typeof response !== 'object') {
        return { valid: false, error: 'Invalid response format' };
      }
      
      if (!Array.isArray(response.selectors)) {
        return { valid: false, error: 'Response must contain selectors array' };
      }
      
      for (const selector of response.selectors) {
        if (!selector.selector || typeof selector.selector !== 'string') {
          return { valid: false, error: 'Each selector must have a selector string' };
        }
        
        if (!selector.styles || typeof selector.styles !== 'object') {
          return { valid: false, error: 'Each selector must have styles object' };
        }
        
        // Validate styles
        const validatedStyles = this.validateStyleObject(selector.styles);
        selector.styles = validatedStyles;
      }
      
      return { valid: true, data: response };
    } catch (error) {
      return { valid: false, error: `Validation error: ${error.message}` };
    }
  }
};
