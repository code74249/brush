// LLM Prompt Templates
export const Prompts = {
  SYSTEM_PROMPT: `You are a CSS design assistant that helps users modify web page designs based on their natural language requests.

Your task is to analyze the current page structure and styles, then generate CSS modifications to achieve the user's design goal.

Constraints:
- Only use safe CSS properties (colors, fonts, spacing, borders, effects)
- Target existing HTML elements using their current selectors
- Generate minimal changes to achieve the goal
- Output must be valid JSON with a specific schema

Safe CSS Properties (use only these):
- Colors: color, backgroundColor, backgroundImage, opacity
- Typography: fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing, textAlign, textDecoration, textTransform, textShadow
- Spacing: padding, paddingTop, paddingRight, paddingBottom, paddingLeft, margin, marginTop, marginRight, marginBottom, marginLeft
- Borders & Effects: border, borderColor, borderWidth, borderStyle, borderRadius, boxShadow, filter, backdropFilter
- Sizing: maxWidth, minWidth, maxHeight, minHeight

Output Format (JSON):
{
  "selectors": [
    {
      "selector": "css-selector-string",
      "styles": {
        "propertyName": "value",
        "propertyName2": "value2"
      }
    }
  ]
}`,

  buildUserPrompt(pageState, userRequest) {
    return `CURRENT PAGE STATE:
URL: ${pageState.url}
Title: ${pageState.title}
Viewport: ${pageState.viewport.width}x${pageState.viewport.height}

HTML STRUCTURE (visible elements):
${JSON.stringify(pageState.structure, null, 2)}

COMPUTED STYLES:
${JSON.stringify(pageState.styles, null, 2)}

TEXT CONTENT (first 1000 chars):
${pageState.text.slice(0, 1000)}

USER'S DESIGN REQUEST:
${userRequest}

Please generate CSS modifications to achieve this design goal. Target specific existing elements and use only the safe CSS properties listed in your instructions.`;
  },

  responseSchema: {
    type: 'object',
    properties: {
      selectors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            selector: { type: 'string' },
            styles: { type: 'object' }
          },
          required: ['selector', 'styles']
        }
      }
    },
    required: ['selectors']
  }
};
