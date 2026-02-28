import Link from 'next/link';
import { Dictionary } from '@/dictionaries/en';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Header({ dict, locale }: { dict: Dictionary; locale: string }) {
  const switchTarget = locale === 'cs' ? 'en' : 'cs';
  
  return (
    <header className="flex items-center justify-between py-6">
      <div className="text-xl font-bold tracking-tight text-white/90">
        RŠ.
      </div>
      <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
        <Link href={`/${switchTarget}`} className="hover:text-white transition-colors">
          {dict.nav.langSwitch}
        </Link>
        <Link href="https://github.com/RicheeWasHere" target="_blank" className="hover:text-white transition-colors">
          <Github className="w-5 h-5" />
        </Link>
        <Link href="https://www.linkedin.com/in/richard-%C5%A1ebesta-24b5572b0/" target="_blank" className="hover:text-white transition-colors">
          <Linkedin className="w-5 h-5" />
        </Link>
      </nav>
    </header>
  );
}
