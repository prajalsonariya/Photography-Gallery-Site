import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-24 min-h-screen">
        <div className="mb-8 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-neutral-700 text-[10px] sm:text-xs uppercase tracking-[0.3em]">
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </div>
          <div className="h-8 sm:h-10 w-48 sm:w-64 bg-neutral-900 animate-pulse rounded-sm"></div>
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between py-4 border-y border-white/10 bg-neutral-950/80 -mx-4 px-4 sm:mx-0 sm:px-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 bg-neutral-900 animate-pulse rounded-sm"></div>
              <div className="h-8 w-32 bg-neutral-900 animate-pulse rounded-sm"></div>
            </div>
            <div className="h-8 w-24 bg-neutral-900 animate-pulse rounded-sm"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 after:content-[''] after:flex-grow-[10]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
              const width = 150 + (i % 3) * 50; // Mix of widths for masonry feel
              return (
                <div 
                  key={i} 
                  className="bg-neutral-900 animate-pulse flex-grow h-[100px] sm:h-[130px] md:h-[180px]" 
                  style={{ flexGrow: width / 150, width: `${width}px` }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
