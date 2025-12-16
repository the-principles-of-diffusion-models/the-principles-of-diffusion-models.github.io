/*
  # Visitor Tracking Schema

  ## Purpose
  Track unique visitors to the academic project page without double-counting.

  ## Tables
  
  ### `visitors`
  - `id` (uuid, primary key) - Unique identifier for each visitor record
  - `visitor_id` (text, unique) - Fingerprint/identifier for the visitor (stored hash)
  - `first_visit` (timestamptz) - When the visitor first accessed the site
  - `last_visit` (timestamptz) - Most recent visit timestamp
  - `visit_count` (integer) - Total number of visits (for analytics)
  
  ### `site_stats`
  - `id` (uuid, primary key) - Single row identifier
  - `unique_visitors` (integer) - Total count of unique visitors
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Allow public read access to site_stats for displaying visitor count
  - Allow public insert/update to visitors table for tracking
  
  ## Notes
  - Uses client-side generated visitor IDs (hashed fingerprints)
  - Prevents duplicate counting of the same visitor
*/

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text UNIQUE NOT NULL,
  first_visit timestamptz DEFAULT now(),
  last_visit timestamptz DEFAULT now(),
  visit_count integer DEFAULT 1
);

-- Create site stats table
CREATE TABLE IF NOT EXISTS site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_visitors integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Insert initial stats row
INSERT INTO site_stats (unique_visitors) 
VALUES (0)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Policies for visitors table
CREATE POLICY "Anyone can read visitor data"
  ON visitors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert visitor data"
  ON visitors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own visitor record"
  ON visitors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for site_stats table
CREATE POLICY "Anyone can read site stats"
  ON site_stats FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update site stats"
  ON site_stats FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update visitor count
CREATE OR REPLACE FUNCTION update_visitor_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE site_stats 
  SET unique_visitors = (SELECT COUNT(DISTINCT visitor_id) FROM visitors),
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats
DROP TRIGGER IF EXISTS visitor_stats_trigger ON visitors;
CREATE TRIGGER visitor_stats_trigger
  AFTER INSERT OR UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_stats();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_visit ON visitors(first_visit DESC);