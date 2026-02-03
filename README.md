# Brush Chrome Extension

A Chrome extension that uses AI to intelligently redesign web pages based on user text input.

## Features

- **AI-Powered Design**: Uses Kimi K2.5 model via Fireworks AI to analyze page structure and generate CSS modifications
- **Viewport Capture**: Captures visible page elements and styles to provide context to the AI
- **Real-time Application**: Applies design changes immediately to the active tab
- **Undo Support**: Revert the last design change with one click
- **Flexible Configuration**: Configure your own Fireworks AI endpoint, API key, and model

## Installation

### Method 1: Developer Mode (Local Development)

1. Clone the repo:
   ```bash
   git clone https://github.com/code74249/brush.git
   cd brush
   ```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `/projects/brush` directory
5. The extension icon will appear in your toolbar

### Method 2: From Release (Coming Soon)

Download and install from Chrome Web Store.

## Configuration

On first use, click the settings icon (⚙️) in the popup to configure:

- **API Endpoint**: Fireworks AI endpoint (default: `https://api.fireworks.ai/inference/v1`)
- **API Key**: Your Fireworks AI API key
- **Model**: The model to use (default: `accounts/fireworks/models/kimi-k2-5`)

## Usage

1. Navigate to any web page
2. Click the Brush extension icon
3. Describe how you want the page to look (e.g., "Make it dark mode with blue accents")
4. Click "Apply Design"
5. To revert changes, click "Undo Last Change"

## Architecture

```
Brush Chrome Extension
├── manifest.json              # Manifest V3 configuration
├── popup/                     # Browser popup UI
│   ├── popup.html            # UI structure
│   ├── popup.css             # Styling
│   └── popup.js              # Popup logic
├── content/                   # Content scripts
│   ├── content.js            # Page capture and CSS application
│   └── state-tracker.js      # Undo functionality
├── background/                # Service worker
│   └── background.js         # AI API integration
└── shared/                    # Shared utilities
    ├── config.js             # Configuration management
    ├── validators.js         # CSS safety validation
    └── prompts.js            # LLM prompt templates
```

### Component Overview

- **Manifest V3**: Modern Chrome extension format with ES6 modules
- **Content Scripts**: Capture page state and apply CSS modifications
- **Service Worker**: Handle Fireworks AI API calls and orchestrate the flow
- **Popup Interface**: User input and status display
- **Security**: CSS property whitelist, XSS prevention, input validation

## Development Workflow

This project uses a Pull Request (PR) based development workflow:

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. **Make Changes**: Write code, add tests, update documentation

3. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   ```

4. **Code Review**: Open PR at https://github.com/code74249/brush/pulls

5. **Merge**: Once approved, merge to develop

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Running Tests

```bash
cd tests
node unit.test.js
```

All 7 tests should pass successfully.

## Security

- CSS property whitelist (20+ safe properties only)
- XSS prevention with dangerous pattern detection
- Input sanitization for all LLM output
- Safe URL validation for background images
- No inline scripts or eval() usage
- Minimal permissions (activeTab, scripting, storage)

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Creating feature branches
- Submitting PRs
- Code review process
- Coding standards

## Troubleshooting

**Extension won't load:**
- Verify all files are present
- Check `manifest.json` is valid JSON
- Check Chrome console for errors (F12 → Console)

**Design changes don't apply:**
- Verify your Fireworks API key is valid
- Check internet connection
- Look for error messages in the popup

**Icons missing:**
- Icon files are in `/icons/` directory
- Run generate-icons.py if needed

## License

MIT

## Credits

Built with:
- Chrome Extension Manifest V3
- Fireworks AI (Kimi K2.5 model)
- OpenAI-compatible SDK
- Modern JavaScript (ES6+)

**Repository**: https://github.com/code74249/brush