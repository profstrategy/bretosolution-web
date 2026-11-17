# Current File Structure

This tree lists the project files currently present in the repository. Generated `.git` and `node_modules` contents are excluded. The two tracked image files currently deleted from `public/assets/aistudio/` are not shown.

```text
.
├── .env.example
├── .gitignore
├── bun.lock
├── index.html
├── metadata.json
├── package.json
├── PORTING.md
├── postcss.config.mjs
├── tsconfig.json
├── vite.config.ts
├── public
│   ├── assets
│   │   └── aistudio
│   │       ├── dashboard.webp
│   │       └── google-map.webp
│   └── brand
│       ├── breto-logo.webp
│       ├── logo-chatgpt.webp
│       ├── logo-claude.webp
│       ├── logo-gemini.webp
│       ├── logo-perplexity.webp
│       └── sketch-arrow.webp
└── src
    ├── App.tsx
    ├── main.tsx
    ├── components
    │   ├── booking
    │   │   └── CalendlyEmbed.tsx
    │   ├── forms
    │   │   ├── AuditRequestForm.tsx
    │   │   ├── FormField.tsx
    │   │   └── QuoteRequestForm.tsx
    │   ├── layout
    │   │   ├── Footer.tsx
    │   │   └── Header.tsx
    │   ├── sections
    │   │   ├── AuditProcess.tsx
    │   │   ├── Hero.tsx
    │   │   ├── HomeClosingCta.tsx
    │   │   ├── Offers.tsx
    │   │   ├── Principles.tsx
    │   │   ├── ProblemSolution.tsx
    │   │   ├── Proof.tsx
    │   │   ├── Restaurants.tsx
    │   │   ├── Services.tsx
    │   │   ├── audit
    │   │   │   └── AuditPageSection.tsx
    │   │   ├── booking
    │   │   │   └── BookCallSection.tsx
    │   │   ├── pricing
    │   │   │   ├── PaymentWorksSection.tsx
    │   │   │   ├── PricingClosingCta.tsx
    │   │   │   ├── PricingGuidanceSection.tsx
    │   │   │   ├── RequestQuoteSection.tsx
    │   │   │   ├── SignedScopeSection.tsx
    │   │   │   └── StraightAnswersSection.tsx
    │   │   └── solutions
    │   │       ├── AcceptanceCriteriaSection.tsx
    │   │       ├── AiSearchVisibilitySection.tsx
    │   │       ├── OngoingGrowthSection.tsx
    │   │       ├── SolutionsClosingCta.tsx
    │   │       ├── SolutionsHero.tsx
    │   │       └── WebsiteDevelopmentSection.tsx
    │   └── ui
    │       ├── AppLink.tsx
    │       ├── Button.tsx
    │       ├── Container.tsx
    │       ├── Eyebrow.tsx
    │       ├── Section.tsx
    │       └── SectionHeading.tsx
    ├── content
    │   ├── assets.ts
    │   ├── audit.ts
    │   ├── bookCall.ts
    │   ├── home.ts
    │   ├── pricing.ts
    │   ├── site.ts
    │   └── solutions.ts
    ├── hooks
    │   └── use-mobile.ts
    ├── lib
    │   ├── api
    │   │   ├── audit.ts
    │   │   └── quote.ts
    │   ├── theme.ts
    │   └── utils.ts
    ├── pages
    │   ├── Audit.tsx
    │   ├── BookCall.tsx
    │   ├── Home.tsx
    │   ├── Pricing.tsx
    │   └── Solutions.tsx
    ├── schemas
    │   ├── audit.ts
    │   └── quote.ts
    └── styles
        └── globals.css
```
