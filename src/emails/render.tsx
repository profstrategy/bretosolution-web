import type { ReactNode } from 'react';
import { render, toPlainText } from '@react-email/render';
import { getUnsubscribeUrl } from '@/content/emails';

interface RenderEmailOptions {
  includeUnsubscribeUrl?: boolean;
}

export async function renderEmail(
  component: ReactNode,
  options: RenderEmailOptions = {}
): Promise<{ html: string; text: string }> {
  const html = await render(component);
  const renderedText = toPlainText(html);
  const text = options.includeUnsubscribeUrl
    ? `${renderedText.trimEnd()}\n\n${getUnsubscribeUrl()}`
    : renderedText;

  return { html, text };
}
