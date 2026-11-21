import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Satisfy,
} from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { JsonLd } from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { seoContent } from '@/content/seo';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(seoContent.siteUrl),
  title: {
    default: `${seoContent.pages.home.title} | Bretosolution`,
    template: '%s | Bretosolution',
  },
  icons: {
    icon: [
      { url: seoContent.logoPath, type: 'image/png' },
    ],
    apple: [
      { url: seoContent.appleTouchIconPath, type: 'image/png' },
    ]
  },
  applicationName: seoContent.siteName,
  openGraph: {
    title: seoContent.pages.home.title,
    description: seoContent.pages.home.description,
    url: seoContent.siteUrl,
    type: 'website',
    siteName: seoContent.siteName,
    images: [ { url: seoContent.openGraphImagePath } ],
    locale: 'en',
  },
  twitter: {
    card: 'summary',
    title: seoContent.pages.home.title,
    description: seoContent.pages.home.description,
    images: [ seoContent.openGraphImagePath ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: { 
      index: true,
      follow: true,
    }
  },
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter-next',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono-next',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair-display-next',
});

const satisfy = Satisfy({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-satisfy-next',
});

const themeInitializationScript = `
(function () {
  var mode = null;
  try {
    var stored = window.localStorage.getItem('breto-theme');
    if (stored === 'dark' || stored === 'light') mode = stored;
  } catch (e) {}

  if (!mode) {
    try {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (e) {
      mode = 'light';
    }
  }

  try {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${seoContent.siteUrl}/#organization`,
      name: seoContent.siteName,
      url: seoContent.siteUrl,
      logo: new URL(seoContent.logoPath, seoContent.siteUrl).toString(),
      description: seoContent.pages.home.description,
      email: 'hello@bretosolution.com',
    },
    {
      '@type': 'WebSite',
      '@id': `${seoContent.siteUrl}/#website`,
      url: seoContent.siteUrl,
      name: seoContent.siteName,
      publisher: {
        '@id': `${seoContent.siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetBrainsMono.variable} ${playfairDisplay.variable} ${satisfy.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </head>
      <body>
        <JsonLd data={siteStructuredData} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-[10px] focus:bg-[var(--btn)] focus:px-4 focus:py-2.5 focus:font-[family-name:var(--font-sans)] focus:text-[14px] focus:font-semibold focus:text-[var(--btnfg)] focus:shadow-lg"
        >
          {site.header.skipToContentLabel}
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
