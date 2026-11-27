// Business facts used in every reply. Read from the site's single source of
// truth so emails and the website never disagree.
import { site } from '@/content/site';
import { seoContent } from '@/content/seo';

export const emailBrand = {
  name: site.name,
  siteUrl: seoContent.siteUrl,
  contactEmail: site.contactEmail,
  addressLines: site.postalAddress,
  logoUrl: `${seoContent.siteUrl}/brand/breto-logo-email.png`,
} as const;
