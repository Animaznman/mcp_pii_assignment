# SanitizeAI

SanitizeAI is a web application demonstrating how AI can protect sensitive information in text using the Model Context Protocol (MCP).

## Features
- Accepts free-form text and a sanitization intent (e.g. "Anonymize PII")
- Uses GPT-4.1 to pick the correct sanitization tool
- Executes the tool on a stand-alone MCP server and streams progress/results to the browser

## Technology Stack
- Next.js 14 (App Router)
- Genkit
- OpenAI/gpt-4.1 (`openai/gpt-4.1`)
- Anthropic Model Context Protocol (MCP)
- ShadCN UI
- Tailwind CSS
- TypeScript
- react-hook-form + zod
- ai/rsc (React Server Component streaming)

## Quick Start

```bash
git clone <repo>
cd SanitizeAI
npm install
echo OPENAI_API_KEY=*** >> .env

# 1. start MCP server
npm run dev:mcp

# 2. (another shell) start Next.js
npm run dev
```

Open http://localhost:3000 – paste sensitive text, choose an intent, watch the AI pick the correct MCP tool and stream the sanitized result back to you.
