# Brush - Chrome Extension Project Plan

## Overview
A Chrome extension that uses Fireworks AI to intelligently redesign web pages based on user text input. The extension captures the current viewport, sends it to an LLM with the user's design request, and applies the generated CSS changes immediately.

## User-Facing Features

### 1. Configuration Panel (First-Run Experience)
- Configure Fireworks AI endpoint, API key, and model
- Default endpoint: `https://api.fireworks.ai/inference/v1`
- Default model: `accounts/fireworks/models/kimi-k2-5`
- Validate connection before saving settings
- Settings persist across browser sessions using Chrome storage API

### 2. Popup Interface
- Clean text input area for design requests (placeholder: "Describe how you want this page to look...")
- "Apply Design" button to trigger the LLM processing and changes
- "Undo Last Change" button to revert the most recent modifications
- Status indicators showing: Capturing → Processing → Applying
- Error messages displayed inline when API calls fail

### 3. Visual Feedback
- Success notification when changes are applied
- Loading spinner during LLM processing
- Error handling for network failures, invalid API keys, or malformed responses
- Non-intrusive toast notifications that auto-dismiss

## Technical Architecture

### Manifest V3 Structure
```
brush/
├── manifest.json              # Extension manifest with permissions
├── popup/                     # Browser popup UI
│   ├── popup.html            # Popup HTML structure
│   ├── popup.js              # Popup JavaScript logic
│   └── popup.css             # Popup styling
├── content/                   # Content scripts (injected into pages)
│   ├── content.js            # Page capture & CSS application logic
│   └── state-tracker.js      # Backup/restore original states
├── background/                # Service worker
│   └── background.js         # Fireworks AI API calls & orchestration
├── shared/                    # Shared utilities across components
│   ├── config.js             # Settings management & validation
│   ├── validators.js         # CSS safety validation & sanitization
│   └── prompts.js            # LLM prompt templates
├── icons/                     # Extension icons (16, 32, 48, 128px)
├── tests/                     # Test files
└── docs/                      # Documentation
```

### Key Technical Decisions

#### LLM Integration
- **API Provider**: Fireworks AI (OpenAI-compatible SDK)
- **Output Format**: JSON structured format with strict schema validation
- **Response Structure**: 
  ```json
  {
    "selectors": [
      {
        "selector": ".header",
        "styles": { "backgroundColor": "#06c", "color": "white" }
      }
    ]
  }
  ```

#### Page Capture Strategy
- **Scope**: Viewport only (what's currently visible to user)
- **Data Extracted**: 
  - HTML structure for visible elements
  - Computed styles for semantic elements (body, h1-h6, p, a, button, etc.)
  - Viewport dimensions and scroll position
- **Size Limiting**: Truncate HTML to prevent token limits (~10k characters)

#### CSS Application Method
- **Primary Method**: `chrome.scripting.insertCSS()` for style injection
- **Element Tracking**: Generate unique IDs for applied styles for easy removal
- **Safety Measures**: Whitelist of safe CSS properties (colors, fonts, spacing, etc.)
- **Revert Strategy**: Store last applied CSS in session storage for single undo

#### Security & Validation
- **CSS Property Whitelist**: Only visual/theming properties, no layout-disrupting properties
- **Input Sanitization**: Validate all LLM output before DOM injection
- **CSP Compliance**: Follow Manifest V3 content security policies
- **Minimal Permissions**: Use activeTab pattern for temporary access

### Data Flow Architecture
```
1. User clicks extension icon → Popup opens
2. User types design request → "Apply Design" clicked
3. Content script captures viewport state → Sends to service worker
4. Service worker calls Fireworks AI with structured prompt
5. LLM returns JSON with CSS changes → Service worker validates & sanitizes
6. Service worker sends CSS to content script → Applies via insertCSS
7. Success shown in popup → Changes stored for potential undo
```

## LLM Integration Details

### Fireworks AI Configuration
- **Default Endpoint**: `https://api.fireworks.ai/inference/v1`
- **Default Model**: `accounts/fireworks/models/kimi-k2-5`
- **Authentication**: Bearer token (API key from user configuration)
- **Request Format**: OpenAI-compatible structured completion

### Prompt Strategy
- **System Role**: "You are a CSS design assistant that helps users modify web page designs based on their natural language requests."
- **Context Provided**: 
  - Current viewport HTML structure
  - Relevant computed styles
  - User's design request
  - Safety constraints (whitelisted CSS properties)
- **Output Constraints**: 
  - JSON format with strict schema
  - Only CSS properties from the approved whitelist
  - Target selectors based on existing page elements

### CSS Property Whitelist
```javascript
const SAFE_CSS_PROPERTIES = [
  // Colors & Background
  'color', 'backgroundColor', 'backgroundImage', 'backgroundSize',
  'backgroundPosition', 'backgroundRepeat', 'opacity',
  
  // Typography
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
  'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration',
  'textTransform', 'textShadow',
  
  // Spacing (non-structural)
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  
  // Borders & Effects
  'border', 'borderColor', 'borderWidth', 'borderStyle', 'borderRadius',
  'boxShadow', 'filter', 'backdropFilter',
  
  // Sizing (non-layout breaking)
  'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  
  // Custom Properties
  '--*' // CSS custom properties
];
```

## Success Criteria

### Core Functionality
✓ **Page Capture**: Extension accurately captures visible viewport HTML and styles  
✓ **LLM Integration**: Successfully sends page state to Fireworks AI and receives structured response  
✓ **CSS Application**: Applies LLM-generated CSS changes to the page using content scripts  
✓ **Undo Functionality**: Single "Undo Last Change" button completely reverts the most recent modifications  
✓ **Configuration**: Settings (endpoint, API key, model) persist across browser sessions  
✓ **Error Handling**: Graceful handling of API failures, invalid responses, and network issues  

### Quality & Safety
✓ **Security**: CSS validation prevents malicious style injection  
✓ **Performance**: Page capture and CSS application happen without noticeable lag  
✓ **Compatibility**: Works across modern websites without breaking functionality  
✓ **User Experience**: Intuitive popup interface with clear status feedback  

### Technical Requirements
✓ **Manifest V3 Compliance**: Follows all Chrome extension best practices  
✓ **Permissions**: Minimal permissions using activeTab pattern  
✓ **Storage**: Uses Chrome storage API for settings persistence  
✓ **Code Organization**: Clean separation of concerns across popup, content, and background scripts  

## Implementation Notes

### Testing Strategy
- **Unit Tests**: CSS validation, prompt generation, state management
- **Integration Tests**: End-to-end flow from popup to CSS application  
- **Security Tests**: Malicious input handling, CSS injection attempts
- **Performance Tests**: Capture and application timing on various page types

### Edge Cases to Handle
- Empty viewport or minimal content pages
- Highly dynamic pages with frequent DOM updates
- Pages with existing CSS custom properties
- LLM responses with invalid selectors or syntax
- Network timeouts or API rate limits
- Users with restricted extension permissions

### Future Enhancements (Post-MVP)
- Multiple change history (not just single undo)
- Design preset templates (e.g., "dark mode", "minimal", "high contrast")
- Batch operations (apply multiple changes sequentially)
- Export/import design configurations
- Learning from user preferences for better suggestions