import Header from '@/components/Header';
import FolderCard from '@/components/FolderCard';
import { getFolders } from '@/lib/drive';

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const folders = await getFolders();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-white/20 selection:text-white">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-24 min-h-screen flex flex-col">
        <div className="mb-16 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 sm:mb-6 tracking-tight leading-tight">
            Cinematic moments frozen in time.
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light tracking-wide">
            A curated selection of visual storytelling. Select a gallery below to explore.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {folders.map(folder => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      </div>
    </main>
  );
}
