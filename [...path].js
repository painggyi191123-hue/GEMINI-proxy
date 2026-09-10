export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  pathParts.shift(); // remove 'api'
  const targetPath = '/' + pathParts.join('/');
  
  const targetUrl = 'https://generativelanguage.googleapis.com' + targetPath + url.search;

  const newHeaders = new Headers(request.headers);
  newHeaders.delete('host');
  newHeaders.delete('x-forwarded-for');
  newHeaders.delete('x-real-ip');

  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow'
  });

  try {
    const apiResponse = await fetch(newRequest);
    const response = new Response(apiResponse.body, apiResponse);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', '*');
    return response;
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

