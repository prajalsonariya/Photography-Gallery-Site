export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-32 pb-24">
        <div className="mb-16 max-w-2xl">
          <div className="h-8 sm:h-12 w-64 bg-neutral-900 animate-pulse rounded-sm mb-4"></div>
          <div className="h-4 w-full sm:w-96 bg-neutral-900 animate-pulse rounded-sm"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square sm:aspect-[4/3] bg-neutral-900 animate-pulse rounded-sm"></div>
          ))}
        </div>
      </div>
    </main>
  );
}
