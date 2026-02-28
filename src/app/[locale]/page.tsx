import { getDictionary } from '@/dictionaries';
import { Hero } from '@/components/Hero';
import { Skills } from '@/components/Skills';
import { Timeline } from '@/components/Timeline';
import { Projects } from '@/components/Projects';
import { Extracurriculars } from '@/components/Extracurriculars';
import { Contact } from '@/components/Contact';
import { Header } from '@/components/Header';
import { GaussianMatrix } from '@/components/GaussianMatrix';
import { BinaryRelation } from '@/components/BinaryRelation';

export default async function Home({ params }: { params: Promise<{ locale: 'cs' | 'en' }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <main className="flex flex-col gap-16 pb-20">
      <GaussianMatrix />
      <BinaryRelation />
      <Header dict={dict} locale={locale} />
      <Hero dict={dict} />
      <Projects dict={dict} />
      <Skills dict={dict} />
      <Timeline dict={dict} />
      <Extracurriculars dict={dict} />
      <Contact dict={dict} />
    </main>
  );
}
