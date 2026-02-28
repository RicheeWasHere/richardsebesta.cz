import { Dictionary } from '@/dictionaries/en';

export function Skills({ dict }: { dict: Dictionary }) {
  const skills = [
    { label: dict.skills.js, rating: 4 },
    { label: 'HTML & CSS', rating: 4 },
    { label: dict.skills.frontend, rating: 4 },
    { label: dict.skills.backend, rating: 3 },
    { label: dict.skills.linux, rating: 2 },
    { label: dict.skills.sql, rating: 2 },
  ];

  const Dot = ({ filled }: { filled: boolean }) => (
    <div className={`w-2.5 h-2.5 rounded-full ${filled ? 'bg-orange-500' : 'bg-zinc-800'}`} />
  );

  return (
    <section className="flex flex-col gap-6 border-t border-zinc-900 pt-16">
      <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
        {dict.skills.title}
      </h2>
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {skills.map((skill, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-zinc-200">{skill.label}</span>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, index) => (
                <Dot key={index} filled={index < skill.rating} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
