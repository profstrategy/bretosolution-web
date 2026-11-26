import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasVisibleText,
  htmlToPlainText,
  sanitizeComposerHtml,
  sanitizeInboundHtml,
  toEmailBodyHtml,
} from '../emailHtml.ts';
import {
  createDraftSchema,
  draftRuleErrors,
  previewDraftSchema,
  SAFE_LINK_PATTERN,
  sendRuleErrors,
  uploadUrlRequestSchema,
  type NormalisedDraft,
} from '../../../schemas/adminEmail.ts';

describe('sanitizeComposerHtml', () => {
  test('keeps only the allowed tags', () => {
    const out = sanitizeComposerHtml(
      '<h2>Hi</h2><p>A <strong>b</strong> <em>c</em> <u>d</u></p><ul><li>x</li></ul><blockquote>q</blockquote>' +
        '<script>alert(1)</script><style>p{}</style><img src="https://x/y.png"><iframe src="https://x"></iframe><h1>big</h1><div>div</div>'
    );
    assert.equal(
      out,
      '<h2>Hi</h2><p>A <strong>b</strong> <em>c</em> <u>d</u></p><ul><li>x</li></ul><blockquote>q</blockquote>bigdiv'
    );
  });

  test('removes event handlers, styles and classes', () => {
    const out = sanitizeComposerHtml('<p onclick="x()" style="position:fixed" class="c">t</p>');
    assert.equal(out, '<p>t</p>');
  });

  test('keeps https and mailto links with target and rel', () => {
    assert.equal(
      sanitizeComposerHtml('<a href="https://bretosolution.com/x" target="_top" rel="opener">s</a>'),
      '<a href="https://bretosolution.com/x" target="_blank" rel="noopener">s</a>'
    );
    assert.equal(
      sanitizeComposerHtml('<a href="mailto:hello@bretosolution.com">m</a>'),
      '<a href="mailto:hello@bretosolution.com" target="_blank" rel="noopener">m</a>'
    );
  });

  test('drops javascript:, http:, data:, protocol-relative and relative links', () => {
    for (const href of ['javascript:alert(1)', 'http://x.com', 'data:text/html,x', '//x.com', '/admin', 'page.html', ' JaVaScRiPt:alert(1)']) {
      assert.equal(sanitizeComposerHtml(`<a href="${href}">t</a>`), '<a>t</a>', href);
    }
  });
});

describe('toEmailBodyHtml', () => {
  test('adds inline email styles and discards user styles', () => {
    const out = toEmailBodyHtml('<p style="color:red">Hello <a href="https://x.com">link</a></p>');
    assert.match(out, /^<p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:16px;/);
    assert.ok(!out.includes('color:red'));
    assert.match(out, /<a href="https:\/\/x.com" target="_blank" rel="noopener" style="color:#B8400F;text-decoration:underline">link<\/a>/);
  });
});

describe('htmlToPlainText', () => {
  test('blocks become line breaks and links become "text (url)"', () => {
    const text = htmlToPlainText(
      '<p>Hello <a href="https://x.com/a">site</a></p><h2>Title</h2><ul><li>one</li><li>two</li></ul><p><a href="mailto:a@b.co">mail us</a></p>'
    );
    assert.equal(text, 'Hello site (https://x.com/a)\n\nTitle\n\n * one\n * two\n\nmail us (a@b.co)');
  });

  test('hasVisibleText', () => {
    assert.equal(hasVisibleText('<p> </p><p><br></p>'), false);
    assert.equal(hasVisibleText('<script>x</script>'), false);
    assert.equal(hasVisibleText('<p>Hi</p>'), true);
  });
});

describe('sanitizeInboundHtml', () => {
  const dirty =
    '<div style="position:absolute;top:0;color:#123456;padding:4px" onclick="x()">' +
    '<script>alert(1)</script><form action="https://evil"><input name="p"><button>go</button></form>' +
    '<iframe src="https://evil"></iframe><a href="javascript:alert(1)">bad</a> <a href="https://ok.example">ok</a>' +
    '<img src="https://tracker.example/p.gif" alt="pixel"><img src="data:image/png;base64,iVBORw0KGgo=" alt="inline">' +
    '<p style="background:url(https://evil/x.png);font-weight:bold">t</p></div>';

  test('removes scripts, forms, iframes, handlers and positioning styles', () => {
    const { html } = sanitizeInboundHtml(dirty, { allowRemoteImages: false });
    for (const banned of ['<script', '<form', '<input', '<button', '<iframe', 'onclick', 'position', 'top:', 'javascript:', 'url(']) {
      assert.ok(!html.toLowerCase().includes(banned), `should not contain ${banned}`);
    }
    assert.match(html, /color:#123456/);
    assert.match(html, /font-weight:bold/);
    assert.match(html, /<a href="https:\/\/ok.example" target="_blank" rel="noopener noreferrer">ok<\/a>/);
  });

  test('removes remote images by default and reports them', () => {
    const result = sanitizeInboundHtml(dirty, { allowRemoteImages: false });
    assert.equal(result.hasRemoteImages, true);
    assert.ok(!result.html.includes('tracker.example'));
    assert.match(result.html, /<img alt="pixel" \/>/);
    assert.match(result.html, /src="data:image\/png;base64,/);
  });

  test('keeps https images with ?images=1', () => {
    const result = sanitizeInboundHtml(dirty, { allowRemoteImages: true });
    assert.equal(result.hasRemoteImages, true);
    assert.match(result.html, /src="https:\/\/tracker.example\/p.gif"/);
  });

  test('never loads http or protocol-relative images', () => {
    const result = sanitizeInboundHtml('<img src="http://x/a.png"><img src="//x/b.png">', { allowRemoteImages: true });
    assert.equal(result.hasRemoteImages, true);
    assert.ok(!result.html.includes('x/a.png') && !result.html.includes('x/b.png'));
  });

  test('drops other ways to load content or run script (Stage 7)', () => {
    const tricky =
      '<style>body{background:url(https://evil/s.png)}</style><meta http-equiv="refresh" content="0;url=https://evil">' +
      '<link rel="stylesheet" href="https://evil/x.css"><base href="https://evil/">' +
      '<svg onload="alert(1)"><image href="https://evil/i.png"/></svg><object data="https://evil/o"></object>' +
      '<img src="data:image/png;base64,iVBORw0KGgo=" srcset="https://evil/1x.png 1x" onerror="alert(1)">' +
      '<table background="https://evil/bg.png"><tr><td background="https://evil/td.png">x</td></tr></table>' +
      '<a href="data:text/html,<script>alert(1)</script>">d</a><a href="vbscript:x">v</a>';
    const { html } = sanitizeInboundHtml(tricky, { allowRemoteImages: true });
    for (const banned of ['<style', '<meta', '<link', '<base', '<svg', '<image', '<object', 'srcset', 'onerror', 'onload', 'background=', 'evil', 'data:text', 'vbscript']) {
      assert.ok(!html.toLowerCase().includes(banned), `should not contain ${banned}`);
    }
  });

  test('a message without remote images reports false', () => {
    assert.equal(sanitizeInboundHtml('<p>Hi</p>', { allowRemoteImages: false }).hasRemoteImages, false);
  });
});

describe('admin email schema rules', () => {
  const base: NormalisedDraft = {
    kind: 'GENERAL',
    toEmail: 'a@example.com',
    recipientName: '',
    businessName: '',
    subject: 'Hello {name}',
    bodyHtml: '<p>Hi</p>',
    calendlyUrl: null,
    rows: [],
    attachment: null,
    inReplyToMessageId: null,
    source: null,
  };

  test('GENERAL needs a personalised subject', () => {
    assert.deepEqual(draftRuleErrors({ ...base, subject: ' ' }), {
      subject: 'Write a personalised subject for this email.',
    });
    assert.deepEqual(draftRuleErrors(base), {});
  });

  test('rows only on QUOTE; source type must match AUDIT/QUOTE', () => {
    const rows = [{ label: 'Price', value: '₦100' }];
    assert.ok('rows' in draftRuleErrors({ ...base, rows }));
    assert.deepEqual(draftRuleErrors({ ...base, kind: 'QUOTE', subject: '', rows }), {});
    assert.ok('source' in draftRuleErrors({ ...base, kind: 'AUDIT', source: { type: 'QUOTE', id: 'c'.repeat(25) } }));
    assert.deepEqual(draftRuleErrors({ ...base, source: { type: 'QUOTE', id: 'c'.repeat(25) } }), {});
  });

  test('AUDIT needs an attachment and every send needs text', () => {
    const errors = sendRuleErrors({ ...base, kind: 'AUDIT', subject: '' }, false);
    assert.ok('attachment' in errors);
    assert.ok('bodyHtml' in errors);
  });

  test('create schema limits rows and Calendly links', () => {
    const ok = createDraftSchema.safeParse({ kind: 'QUOTE', toEmail: 'a@example.com', calendlyUrl: 'https://calendly.com/breto/30min' });
    assert.equal(ok.success, true);
    const badLink = createDraftSchema.safeParse({ kind: 'QUOTE', toEmail: 'a@example.com', calendlyUrl: 'https://evil.example/calendly.com' });
    assert.equal(badLink.success, false);
    const tooMany = createDraftSchema.safeParse({
      kind: 'QUOTE',
      toEmail: 'a@example.com',
      rows: Array.from({ length: 9 }, () => ({ label: 'a', value: 'b' })),
    });
    assert.equal(tooMany.success, false);
    const longLabel = createDraftSchema.safeParse({ kind: 'QUOTE', toEmail: 'a@example.com', rows: [{ label: 'x'.repeat(41), value: 'v' }] });
    assert.equal(longLabel.success, false);
    const unknown = createDraftSchema.safeParse({ kind: 'GENERAL', toEmail: 'a@example.com', status: 'SENT' });
    assert.equal(unknown.success, false, 'unknown fields are rejected');
  });

  test('upload-url accepts only PDFs from 1 byte to 15 MB', () => {
    const valid = { filename: 'Audit.pdf', size: 1, contentType: 'application/pdf' };
    assert.equal(uploadUrlRequestSchema.safeParse(valid).success, true);
    assert.equal(uploadUrlRequestSchema.safeParse({ ...valid, size: 15 * 1024 * 1024 + 1 }).success, false);
    assert.equal(uploadUrlRequestSchema.safeParse({ ...valid, size: 0 }).success, false);
    assert.equal(uploadUrlRequestSchema.safeParse({ ...valid, filename: 'a.exe' }).success, false);
    assert.equal(uploadUrlRequestSchema.safeParse({ ...valid, contentType: 'text/html' }).success, false);
  });
});

describe('composer schema rules (Stage 5)', () => {
  test('preview accepts a saved attachment without a path; create still requires it', () => {
    const attachment = { name: 'audit.pdf', size: 1000 };
    assert.equal(previewDraftSchema.safeParse({ kind: 'AUDIT', attachment }).success, true);
    assert.equal(createDraftSchema.safeParse({ kind: 'AUDIT', toEmail: 'a@example.com', attachment }).success, false);
    const badPath = previewDraftSchema.safeParse({ kind: 'AUDIT', attachment: { ...attachment, storagePath: '../secret.pdf' } });
    assert.equal(badPath.success, false);
  });

  test('editor links: https and mailto only', () => {
    assert.ok(SAFE_LINK_PATTERN.test('https://bretosolution.com/audit'));
    assert.ok(SAFE_LINK_PATTERN.test('mailto:hello@bretosolution.com'));
    for (const bad of ['http://example.com', 'javascript:alert(1)', 'https://a b', '/relative', 'data:text/html,x']) {
      assert.equal(SAFE_LINK_PATTERN.test(bad), false, bad);
    }
  });
});
