import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1e1e1e]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        <div className="flex-1"></div>
        <Link href="/" className="flex items-center justify-center group absolute left-1/2 -translate-x-1/2">
          <span className="text-sm tracking-[0.3em] font-light uppercase text-white hover:text-neutral-300 transition-colors">Prajal Sonariya</span>
        </Link>
        <div className="flex-1 flex items-center justify-end gap-6 sm:gap-8">
          <a href="mailto:prajalsonariya2312hp@gmail.com" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </a>
          <a href="https://www.instagram.com/prajal_sonariya/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </div>
      </div>
    </header>
  );
}
