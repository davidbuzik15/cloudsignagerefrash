-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  public_slug TEXT NOT NULL UNIQUE,
  embed_html TEXT NOT NULL,
  content_type TEXT DEFAULT 'html',
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT NOW(),
  refresh_version INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_slug ON players(public_slug);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS players_updated_at_trigger ON players;
CREATE TRIGGER players_updated_at_trigger
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION update_players_updated_at();

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access by slug
CREATE POLICY "Allow public read by slug" ON players
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON players
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated deletes
CREATE POLICY "Allow authenticated deletes" ON players
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated inserts
CREATE POLICY "Allow authenticated inserts" ON players
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
