import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/supabase';

interface PlayerGridProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onRefresh: (playerId: string) => void;
  onRefreshAll: () => void;
  onDelete: (playerId: string) => void;
  isRefreshing: boolean;
}

export function PlayerGrid({
  players,
  onEdit,
  onRefresh,
  onRefreshAll,
  onDelete,
  isRefreshing,
}: PlayerGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.public_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPreview = (html: string, maxLength: number = 100): string => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* Search and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => {
              const playerLink = `${window.location.origin}/player/${player.public_slug}`;
              return (
                <div
                  key={player.id}
                  className="rounded-lg bg-dark-secondary border border-dark-tertiary p-4 hover:border-blue-500 transition-colors"
                >
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-white text-lg truncate">{player.name}</h3>
                    <p className="text-xs text-gray-400 truncate">/{player.public_slug}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        player.is_online ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {player.is_online ? 'Online' : 'Offline'}
                    </span>
                    {player.last_seen && (
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(player.last_seen).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="mb-3 p-2 rounded bg-dark-tertiary">
                    <p className="text-xs text-gray-300 line-clamp-3">
                      {getPreview(player.embed_html)}
                    </p>
                  </div>

                  {/* Content Type Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 rounded text-xs bg-dark-tertiary text-gray-300">
                      {player.content_type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onEdit(player)}
                      className="px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRefresh(player.id)}
                      className="px-2 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => window.open(playerLink, '_blank')}
                      className="px-2 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => copyToClipboard(playerLink)}
                      className="px-2 py-1.5 rounded bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => onDelete(player.id)}
                      className="col-span-2 px-2 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
