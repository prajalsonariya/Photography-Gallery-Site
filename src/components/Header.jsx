import Link from 'next/link';
import { Camera, Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Camera className="w-5 h-5 text-white group-hover:text-neutral-400 transition-colors" />
          <span className="text-sm tracking-[0.3em] font-light uppercase text-white">Prajal Sonariya</span>
        </Link>
        <div className="flex items-center gap-8">
          <a href="mailto:contact@example.com" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </div>
      </div>
    </header>
  );
}
