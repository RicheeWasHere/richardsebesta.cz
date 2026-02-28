import { Dictionary } from '@/dictionaries/en';

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-4 pt-12 md:pt-20">
      <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-100">
        Richard <span className="text-orange-500">Šebesta</span>
      </h1>
      <h2 className="text-lg md:text-xl text-zinc-500 font-light">
        {dict.hero.role}
      </h2>
      <p className="max-w-xl text-base text-zinc-400 font-light mt-4">
        {dict.hero.bio}
      </p>
    </section>
  );
}
