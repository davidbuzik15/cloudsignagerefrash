import { useEffect, useState } from 'react';
import { CachedPlayer, getPlayerFromCache, savePlayerToCache, getContentFromCache, saveContentToCache } from '@/lib/cache';

export function useCache(slug: string) {
  const [cachedPlayer, setCachedPlayer] = useState<CachedPlayer | null>(null);
  const [cachedContent, setCachedContent] = useState<string | null>(null);

  useEffect(() => {
    const player = getPlayerFromCache(slug);
    setCachedPlayer(player);

    const content = getContentFromCache(slug);
    setCachedContent(content);
  }, [slug]);

  return {
    cachedPlayer,
    cachedContent,
    savePlayer: (player: CachedPlayer) => {
      savePlayerToCache(player);
      setCachedPlayer(player);
    },
    saveContent: (content: string) => {
      saveContentToCache(slug, content);
      setCachedContent(content);
    },
  };
}
