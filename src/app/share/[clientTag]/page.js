import Header from '@/components/Header';
import { getFolderImages, getPrivateFolders } from '@/lib/drive';
import GalleryClient from '@/app/gallery/[id]/GalleryClient';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Dynamic route

export async function generateMetadata({ params }) {
  const { clientTag } = await params;
  const privateFolders = await getPrivateFolders();
  const folder = privateFolders.find(f => f.id === clientTag);
  
  return {
    title: folder ? `${folder.name} | Client Gallery` : 'Client Gallery | Prajal Sonariya',
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function SharePage({ params }) {
  const { clientTag } = await params;
  
  // Verify this folder is part of the private root to prevent ID traversal
  const privateFolders = await getPrivateFolders();
  const folder = privateFolders.find(f => f.id === clientTag);
  
  if (!folder) {
    notFound();
  }

  // Fetch images and subfolders securely
  const { images, subfolders } = await getFolderImages(clientTag);

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-neutral-200 font-sans selection:bg-white/20 selection:text-white">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-24 min-h-screen">
        <div className="mb-8 flex flex-col items-start gap-4">
          <div className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-semibold tracking-widest uppercase">
            Private Client Gallery
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-[0.2em] uppercase">
            {folder.name}
          </h1>
        </div>
        <GalleryClient initialImages={images} initialSubfolders={subfolders} basePath="/share" />
      </div>
    </main>
  );
}
