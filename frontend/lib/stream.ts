import { SSEEventSchema, type SSEEvent } from "./types";

export async function* readSSEStream(response: Response): AsyncGenerator<SSEEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      try {
        const parsed = JSON.parse(dataLine.slice(6));
        const result = SSEEventSchema.safeParse(parsed);
        if (result.success) yield result.data;
      } catch {
        // skip malformed events
      }
    }
  }
}
