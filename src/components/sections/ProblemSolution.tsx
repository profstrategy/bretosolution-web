import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { assets, platformLogos } from '@/content/assets';
import { homeContent } from '@/content/home';

export function ProblemSolution() {
  const { problemSolution } = homeContent;

  return (
    <Section tone="alt" id="problem">
      <Container>
        {/* Heading block */}
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-[family-name:var(--font-display)] font-semibold text-[clamp(32px,4vw,56px)] leading-[1.12] [text-wrap:balance] text-[var(--ink)]">
            <span>{problemSolution.heading}</span>
            <span className="mt-1 block font-[family-name:var(--font-script)] font-normal text-[var(--accent)] text-[clamp(34px,4.4vw,62px)] leading-[1.15]">
              {problemSolution.headingScript}
            </span>
          </h2>
          <p className="mx-auto mt-[24px] max-w-[58ch] text-center font-[family-name:var(--font-sans)] text-[18px] text-[var(--muted)]">
            {problemSolution.description}
          </p>
        </div>

        {/* Visual comparison */}
        <div className="mt-[72px] flex flex-wrap lg:flex-nowrap items-center justify-center gap-y-10 gap-x-6">
          {/* LEFT column (the problem) */}
          <div className="flex w-full max-w-[520px] flex-col items-center">
            <p className="mb-3 w-full text-left font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">
              {problemSolution.left.label}
            </p>

            {/* Mini card tilted -2deg */}
            <div className="w-full max-w-[340px] -rotate-[2deg] rounded-[12px] border border-[var(--line)] bg-[var(--panel)] py-[16px] px-[22px] text-center shadow-[0_10px_28px_var(--shadow)]">
              <div className="font-[family-name:var(--font-display)] text-[34px] font-semibold leading-tight text-[var(--ink)]">
                {problemSolution.left.followersCount}
              </div>
              <div className="mt-1 font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">
                {problemSolution.left.followersSubtext}
              </div>
            </div>

            {/* First hand-drawn arrow */}
            <img
              src={assets.sketchArrow.src}
              alt={assets.sketchArrow.alt}
              width={64}
              height={64}
              className="my-3 h-[64px] w-[64px] object-contain [html.dark_&]:invert"
            />

            {/* Numbered card tilted +1deg */}
            <div className="w-full rotate-[1deg] divide-y divide-[var(--line)] rounded-[14px] border border-[var(--line)] bg-[var(--panel)] py-[6px] px-[22px] shadow-[0_10px_28px_var(--shadow)]">
              {/* Row 01 */}
              <div className="flex items-center gap-4 py-3.5">
                <span className="shrink-0 font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--accent)]">
                  {problemSolution.left.row1.number}
                </span>
                <div className="space-y-2.5">
                  <div className="font-[family-name:var(--font-sans)] text-[15px] font-medium text-[var(--ink)]">
                    {problemSolution.left.row1.label}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {platformLogos.map((logo) => (
                      <div
                        key={logo.src}
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--tile-white)] p-[6px]"
                      >
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          width={40}
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rows 02 and 03 */}
              {problemSolution.left.otherRows.map((row) => (
                <div key={row.number} className="flex items-center gap-4 py-3.5">
                  <span className="shrink-0 font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--accent)]">
                    {row.number}
                  </span>
                  <span className="font-[family-name:var(--font-sans)] text-[15px] font-medium text-[var(--ink)]">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Second hand-drawn arrow */}
            <img
              src={assets.sketchArrow.src}
              alt={assets.sketchArrow.alt}
              width={64}
              height={64}
              className="my-3 h-[64px] w-[64px] object-contain [html.dark_&]:invert"
            />

            {/* Dashed result box */}
            <div className="rounded-[12px] border-[1.5px] border-dashed border-[var(--muted)] py-[14px] px-[24px] text-center">
              <span className="font-[family-name:var(--font-display)] text-[26px] font-semibold text-[var(--ink)]">
                {problemSolution.left.resultNumber}
              </span>
              <span className="font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
                {problemSolution.left.resultSuffix}
              </span>
            </div>
          </div>

          {/* Middle right-pointing arrow */}
          <div className="flex w-full lg:w-auto shrink-0 items-center justify-center py-2">
            <svg
              width="56"
              height="24"
              viewBox="0 0 56 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="text-[var(--accent)]"
            >
              <path
                d="M4 12H50M50 12L42 5M50 12L42 19"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* RIGHT column (the solution) */}
          <div className="flex w-full max-w-[520px] flex-col items-center">
            <p className="mb-3 w-full text-left font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--accent)]">
              {problemSolution.right.label}
            </p>

            {/* Large rounded card */}
            <div className="w-full divide-y divide-[var(--line)] rounded-[20px] border border-[var(--line)] bg-[linear-gradient(135deg,var(--panel),var(--bg))] py-[12px] px-[28px]">
              {problemSolution.right.rows.map((row) => (
                <div key={row.number} className="flex items-center gap-4 py-4">
                  <span className="shrink-0 font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--accent)]">
                    {row.number}
                  </span>
                  <span className="font-[family-name:var(--font-sans)] text-[17px] font-medium text-[var(--ink)]">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Short down arrow */}
            <div className="my-3 flex items-center justify-center">
              <svg
                width="24"
                height="36"
                viewBox="0 0 24 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="text-[var(--accent)]"
              >
                <path
                  d="M12 4V31M12 31L6 24M12 31L18 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Solid result box */}
            <div className="w-full rounded-[12px] bg-[var(--btn)] py-[14px] px-[24px] text-center text-[var(--btnfg)]">
              <span className="font-[family-name:var(--font-display)] text-[26px] font-semibold">
                {problemSolution.right.resultNumber}
              </span>
              <span className="font-[family-name:var(--font-sans)] text-[15px]">
                {problemSolution.right.resultSuffix}
              </span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="mx-auto mt-[48px] max-w-[70ch] text-center font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
          {problemSolution.footnote}
        </p>
      </Container>
    </Section>
  );
}
