# Brush Chrome Extension

A Chrome extension that uses Fireworks AI to intelligently redesign web pages based on user text input.

## Features

- **AI-Powered Design**: Uses Kimi K2.5 model via Fireworks AI to analyze page structure and generate CSS modifications
- **Viewport Capture**: Captures visible page elements and styles to provide context to the AI
- **Real-time Application**: Applies design changes immediately to the active tab
- **Undo Support**: Revert the last design change with one click
- **Flexible Configuration**: Configure your own Fireworks AI endpoint, API key, and model

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `/projects/brush` directory
4. The extension icon will appear in your toolbar

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

- **Manifest V3**: Modern Chrome extension format
- **Content Scripts**: Capture page state and apply CSS modifications
- **Service Worker**: Handle Fireworks AI API calls and orchestrate the flow
- **Popup Interface**: User input and status display

## Security

- CSS property whitelist ensures only safe visual properties can be modified
- All LLM output is validated before DOM injection
- No inline scripts or eval() usage
- Minimal permissions (activeTab, scripting, storage)

## Development

### File Structure
```
brush/
├── manifest.json         # Extension manifest
├── popup/               # Browser popup UI
├── content/             # Content scripts
├── background/          # Service worker
├── shared/              # Shared utilities
├── icons/               # Extension icons
├── tests/               # Test files
└── docs/                # Documentation
```

### Testing
Load the extension in Chrome developer mode and test on various websites.

## License

MIT
