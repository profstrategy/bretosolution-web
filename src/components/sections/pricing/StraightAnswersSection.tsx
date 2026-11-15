import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent } from '@/content/pricing';
import { cn } from '@/lib/utils';

export function StraightAnswersSection() {
  const { straightAnswers } = pricingContent;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <Section tone="alt" id="straight-answers">
      <div className="flex flex-wrap items-start gap-x-[72px] gap-y-[40px]">
        {/* Left column (sticky on desktop) */}
        <div className="min-w-0 flex-[1_1_320px] lg:sticky lg:top-[120px]">
          <Eyebrow className="mb-3">{straightAnswers.eyebrow}</Eyebrow>
          <SectionHeading className="max-w-[16ch]">
            {straightAnswers.heading}
          </SectionHeading>
        </div>

        {/* Right column: accessible accordion */}
        <div className="min-w-0 flex-[2_1_560px] border-t border-[var(--ink)]">
          {straightAnswers.rows.map((row, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-question-${index}`;
            const panelId = `faq-answer-${index}`;

            return (
              <div
                key={row.question}
                className="border-b border-[var(--line)] py-[24px]"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggle(index)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-6 text-left transition-colors hover:text-[var(--accent)]"
                  >
                    <span className="font-[family-name:var(--font-display)] text-[21px] font-semibold leading-[1.3] text-[var(--ink)]">
                      {row.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ink)]"
                    >
                      {isOpen ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-250 ease-out motion-reduce:transition-none',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3.5 pr-8 font-[family-name:var(--font-sans)] text-[16px] leading-[1.65] text-[var(--muted)]">
                      {row.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
