import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { ai } from '../lib/ai'; // your Genkit instance
import type { definePrompt } from '@genkit-ai/ai';

const PORT = Number(process.env.MCP_PORT ?? 9003);

function addSanitizationTool(
  server: McpServer,
  name: string,
  description: string,
  systemPrompt: string
) {
  server.addTool({
    name,
    description,
    inputSchema: z.object({ text: z.string() }),
    outputSchema: z.object({ sanitizedText: z.string() }),
    execute: async ({ text }: { text: string }) => {
      const prompt = (definePrompt as any)(
        {
          name: `${name}Prompt`,
          inputSchema: z.object({ text: z.string() }),
          outputSchema: z.object({ sanitizedText: z.string() }),
          model: 'openai/gpt-4.1',
        },
        async (input: { text: string }) => ({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input.text },
          ],
        })
      );
      const res = await prompt({ text });
      return { sanitizedText: res.sanitizedText };
    },
  });
}

const server = new McpServer(
  { name: 'SanitizeAIServer', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

addSanitizationTool(
  server,
  'anonymize_pii',
  'Anonymises names, emails, phone numbers, addresses, dates of birth, etc.',
  'You are a PII anonymiser.  Return only the anonymised text.'
);

addSanitizationTool(
  server,
  'redact_financial',
  'Redacts IBAN, credit-card numbers, crypto wallets, sort codes, etc.',
  'You are a financial-data redactor.  Return only the redacted text.'
);

const app = express();
app.use(cors({ origin: '*' })); // dev only
app.use(express.json());

app.post('/mcp', (req: any, res: any, next: any) => {
  server
    .handleRequest(req.body, { sessionId: req.ip })
    .then((resp: any) => res.json(resp))
    .catch(next);
});

createServer(app).listen(PORT, () =>
  console.log(`[MCP] SanitizeAIServer listening on :${PORT}`)
);
