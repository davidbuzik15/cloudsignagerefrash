import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { useCache } from '@/hooks/useCache';
import { sanitizeEmbedHTML } from '@/lib/sanitize';
import { savePlayerToCache, saveContentToCache } from '@/lib/cache';

interface PlayerContentProps {
  slug: string;
}

function PlayerContent({ slug }: PlayerContentProps) {
  const { player, loading, error } = useRealtime(slug);
  const cache = useCache(slug);
  const [displayContent, setDisplayContent] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [previousVersion, setPreviousVersion] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle player updates and refresh version changes
  useEffect(() => {
    if (player) {
      // Save to cache
      savePlayerToCache({
        id: player.id,
        name: player.name,
        public_slug: player.public_slug,
        embed_html: player.embed_html,
        content_type: player.content_type,
        refresh_version: player.refresh_version,
        timestamp: Date.now(),
      });

      // Check if refresh version changed
      if (player.refresh_version !== previousVersion) {
        setPreviousVersion(player.refresh_version);
        setIsRefreshing(true);

        // Sanitize and set new content
        const sanitized = sanitizeEmbedHTML(player.embed_html);
        saveContentToCache(slug, sanitized);
        setDisplayContent(sanitized);

        // Stop refreshing animation
        setTimeout(() => setIsRefreshing(false), 500);
      }
    } else if (!loading && !error && cache.cachedPlayer) {
      // Use cached player if available and no player from DB
      const sanitized = sanitizeEmbedHTML(cache.cachedPlayer.embed_html);
      setDisplayContent(sanitized);
    }
  }, [player, previousVersion, slug, loading, error, cache]);

  // Fallback to cache if offline or error
  useEffect(() => {
    if (!isOnline || error) {
      if (cache.cachedContent) {
        setDisplayContent(cache.cachedContent);
      }
    }
  }, [isOnline, error, cache.cachedContent]);

  // Show nothing while loading (until content is ready)
  if (loading && !displayContent && !cache.cachedContent) {
    return <div className="w-full h-full bg-black" />;
  }

  return (
    <div className="w-full h-full overflow-hidden bg-black relative">
      {/* Content Container */}
      <div
        className={`w-full h-full transition-opacity duration-500 ${
          isRefreshing ? 'opacity-95' : 'opacity-100'
        }`}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      {/* Status Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 text-xs font-mono text-gray-500 pointer-events-none">
          <div>{isOnline ? '🟢 Online' : '🔴 Offline'}</div>
          <div>v{player?.refresh_version || 0}</div>
        </div>
      )}
    </div>
  );
}

export default function PlayerPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug || typeof slug !== 'string') {
    return <div className="w-full h-full bg-black" />;
  }

  return (
    <>
      <Head>
        <title>Presentv Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Digital Signage Player" />
      </Head>
      <PlayerContent slug={slug} />
    </>
  );
}
