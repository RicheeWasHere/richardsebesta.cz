import { Dictionary } from '@/dictionaries/en';

export function Timeline({ dict }: { dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-12 border-t border-zinc-900 pt-16">
      <div className="flex flex-col gap-6">
        <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
          {dict.experience.title}
        </h2>
        <div className="flex flex-col gap-8">
          {dict.experience.jobs.map((job, i) => {
            const content = (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1 md:gap-4">
                  <h3 className="text-base font-medium text-zinc-200 group-hover:text-orange-400 transition-colors">{job.role} <span className="text-zinc-500">@ {job.company}</span></h3>
                  <span className="text-sm text-zinc-500 md:text-right shrink-0">{job.period}</span>
                </div>
                {job.desc && <p className="text-sm text-zinc-400 mt-1">{job.desc}</p>}
              </>
            );

            return job.link ? (
              <a key={i} href={job.link} target="_blank" rel="noreferrer" className="flex flex-col gap-1 group outline-none block">
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

      <div className="flex flex-col gap-6">
        <h2 className="text-sm tracking-widest uppercase text-zinc-500 font-medium">
          {dict.education.title}
        </h2>
        <div className="flex flex-col gap-8">
          {dict.education.schools.map((school, i) => {
            const content = (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1 md:gap-4">
                  <h3 className="text-base font-medium text-zinc-200 group-hover:text-orange-400 transition-colors">{school.field}</h3>
                  <span className="text-sm text-zinc-500 md:text-right shrink-0">{school.period}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{school.name}</p>
              </>
            );

            return school.link ? (
              <a key={i} href={school.link} target="_blank" rel="noreferrer" className="flex flex-col gap-1 group outline-none block">
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
    </section>
  );
}
