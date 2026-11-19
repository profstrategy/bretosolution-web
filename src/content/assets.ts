export interface BrandAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const assets = {
  bretoLogo: {
    src: '/brand/breto-logo.webp',
    alt: 'Breto logo',
    width: 120,
    height: 120,
  },
  sketchArrow: {
    src: '/brand/sketch-arrow.webp',
    alt: '',
    width: 96,
    height: 96,
  },
  claude: {
    src: '/brand/logo-claude.webp',
    alt: 'Claude',
    width: 44,
    height: 44,
  },
  chatgpt: {
    src: '/brand/logo-chatgpt.webp',
    alt: 'ChatGPT',
    width: 44,
    height: 44,
  },
  gemini: {
    src: '/brand/logo-gemini.webp',
    alt: 'Gemini',
    width: 44,
    height: 44,
  },
  perplexity: {
    src: '/brand/logo-perplexity.webp',
    alt: 'Perplexity',
    width: 44,
    height: 44,
  },
  servicesDashboard: {
    src: '/assets/aistudio/dashboard.webp',
    alt: 'Example restaurant admin dashboard with orders, pending payments, revenue and a sales trend chart',
    width: 1343,
    height: 585,
  },
  servicesMap: {
    src: '/assets/aistudio/google-map.webp',
    alt: 'Local restaurant listings beside a map',
    width: 1359,
    height: 637,
  },
} as const satisfies Record<string, BrandAsset>;

export const platformLogos: BrandAsset[] = [
  assets.claude,
  assets.chatgpt,
  assets.gemini,
  assets.perplexity,
];
