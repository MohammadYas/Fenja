// Valg af providers: rigtige når nøgler findes, ellers mock — så hele appen
// kan køre lokalt og i CI uden nøgler (NFR-5). Tving mock med MOCK_PROVIDERS=1.

import type { ImageProvider } from "./image";
import type { TextProvider } from "./text";
import { MockImageProvider, MockTextProvider } from "./mock";

export function erMockTilstand(): boolean {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  return !process.env.FAL_KEY || !process.env.ANTHROPIC_API_KEY;
}

export async function hentImageProvider(): Promise<ImageProvider> {
  if (erMockTilstand()) return new MockImageProvider();
  const { FalImageProvider } = await import("./fal");
  return new FalImageProvider();
}

export async function hentTextProvider(): Promise<TextProvider> {
  if (erMockTilstand()) return new MockTextProvider();
  const { AnthropicTextProvider } = await import("./anthropic");
  return new AnthropicTextProvider();
}
