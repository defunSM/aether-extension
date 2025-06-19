# Aether Prompter

A powerful Chrome extension that provides AI-powered assistance directly in your browser. Aether Prompter supports multiple AI providers including OpenAI, Anthropic, and Groq, allowing you to get AI responses without leaving your current context.

## Features

- 🤖 **Multiple AI Providers**: Choose between OpenAI, Anthropic, and Groq
- 🎯 **Context-Aware**: Get AI assistance while browsing any webpage
- 💻 **Code Support**: Syntax highlighting and copy functionality for code blocks
- ⚡ **Streaming Responses**: Real-time response streaming for better user experience
- 🔧 **Customizable**: Adjust temperature, max tokens, and system prompts
- 🔐 **Secure**: API keys are stored securely in your browser
- 🎨 **Modern UI**: Clean and intuitive interface with markdown support

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/aether-prompter.git
   ```

2. Install dependencies:
   ```bash
   cd aether-prompter
   npm install
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `aether-prompter` directory

## Usage

1. Click the Aether Prompter icon in your Chrome toolbar to open the popup
2. Enter your API key(s) for your preferred AI provider(s)
3. Type your prompt in the input field
4. Get AI-powered responses with markdown formatting and code syntax highlighting

## Configuration

### API Keys
- OpenAI: Get your API key from [OpenAI Platform](https://platform.openai.com)
- Anthropic: Get your API key from [Anthropic Console](https://console.anthropic.com)
- Groq: Get your API key from [Groq Console](https://console.groq.com)

### Advanced Settings
- **Temperature**: Control response randomness (0.0 to 1.0)
- **Max Tokens**: Set maximum response length
- **System Prompt**: Customize the AI's behavior
- **Model Selection**: Choose from available models for each provider

## Development

### Project Structure
```
aether-prompter/
├── popup/           # Extension popup UI
├── utils/           # Utility functions
├── lib/            # Third-party libraries
├── images/         # Extension icons
└── manifest.json   # Extension configuration
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Prism.js](https://prismjs.com/) for syntax highlighting
- [Marked](https://marked.js.org/) for markdown processing
- All the AI providers for their amazing APIs

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/aether-prompter/issues) on GitHub. 