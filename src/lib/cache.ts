// Cache management for offline support

const CACHE_PREFIX = 'presentv_player_';
const CACHE_VERSION = 'v1';

export interface CachedPlayer {
  id: string;
  name: string;
  public_slug: string;
  embed_html: string;
  content_type: 'iframe' | 'html' | 'url' | 'video';
  refresh_version: number;
  timestamp: number;
}

export function getCacheKey(slug: string, type: 'player' | 'content'): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${type}_${slug}`;
}

export function getCacheContentKey(slug: string): string {
  return getCacheKey(slug, 'content');
}

export function getCachePlayerKey(slug: string): string {
  return getCacheKey(slug, 'player');
}

// LocalStorage methods
export function savePlayerToCache(player: CachedPlayer): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getCachePlayerKey(player.public_slug);
    localStorage.setItem(key, JSON.stringify(player));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function getPlayerFromCache(slug: string): CachedPlayer | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getCachePlayerKey(slug);
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

export function saveContentToCache(slug: string, html: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getCacheContentKey(slug);
    localStorage.setItem(key, html);
  } catch (error) {
    console.warn('Failed to save content to localStorage:', error);
  }
}

export function getContentFromCache(slug: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getCacheContentKey(slug);
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read content from localStorage:', error);
    return null;
  }
}

export function clearPlayerCache(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getCachePlayerKey(slug));
    localStorage.removeItem(getCacheContentKey(slug));
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

// Cache API methods (for more robust offline support)
export async function saveToCacheAPI(slug: string, html: string): Promise<void> {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
    const response = new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
    await cache.put(`${CACHE_PREFIX}content_${slug}`, response);
  } catch (error) {
    console.warn('Failed to save to Cache API:', error);
  }
}

export async function getFromCacheAPI(slug: string): Promise<string | null> {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
    const response = await cache.match(`${CACHE_PREFIX}content_${slug}`);
    return response ? await response.text() : null;
  } catch (error) {
    console.warn('Failed to read from Cache API:', error);
    return null;
  }
}
