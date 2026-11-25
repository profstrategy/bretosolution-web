// Bretosolution brand tokens for email (light theme, from the website design).
// Emails cannot use CSS variables, so these are plain hex values.
export const emailTokens = {
  bg: '#F5F2EB', // page background (cream)
  card: '#FFFFFF', // message card
  panel: '#F5F2EB', // inner callout background
  ink: '#1A1714', // main text
  muted: '#5C564D', // secondary text
  line: '#DDD6C8', // borders
  accent: '#B8400F', // burnt orange (contrast on white 5.5:1)
  accentInk: '#FFFFFF',
  fontHeading: "Georgia, 'Times New Roman', serif",
  fontBody: "Arial, Helvetica, sans-serif",
} as const;
