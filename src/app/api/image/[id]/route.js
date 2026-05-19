import { getImageStream } from '@/lib/drive';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';
    const mimeType = searchParams.get('mimeType') || 'image/jpeg';
    const filename = searchParams.get('filename') || 'download';

    const stream = await getImageStream(id);
    
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000');
    
    if (isDownload) {
      headers.set('Content-Type', 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      headers.set('Content-Type', mimeType);
      headers.set('Content-Disposition', `inline; filename="${filename}"`);
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Image not found or error fetching', { status: 404 });
  }
}
