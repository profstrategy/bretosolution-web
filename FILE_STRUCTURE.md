# Current File Structure

This tree lists the current project files. Generated `.git`, `node_modules`, and `.next` contents are excluded.

```text
.
├── .env.example
├── .gitignore
├── MIGRATION_LOG.md
├── MIGRATION_PLAN.md
├── next.config.ts
├── next-env.d.ts
├── package-lock.json
├── package.json
├── PORTING.md
├── postcss.config.mjs
├── tsconfig.json
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
    ├── app
    │   ├── audit
    │   │   └── page.tsx
    │   ├── book-call
    │   │   └── page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── pricing
    │   │   └── page.tsx
    │   └── solutions
    │       └── page.tsx
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
    ├── lib
    │   ├── api
    │   │   ├── audit.ts
    │   │   └── quote.ts
    │   ├── theme.ts
    │   └── utils.ts
    ├── schemas
    │   ├── audit.ts
    │   └── quote.ts
    ├── styles
    │   └── globals.css
    └── views
        ├── AuditView.tsx
        ├── BookCallView.tsx
        ├── HomeView.tsx
        ├── PricingView.tsx
        └── SolutionsView.tsx
```
