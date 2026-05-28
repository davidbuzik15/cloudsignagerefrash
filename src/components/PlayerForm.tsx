import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/supabase';

interface PlayerFormProps {
  initialPlayer?: Player;
  onSubmit: (player: Partial<Player>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function PlayerForm({ initialPlayer, onSubmit, onCancel, isLoading }: PlayerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    public_slug: '',
    embed_html: '',
    content_type: 'html' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialPlayer) {
      setFormData({
        name: initialPlayer.name,
        public_slug: initialPlayer.public_slug,
        embed_html: initialPlayer.embed_html,
        content_type: initialPlayer.content_type,
      });
    }
  }, [initialPlayer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.public_slug.trim()) newErrors.public_slug = 'Slug is required';
    if (!/^[a-z0-9-_]+$/.test(formData.public_slug)) {
      newErrors.public_slug = 'Slug can only contain lowercase letters, numbers, hyphens, and underscores';
    }
    if (!formData.embed_html.trim()) newErrors.embed_html = 'Content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Player Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Main Menu, Reception Area"
          className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Slug Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Public Slug</label>
        <div className="flex items-center">
          <span className="text-gray-400 text-sm">/player/</span>
          <input
            type="text"
            value={formData.public_slug}
            onChange={(e) => setFormData({ ...formData, public_slug: e.target.value.toLowerCase() })}
            placeholder="main-menu"
            disabled={!!initialPlayer}
            className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>
        {errors.public_slug && <p className="text-red-500 text-sm mt-1">{errors.public_slug}</p>}
        <p className="text-gray-500 text-xs mt-1">This slug will be permanent and always the same</p>
      </div>

      {/* Content Type Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
        <select
          value={formData.content_type}
          onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
          className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white focus:outline-none focus:border-blue-500"
        >
          <option value="html">HTML/Embed Code</option>
          <option value="iframe">iFrame</option>
          <option value="url">URL</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Embed HTML Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Embed Code</label>
        <textarea
          value={formData.embed_html}
          onChange={(e) => setFormData({ ...formData, embed_html: e.target.value })}
          placeholder={`Paste your embed code here...\n\nExamples:\n<iframe src="..."></iframe>\n<div class="...">...</div>`}
          className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
          rows={10}
        />
        {errors.embed_html && <p className="text-red-500 text-sm mt-1">{errors.embed_html}</p>}
        <p className="text-gray-500 text-xs mt-1">Supports Canva, YouTube, Google Slides, Vimeo, and custom HTML</p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium transition-colors"
        >
          {isLoading ? 'Saving...' : initialPlayer ? 'Update Player' : 'Create Player'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg bg-dark-secondary border border-dark-tertiary text-white font-medium hover:border-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
