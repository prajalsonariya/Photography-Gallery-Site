import { google } from 'googleapis';
import { cache } from 'react';

function getMockFolders() {
  return [
    {
      id: 'mock-folder-1',
      name: 'May 10 Beach',
      thumbnailUrl: 'https://picsum.photos/seed/beach/1000/1000'
    },
    {
      id: 'mock-folder-2',
      name: 'Film BTS',
      thumbnailUrl: 'https://picsum.photos/seed/film/1000/1000'
    },
    {
      id: 'mock-folder-3',
      name: 'Urban Exploration',
      thumbnailUrl: 'https://picsum.photos/seed/urban/1000/1000'
    }
  ];
}

function getMockImages(folderId) {
  const seed = folderId === 'mock-folder-1' ? 'beach' : (folderId === 'mock-folder-2' ? 'film' : 'urban');
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `mock-img-${folderId}-${i}`,
    name: `${seed} ${i + 1}`,
    mimeType: 'image/jpeg',
    description: `A stunning shot from the ${seed} collection.`,
    imageMediaMetadata: {
      time: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      cameraMake: 'Sony',
      cameraModel: 'A7R IV',
      focalLength: 35 + (i * 5),
      aperture: 1.4 + (i % 3),
      isoSpeed: 100 * (i % 4 + 1),
      exposureTime: 0.005 + (i * 0.001),
      width: 1200 + (i % 2) * 400,
      height: 800 + (i % 3) * 200,
    },
    url: `https://picsum.photos/seed/${seed}${i}/1200/800`,
    cdnUrl: `https://picsum.photos/seed/${seed}${i}/800/600`,
    rawFileId: i % 3 === 0 ? `mock-raw-${folderId}-${i}` : null,
  }));
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

function hasValidCredentials() {
  const pk = process.env.GOOGLE_PRIVATE_KEY;
  return process.env.GOOGLE_CLIENT_EMAIL && pk && pk.includes('-----BEGIN PRIVATE KEY-----') && !pk.includes('YOUR_PRIVATE_KEY_HERE');
}

function cdnProxy(baseCdnUrl, size) {
  const cdnUrl = `${baseCdnUrl}=${size}`;
  return `/api/thumbnail?url=${encodeURIComponent(cdnUrl)}`;
}

async function fetchFoldersWithThumbnails(drive, rootFolderId) {
  const foldersRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
  });

  const folders = [];

  for (const folder of (foldersRes.data.files || [])) {
    let targetImage = null;

    // First, search specifically for a file named "cover"
    const coverRes = await drive.files.list({
      q: `'${folder.id}' in parents and name contains 'cover' and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, thumbnailLink)',
      pageSize: 1,
    });
    
    if (coverRes.data.files && coverRes.data.files.length > 0) {
      targetImage = coverRes.data.files[0];
    }

    // If no cover found, use the first image
    if (!targetImage) {
      const imagesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
        fields: 'files(id, name, thumbnailLink)',
        orderBy: 'name',
        pageSize: 1, 
      });
      if (imagesRes.data.files && imagesRes.data.files.length > 0) {
        targetImage = imagesRes.data.files[0];
      }
    }

    // If still nothing, check subfolders
    if (!targetImage) {
      const subRes = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)',
        pageSize: 1,
      });
      if (subRes.data.files && subRes.data.files.length > 0) {
        // Check subfolder for cover image first
        const subCoverRes = await drive.files.list({
          q: `'${subRes.data.files[0].id}' in parents and name contains 'cover' and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
          fields: 'files(id, name, thumbnailLink)',
          pageSize: 1,
        });
        if (subCoverRes.data.files && subCoverRes.data.files.length > 0) {
          targetImage = subCoverRes.data.files[0];
        } else {
          const subImagesRes = await drive.files.list({
            q: `'${subRes.data.files[0].id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
            fields: 'files(id, name, thumbnailLink)',
            orderBy: 'name',
            pageSize: 1,
          });
          if (subImagesRes.data.files && subImagesRes.data.files.length > 0) {
            targetImage = subImagesRes.data.files[0];
          }
        }
      }
    }
    
    let thumbnailUrl = null;
    let baseCdnUrl = null;
    let fallbackUrl = null;

    if (targetImage) {
      fallbackUrl = `/api/image/${targetImage.id}`;
      baseCdnUrl = targetImage.thumbnailLink ? targetImage.thumbnailLink.replace(/=[^=]*$/, '') : null;
      thumbnailUrl = baseCdnUrl ? cdnProxy(baseCdnUrl, 's200-rw') : fallbackUrl;
    }

    folders.push({
      id: folder.id,
      name: folder.name,
      createdTime: folder.createdTime,
      thumbnailUrl,
      baseCdnUrl,
      fallbackUrl
    });
  }

  return folders;
}

export const getFolders = cache(async () => {
  if (!hasValidCredentials()) {
    return getMockFolders();
  }

  const drive = google.drive({ version: 'v3', auth: getAuth() });
  const rootFolderId = process.env.GOOGLE_DRIVE_PUBLIC_ROOT_ID;

  // Check if root folder has direct images
  const rootImagesRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id, name, thumbnailLink)',
    orderBy: 'createdTime desc',
    pageSize: 20, // get a few to check for 'cover'
  });

  const folders = [];

  if (rootImagesRes.data.files && rootImagesRes.data.files.length > 0) {
    const coverImage = rootImagesRes.data.files.find(f => f.name.toLowerCase().includes('cover')) || rootImagesRes.data.files[0];
    let fallbackUrl = `/api/image/${coverImage.id}`;
    let baseCdnUrl = coverImage.thumbnailLink ? coverImage.thumbnailLink.replace(/=[^=]*$/, '') : null;
    
    folders.push({
      id: rootFolderId,
      name: 'Main Collection',
      thumbnailUrl: baseCdnUrl ? cdnProxy(baseCdnUrl, 's200-rw') : fallbackUrl,
      baseCdnUrl,
      fallbackUrl
    });
  }

  const subfolders = await fetchFoldersWithThumbnails(drive, rootFolderId);
  return [...folders, ...subfolders].sort((a, b) => a.name.localeCompare(b.name));
});

export const getPrivateFolders = cache(async () => {
  if (!hasValidCredentials()) {
    return [];
  }

  const drive = google.drive({ version: 'v3', auth: getAuth() });
  const rootFolderId = process.env.GOOGLE_DRIVE_PRIVATE_ROOT_ID;

  if (!rootFolderId || rootFolderId === 'your_private_folder_id_here') {
    return [];
  }

  try {
    return await fetchFoldersWithThumbnails(drive, rootFolderId);
  } catch (err) {
    console.error('Error fetching private folders:', err);
    return [];
  }
});

export const getFolderImages = cache(async (folderId) => {
  if (!hasValidCredentials()) {
    const images = getMockImages(folderId);
    return { images, subfolders: [] };
  }

  const drive = google.drive({ version: 'v3', auth: getAuth() });
  
  const filesRes = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, description, imageMediaMetadata, videoMediaMetadata, thumbnailLink)',
    orderBy: 'createdTime desc',
    pageSize: 1000,
  });

  const allFiles = filesRes.data.files || [];
  const grouped = {};
  const rawSubfolders = [];
  
  for (const file of allFiles) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      rawSubfolders.push(file);
      continue;
    }

    const parts = file.name.split('.');
    const baseName = parts.length > 1 ? parts.slice(0, -1).join('.') : file.name;
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    
    if (!grouped[baseName]) grouped[baseName] = { viewable: null, raw: null };
    
    if (['cr2', 'cr3', 'nef', 'arw', 'dng', 'raf'].includes(ext)) {
      grouped[baseName].raw = file;
    } else if (file.mimeType && (file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/'))) {
      grouped[baseName].viewable = file;
    }
  }

  const images = [];
  for (const baseName in grouped) {
    const { viewable, raw } = grouped[baseName];
    if (viewable) {
      const isVideo = viewable.mimeType.startsWith('video/');
      const baseCdnUrl = viewable.thumbnailLink ? viewable.thumbnailLink.replace(/=[^=]*$/, '') : null;
      const cdnUrl = baseCdnUrl ? cdnProxy(baseCdnUrl, 's400-rw') : `/api/image/${viewable.id}`;
      images.push({
        ...viewable,
        type: isVideo ? 'video' : 'image',
        url: `/api/image/${viewable.id}?mimeType=${encodeURIComponent(viewable.mimeType)}&filename=${encodeURIComponent(viewable.name)}`,
        cdnUrl,
        baseCdnUrl,
        rawFileId: raw ? raw.id : null,
        rawFileName: raw ? raw.name : null,
        imageMediaMetadata: isVideo ? viewable.videoMediaMetadata : viewable.imageMediaMetadata
      });
    }
  }

  const processedSubfolders = [];
  for (const folder of rawSubfolders) {
    let targetImage = null;

    // Search for cover image first
    const coverRes = await drive.files.list({
      q: `'${folder.id}' in parents and name contains 'cover' and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, thumbnailLink)',
      pageSize: 1,
    });
    if (coverRes.data.files && coverRes.data.files.length > 0) {
      targetImage = coverRes.data.files[0];
    }

    // Fall back to first image
    if (!targetImage) {
      const imagesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
        fields: 'files(id, name, thumbnailLink)',
        orderBy: 'name',
        pageSize: 1, 
      });
      if (imagesRes.data.files && imagesRes.data.files.length > 0) {
        targetImage = imagesRes.data.files[0];
      }
    }
    
    let thumbnailUrl = null;
    let baseCdnUrl = null;
    let fallbackUrl = null;
    if (targetImage) {
      fallbackUrl = `/api/image/${targetImage.id}`;
      baseCdnUrl = targetImage.thumbnailLink ? targetImage.thumbnailLink.replace(/=[^=]*$/, '') : null;
      thumbnailUrl = baseCdnUrl ? cdnProxy(baseCdnUrl, 's200-rw') : fallbackUrl;
    }

    processedSubfolders.push({
      id: folder.id,
      name: folder.name,
      thumbnailUrl,
      baseCdnUrl,
      fallbackUrl
    });
  }

  return {
    images,
    subfolders: processedSubfolders
  };
});

export const getImageStream = cache(async (fileId) => {
  if (!hasValidCredentials()) {
    throw new Error('No credentials found for Google Drive API');
  }
  const drive = google.drive({ version: 'v3', auth: getAuth() });
  
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  return response.data;
});

export async function getFolderDetails(folderId) {
  if (!hasValidCredentials()) {
    const mockFolders = getMockFolders();
    return mockFolders.find(f => f.id === folderId) || { id: folderId, name: 'Gallery' };
  }

  const drive = google.drive({ version: 'v3', auth: getAuth() });
  try {
    const res = await drive.files.get({
      fileId: folderId,
      fields: 'id, name'
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching folder details:', err);
    return { id: folderId, name: 'Gallery' };
  }
}
