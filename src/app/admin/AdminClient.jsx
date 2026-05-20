'use client';

import { useState } from 'react';
import { Copy, Check, Folder } from 'lucide-react';

export default function AdminClient({ folders }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (folderId) => {
    const url = `${window.location.origin}/share/${folderId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(folderId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Failed to copy link.');
    }
  };

  if (folders.length === 0) {
    return (
      <div className="p-8 border border-white/10 rounded-sm bg-neutral-900/30 text-center text-neutral-500">
        No private folders found. Ensure your private root ID is correct.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {folders.map(folder => (
        <div key={folder.id} className="flex items-center justify-between p-4 border border-white/10 bg-black/20 rounded-sm hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full">
              <Folder className="w-5 h-5 text-neutral-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold tracking-wide">{folder.name}</span>
              <span className="text-neutral-500 text-xs mt-1">
                Created: {new Date(folder.createdTime).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button 
            onClick={() => handleCopy(folder.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors rounded-sm text-xs uppercase tracking-wider font-semibold"
          >
            {copiedId === folder.id ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
