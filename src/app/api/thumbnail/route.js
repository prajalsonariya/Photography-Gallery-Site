export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url || !url.includes('googleusercontent.com')) {
      return new Response('Invalid URL', { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return new Response('Failed to fetch thumbnail', { status: response.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'image/webp');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000');
    
    return new Response(response.body, { headers });
  } catch (error) {
    console.error('Error proxying thumbnail:', error);
    return new Response('Thumbnail proxy error', { status: 500 });
  }
}
