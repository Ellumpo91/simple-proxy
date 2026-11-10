// Thin pass-through to the official YouTube Data API v3 for the web app in
// /app. Keeps the API key on the server (env YOUTUBE_API_KEY).

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const ALLOWED_ENDPOINTS = ['search', 'videos', 'channels'];

export default defineEventHandler(async (event) => {
  const endpoint = getRouterParam(event, 'endpoint') ?? '';
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    setResponseStatus(event, 404);
    return { error: 'Unknown endpoint' };
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    setResponseStatus(event, 501);
    return { error: 'YOUTUBE_API_KEY is not configured on the server' };
  }

  const params = new URLSearchParams();
  Object.entries(getQuery(event)).forEach(([name, value]) => {
    if (name !== 'key' && typeof value === 'string') params.set(name, value);
  });
  params.set('key', key);

  const response = await fetch(`${API_BASE}/${endpoint}?${params}`);
  setResponseStatus(event, response.status);
  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8');
  if (response.ok)
    setResponseHeader(event, 'cache-control', 'public, max-age=300');
  return response.text();
});
