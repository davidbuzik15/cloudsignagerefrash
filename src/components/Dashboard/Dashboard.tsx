import React, { useState, useEffect } from 'react';
import { supabase, Player } from '@/lib/supabase';
import { PlayerForm } from './PlayerForm';
import { PlayerGrid } from './PlayerGrid';

export function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Load players
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (formData: Partial<Player>) => {
    try {
      setFormLoading(true);

      if (editingPlayer) {
        // Update existing player
        const { error } = await supabase
          .from('players')
          .update({
            name: formData.name,
            embed_html: formData.embed_html,
            content_type: formData.content_type,
            refresh_version: editingPlayer.refresh_version + 1,
          })
          .eq('id', editingPlayer.id);

        if (error) throw error;
      } else {
        // Create new player
        const { error } = await supabase.from('players').insert([
          {
            name: formData.name,
            public_slug: formData.public_slug,
            embed_html: formData.embed_html,
            content_type: formData.content_type,
            refresh_version: 0,
          },
        ]);

        if (error) throw error;
      }

      await loadPlayers();
      setShowForm(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error('Failed to submit form:', err);
      alert('Failed to save player. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleRefresh = async (playerId: string) => {
    try {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      const { error } = await supabase
        .from('players')
        .update({ refresh_version: player.refresh_version + 1 })
        .eq('id', playerId);

      if (error) throw error;
      await loadPlayers();
    } catch (err) {
      console.error('Failed to refresh player:', err);
      alert('Failed to refresh player.');
    }
  };

  const handleRefreshAll = async () => {
    try {
      setIsRefreshingAll(true);
      const updates = players.map((p) => ({
        ...p,
        refresh_version: p.refresh_version + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('players')
          .update({ refresh_version: update.refresh_version })
          .eq('id', update.id);

        if (error) throw error;
      }

      await loadPlayers();
    } catch (err) {
      console.error('Failed to refresh all:', err);
      alert('Failed to refresh all players.');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      const { error } = await supabase.from('players').delete().eq('id', playerId);

      if (error) throw error;
      await loadPlayers();
    } catch (err) {
      console.error('Failed to delete player:', err);
      alert('Failed to delete player.');
    }
  };

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">Presentv Player</h1>
            <button
              onClick={() => {
                setEditingPlayer(null);
                setShowForm(!showForm);
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Player'}
            </button>
          </div>
          <p className="text-gray-400">Digital Signage Management</p>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 p-6 rounded-lg bg-dark-secondary border border-dark-tertiary">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingPlayer ? 'Edit Player' : 'Create New Player'}
            </h2>
            <PlayerForm
              initialPlayer={editingPlayer || undefined}
              onSubmit={handleSubmitForm}
              onCancel={() => {
                setShowForm(false);
                setEditingPlayer(null);
              }}
              isLoading={formLoading}
            />
          </div>
        )}

        {/* Players Grid */}
        {!showForm && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading players...</p>
              </div>
            ) : (
              <PlayerGrid
                players={players}
                onEdit={handleEdit}
                onRefresh={handleRefresh}
                onRefreshAll={handleRefreshAll}
                onDelete={handleDelete}
                isRefreshing={isRefreshingAll}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
