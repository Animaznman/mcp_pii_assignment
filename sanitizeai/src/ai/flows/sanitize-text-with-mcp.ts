import type { Client } from '@modelcontextprotocol/sdk';
import { z } from 'zod';
import { ai } from '../../lib/ai';

const inputSchema = z.object({
  text: z.string(),
  sanitizationRequest: z.string(), // free-form user intent
});
type Input = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  sanitizedText: z.string(),
  toolUsed: z.string(),
});
type Output = z.infer<typeof outputSchema>;

export async function sanitizeTextWithMCP(
  raw: Input,
  onProgress?: (step: string) => void
): Promise<Output> {
  onProgress?.('mcp_connect_start');
  const client = new (Client as any)({ name: 'SanitizeAI-Web', version: '1.0.0' });

  const url = `http://localhost:${process.env.MCP_PORT ?? 9003}/mcp`;
  await client.connect({ url, transport: 'http' });
  onProgress?.('mcp_connect_finish');

  onProgress?.('list_tools');
  const toolList = await client.listTools();

  onProgress?.('select_tool');
  const { text: userText, sanitizationRequest } = inputSchema.parse(raw);

  const llmResp = await (ai as any).generate({
    model: 'openai/gpt-4.1',
    prompt:
      `You are an assistant that picks exactly ONE tool from the list below ` +
      `to satisfy the user's request.\n\n` +
      `User request: "${sanitizationRequest}"\n` +
      `User text (first 200 chars): "${userText.slice(0, 200)}"\n\n` +
      `Available tools:\n` +
      toolList.tools.map((t: any) => ` - ${t.name}: ${t.description}`).join('\n') +
      `\n\n` +
      `Call the best tool once and return its result.`,
    tools: toolList.tools.map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      outputSchema: t.outputSchema,
    })),
    toolChoice: 'required',
  });

  const call = llmResp.toolCalls?.[0];
  if (!call) throw new Error('Model did not call a tool');

  onProgress?.('tool_exec_start');
  const result = await client.callTool({
    name: call.name,
    arguments: call.input,
  });
  onProgress?.('tool_exec_finish');

  return {
    sanitizedText: (result as any).sanitizedText,
    toolUsed: call.name,
  };
}
