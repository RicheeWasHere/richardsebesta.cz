import { Dictionary } from '@/dictionaries/en';

export function Extracurriculars({ dict }: { dict: Dictionary }) {
  const sections = [
    {
      title: dict.competitions.title,
      items: dict.competitions.items
    },
    {
      title: dict.volunteering.title,
      items: dict.volunteering.items
    }
  ];

  return (
    <section className="flex flex-col gap-12 border-t border-zinc-900 pt-16">
      {sections.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-6">
          <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
            {section.title}
          </h2>
          <div className="flex flex-col gap-8">
            {section.items.map((item: any, i: number) => {
              const content = (
                <>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1 md:gap-4">
                    <h3 className="text-base font-medium text-zinc-200 group-hover:text-orange-400 transition-colors">{item.name}</h3>
                    {(item.date || item.period) && (
                      <span className="text-sm text-zinc-500 md:text-right shrink-0">{item.date || item.period}</span>
                    )}
                  </div>
                  
                  {(item.org || item.role) && (
                    <p className="text-sm text-zinc-400 mt-1">
                      {item.role && <span className="text-zinc-300">{item.role} @ </span>}
                      {item.org}
                    </p>
                  )}
                  {item.desc && <p className="text-sm text-zinc-500 mt-2">{item.desc}</p>}
                </>
              );

              return item.link ? (
                <a key={i} href={item.link} target="_blank" rel="noreferrer" className="flex flex-col gap-1 group outline-none block">
                  {content}
                </a>
              ) : (
                <div key={i} className="flex flex-col gap-1 group">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
