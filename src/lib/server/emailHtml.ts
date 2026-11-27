/**
 * HTML handling for admin emails.
 *
 * - `sanitizeComposerHtml`: strict allowlist for what the admin writes.
 * - `toEmailBodyHtml`: sanitise, then add email-safe inline styles.
 * - `htmlToPlainText`: plain-text version (blocks → line breaks,
 *   links → "text (url)").
 * - `sanitizeInboundHtml`: strict cleaning of received mail for display.
 *
 * Relative imports (with .ts) so `node --test` can load this file directly.
 */
import sanitizeHtml from 'sanitize-html';
import { toPlainText } from '@react-email/render';
import { emailTokens as t } from '../../emails/reply/tokens.ts';
import { SAFE_LINK_PATTERN as SAFE_LINK } from '../../schemas/adminEmail.ts';

// ---------------------------------------------------------------------------
// Composer (admin-written) HTML
// ---------------------------------------------------------------------------

export const COMPOSER_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote',
] as const;


function linkAttributes(href: string | undefined): sanitizeHtml.Attributes {
  const value = href?.trim() ?? '';
  // Only absolute https: and mailto: links. Relative URLs are dropped too
  // (sanitize-html's scheme check only applies to absolute URLs).
  if (!SAFE_LINK.test(value)) return {};
  return { href: value, target: '_blank', rel: 'noopener' };
}

/** Strict sanitising of composer HTML. Used on save and before rendering. */
export function sanitizeComposerHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [...COMPOSER_ALLOWED_TAGS],
    allowedAttributes: {
      a: [
        'href',
        { name: 'target', multiple: false, values: ['_blank'] },
        { name: 'rel', multiple: false, values: ['noopener'] },
      ],
    },
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesByTag: {},
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: linkAttributes(attribs.href) }),
    },
  }).trim();
}

const bodyFont = `font-family:${t.fontBody};font-size:16px;line-height:1.65;color:${t.ink};`;

const EMAIL_STYLES: Record<string, string> = {
  p: `margin:0 0 16px;${bodyFont}`,
  h2: `margin:24px 0 8px;font-family:${t.fontHeading};font-size:22px;line-height:1.3;font-weight:700;color:${t.ink};`,
  h3: `margin:20px 0 8px;font-family:${t.fontHeading};font-size:18px;line-height:1.35;font-weight:700;color:${t.ink};`,
  ul: `margin:0 0 16px;padding:0 0 0 24px;${bodyFont}`,
  ol: `margin:0 0 16px;padding:0 0 0 24px;${bodyFont}`,
  li: `margin:0 0 6px;${bodyFont}`,
  blockquote: `margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid ${t.line};font-family:${t.fontBody};font-size:16px;line-height:1.65;font-style:italic;color:${t.muted};`,
  a: `color:${t.accent};text-decoration:underline;`,
  strong: 'font-weight:700;',
  b: 'font-weight:700;',
  em: 'font-style:italic;',
  i: 'font-style:italic;',
  u: 'text-decoration:underline;',
};

/**
 * Adds inline styles to already-sanitised composer HTML. Any existing style
 * attribute is replaced, so only these styles can appear.
 */
function addEmailStyles(cleanHtml: string): string {
  const transformTags: Record<string, sanitizeHtml.Transformer> = {};
  for (const [tag, style] of Object.entries(EMAIL_STYLES)) {
    transformTags[tag] = (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, style },
    });
  }
  return sanitizeHtml(cleanHtml, {
    allowedTags: [...COMPOSER_ALLOWED_TAGS],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'target', 'rel', 'style'],
    },
    allowedSchemes: ['https', 'mailto'],
    allowProtocolRelative: false,
    transformTags,
  });
}

/** Sanitised + styled HTML for the email body. */
export function toEmailBodyHtml(input: string): string {
  return addEmailStyles(sanitizeComposerHtml(input));
}

/** Plain-text version of (sanitised) HTML. */
export function htmlToPlainText(html: string): string {
  const text = toPlainText(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { linkBrackets: ['(', ')'], hideLinkIfSameAsText: true } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
    ],
  });
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/** True when the composer HTML contains visible text. */
export function hasVisibleText(html: string): boolean {
  return htmlToPlainText(sanitizeComposerHtml(html)).length > 0;
}

// ---------------------------------------------------------------------------
// Inbound (received) HTML
// ---------------------------------------------------------------------------

/** Rejects url(), expression(), javascript: and markup inside style values. */
const SAFE_STYLE_VALUE = /^(?!.*(?:url\s*\(|expression\s*\(|javascript:|@import|behavior\s*:))[^<>]*$/i;

const INBOUND_STYLE_PROPERTIES = [
  'color', 'background-color', 'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
  'vertical-align', 'white-space', 'word-break', 'overflow-wrap',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-style', 'border-width', 'border-radius', 'border-collapse',
  'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
] as const;
// Deliberately excluded: position, top/right/bottom/left, z-index, transform,
// float, display, visibility, opacity, overflow, content, filter.

const INBOUND_ALLOWED_STYLES: Record<string, RegExp[]> = Object.fromEntries(
  INBOUND_STYLE_PROPERTIES.map((property) => [property, [SAFE_STYLE_VALUE]])
);

const INBOUND_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'img', 'font', 'center', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
  'hr', 'u', 's', 'small', 'sup', 'sub',
];

const DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i;

export interface InboundSanitizeResult {
  html: string;
  hasRemoteImages: boolean;
}

/**
 * Strict cleaning of received HTML: no scripts, forms, iframes, event
 * handlers or positioning styles. Remote (https) images are removed unless
 * `allowRemoteImages`; inline data: images (png/jpeg/gif/webp) are kept.
 */
export function sanitizeInboundHtml(
  input: string,
  { allowRemoteImages }: { allowRemoteImages: boolean }
): InboundSanitizeResult {
  let hasRemoteImages = false;

  const html = sanitizeHtml(input, {
    allowedTags: INBOUND_TAGS.filter(
      (tag) => !['script', 'style', 'iframe', 'form', 'input', 'button', 'textarea', 'select', 'option', 'object', 'embed'].includes(tag)
    ),
    allowedAttributes: {
      '*': ['style', 'dir', 'lang', 'align', 'title'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      table: ['width', 'cellpadding', 'cellspacing', 'border', 'bgcolor'],
      td: ['colspan', 'rowspan', 'valign', 'width', 'height', 'bgcolor'],
      th: ['colspan', 'rowspan', 'valign', 'width', 'height', 'bgcolor'],
      font: ['color', 'face', 'size'],
    },
    allowedStyles: { '*': INBOUND_ALLOWED_STYLES },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'data'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
      a: (tagName, attribs) => {
        const next: sanitizeHtml.Attributes = { ...attribs, target: '_blank', rel: 'noopener noreferrer' };
        return { tagName, attribs: next };
      },
      img: (tagName, attribs) => {
        const src = attribs.src?.trim() ?? '';
        const next: sanitizeHtml.Attributes = { ...attribs };
        delete next.src;
        if (/^https:\/\//i.test(src)) {
          hasRemoteImages = true;
          if (allowRemoteImages) next.src = src;
        } else if (DATA_IMAGE.test(src)) {
          next.src = src;
        } else if (src.length > 0 && !/^cid:/i.test(src)) {
          // http:, protocol-relative and other remote forms count as remote
          // but are never loaded.
          hasRemoteImages = true;
        }
        return { tagName, attribs: next };
      },
    },
  });

  return { html, hasRemoteImages };
}
