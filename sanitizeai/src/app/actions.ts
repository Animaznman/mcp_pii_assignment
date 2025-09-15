'use server';

import { sanitizeTextWithMCP } from '../ai/flows/sanitize-text-with-mcp';
// import { createStreamableValue } from 'ai/rsc';
const createStreamableValue = (...args: any[]) => ({
  update: () => {},
  done: () => {},
  error: () => {},
  value: {},
});

export async function getSanitizedTextStreamAction(data: {
  text: string;
  sanitizationRequest: string;
}) {
  const stream = createStreamableValue<
    { step: string } | { result: { sanitizedText: string; toolUsed: string } },
    never
  >();

  (async () => {
    try {
      const out = await sanitizeTextWithMCP(data, (step: string) =>
        stream.update({ step })
      );
      stream.done({ result: out });
    } catch (e: any) {
      stream.error(e.message);
    }
  })();

  return stream.value;
}
