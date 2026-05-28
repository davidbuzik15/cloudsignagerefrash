import { useEffect, useState } from 'react';
import { supabase, Player } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime(slug?: string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let channel: RealtimeChannel | null = null;

    async function setupRealtime() {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial data
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('public_slug', slug)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setPlayer(data as Player);

        // Subscribe to realtime updates
        channel = supabase
          .channel(`players:${slug}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: `public_slug=eq.${slug}`,
            },
            (payload) => {
              if (payload.new) {
                setPlayer(payload.new as Player);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Realtime setup error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [slug]);

  return { player, loading, error };
}
