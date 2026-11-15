import { Hero } from '@/components/sections/Hero';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { Principles } from '@/components/sections/Principles';
import { Services } from '@/components/sections/Services';
import { AuditProcess } from '@/components/sections/AuditProcess';
import { Restaurants } from '@/components/sections/Restaurants';
import { Offers } from '@/components/sections/Offers';
import { Proof } from '@/components/sections/Proof';
import { HomeClosingCta } from '@/components/sections/HomeClosingCta';

export function Home() {
  return (
    <main>
      <Hero />
      <ProblemSolution />
      <Principles />
      <Services />
      <AuditProcess />
      <Restaurants />
      <Offers />
      <Proof />
      <HomeClosingCta />
    </main>
  );
}
