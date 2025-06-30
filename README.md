# Less MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with [Less](https://less.chuva.io) - an Infrastructure from Code tool that automates the creation and deployment of serverless REST APIs, WebSockets, Pub/Sub systems, CRON jobs, cloud functions, and more to AWS.

**[View the Less documentation to learn more.](https://docs.less.chuva.io)**

## About Less

Less is an Infrastructure from Code tool that inspects your file structure and automatically provisions and deploys your code and serverless AWS cloud infrastructure.

## MCP Server Features

This MCP server provides comprehensive tools for:

### Project Management

- Deploy projects to AWS
- Run cloud projects locally
- Manage projects
- View deployment logs and function logs

### Resource Creation & Management

- **REST APIs**: Create HTTP routes with dynamic paths and middleware support
- **WebSockets**: Create real-time sockets with custom channels
- **Topics/Subscribers**: Build event-driven pub/sub systems with fault tolerance
- **CRON Jobs**: Schedule recurring tasks with CRON expressions
- **Cloud Functions**: Create serverless functions callable via SDK or REST API

### Multi-Language Support

All resources support JavaScript, TypeScript, and Python, with more languages coming soon.

## Installation

### VS Code

The easiest way to add Less to your VS Code workspace is by adding the following to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "Less": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@chuva.io/less-mcp"]
    }
  }
}
```

Learn more and see other config options in the [VS Code Copilot documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server).

### Windsurf

Set up Less MCP in Windsurf by adding the following to your `mcp_config.json`:

```json
{
  "mcpServers": {
    "Less": {
      "command": "npx",
      "args": ["-y", "@chuva.io/less-mcp"]
    }
  }
}
```

### Cursor

Set up Less MCP in Cursor by adding the following to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Less": {
      "command": "npx",
      "args": ["-y", "@chuva.io/less-mcp"]
    }
  }
}
```
