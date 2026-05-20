import Header from '@/components/Header';
import HomeClient from './HomeClient';
import { getFolders } from '@/lib/drive';

export const revalidate = 60; // revalidate every minute

export default async function Home() {
  const folders = await getFolders();

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-neutral-200 font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      <Header />
      <HomeClient folders={folders} />
    </main>
  );
}
