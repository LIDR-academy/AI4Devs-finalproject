# AI4Devs Final Project - Claude Code Configuration

This project uses the following MCP servers for enhanced functionality:

## Active MCP Servers

### Context7 - Documentation & Research
- **Purpose**: Official library documentation, code examples, best practices
- **Activation**: Automatic on library imports, framework questions
- **Manual Flag**: `--c7`, `--context7`

### Sequential Thinking - Complex Analysis
- **Purpose**: Multi-step problem solving, architectural analysis, debugging
- **Activation**: Automatic on complex debugging, system design questions
- **Manual Flag**: `--seq`, `--sequential`

### Magic - UI Components & Design
- **Purpose**: Modern UI component generation, design system integration
- **Activation**: Automatic on UI component requests, design system queries
- **Manual Flag**: `--magic`

### Puppeteer - Browser Automation & Testing
- **Purpose**: Cross-browser testing, performance monitoring, automation
- **Activation**: Automatic on testing workflows, performance monitoring
- **Manual Flag**: `--puppeteer`

## Project Commands

Run these commands to ensure all MCP servers are properly installed:

```bash
# Install MCP servers for this project
claude mcp add --transport http context7 https://mcp.context7.com/mcp
claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking
claude mcp add magic npx @21st-dev/magic@latest
claude mcp add puppeteer npx @modelcontextprotocol/server-puppeteer
```

## Usage

When working on this project, Claude Code will automatically detect and activate the appropriate MCP servers based on:
- Task complexity and type
- File patterns and imports
- Keywords in requests
- Active persona (if any)

Use `--all-mcp` to activate all servers simultaneously for comprehensive operations.