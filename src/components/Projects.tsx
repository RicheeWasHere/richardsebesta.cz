import { Dictionary } from '@/dictionaries/en';
import Image from 'next/image';

export function Projects({ dict }: { dict: Dictionary }) {
  const items = dict.projects.items;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
        {dict.projects.title}
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        {items.map((item: any, i: number) => {
          const content = (
            <>
              <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                <Image 
                  src="/spartansApp.png" 
                  alt={item.name} 
                  fill 
                  className="object-cover grayscale blur-[1px] group-hover:grayscale-0 group-hover:blur-none group-hover:scale-105 transition-all duration-[1500ms] ease-out"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium text-zinc-200 group-hover:text-orange-400 transition-colors">{item.name}</h3>
                
                {(item.org || item.role) && (
                  <p className="text-sm text-zinc-400 mt-1">
                    {item.role && <span className="text-zinc-300">{item.role} @ </span>}
                    {item.org}
                  </p>
                )}
                
                {item.desc && <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>}
              </div>
            </>
          );

          return item.link ? (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" className="flex flex-col gap-3 group outline-none">
              {content}
            </a>
          ) : (
            <div key={i} className="flex flex-col gap-3 group">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
