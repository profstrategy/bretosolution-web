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
} as const satisfies Record<string, BrandAsset>;

export const allBrandAssetList: BrandAsset[] = [
  assets.bretoLogo,
  assets.sketchArrow,
  assets.claude,
  assets.chatgpt,
  assets.gemini,
  assets.perplexity,
];

export const platformLogos: BrandAsset[] = [
  assets.claude,
  assets.chatgpt,
  assets.gemini,
  assets.perplexity,
];
